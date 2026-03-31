// Roxy Cinema — Axios + Cheerio
// Home page: https://www.roxycinemanewyork.com
// Each screening page: /screenings/{slug}/
// Structure: h1.event-hero__title (title), p.event-hero__info (format/info)
//            button[data-date][data-time] for each showtime

const axios = require('axios');
const cheerio = require('cheerio');

const THEATER = 'Roxy Cinema';
const THEATER_ID = 'roxy';
const BASE_URL = 'https://www.roxycinemanewyork.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

async function scrape(browser, weekDates) {
  const weekSet = new Set(weekDates);

  // Step 1: Fetch homepage and collect unique screening URLs
  const homeRes = await axios.get(BASE_URL, { headers: HEADERS, timeout: 15000 });
  const $home = cheerio.load(homeRes.data);

  const screeningUrls = new Set();
  $home('a[href*="/screenings/"]').each((_, el) => {
    const href = $home(el).attr('href');
    if (href && href.includes('/screenings/') && !href.endsWith('/screenings/')) {
      screeningUrls.add(href.startsWith('http') ? href : `${BASE_URL}${href}`);
    }
  });

  // Step 2: Fetch each screening page in parallel
  const results = [];

  await Promise.all([...screeningUrls].map(async (url) => {
    try {
      const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
      const $ = cheerio.load(res.data);

      const movie = $('h1.event-hero__title').first().text().trim();
      if (!movie) return;

      // Detect format from info line (e.g. "Drama | 35mm | 2025")
      const infoText = $('p.event-hero__info').first().text().trim();
      const formatMatch = infoText.match(/\b(35mm|70mm|digital|DCP)\b/i);
      const format = formatMatch ? formatMatch[1].toUpperCase() : null;

      // Group showtimes by date
      const byDate = new Map();
      $('button[data-date][data-time]').each((_, el) => {
        const date = $(el).attr('data-date');
        const time = $(el).attr('data-time');
        if (!date || !time || !weekSet.has(date)) return;
        if (!byDate.has(date)) byDate.set(date, []);
        byDate.get(date).push(time);
      });

      byDate.forEach((showtimes, date) => {
        results.push({
          theater: THEATER,
          theaterId: THEATER_ID,
          date,
          movie,
          showtimes: [...new Set(showtimes)],
          format,
          notes: null,
          url,
        });
      });
    } catch (_) {
      // Skip failed screening pages
    }
  }));

  return results;
}

module.exports = scrape;
