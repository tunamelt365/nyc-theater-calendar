// Nitehawk — Axios + Cheerio
// Strategy:
//   1. Fetch the main location page to get available date URLs
//   2. For each date in the current week, fetch that date's listing page
//   3. Collect all unique movie page URLs (with ?date= param)
//   4. Fetch each movie page once; parse .showtime elements with data-date (Unix timestamp)

const axios = require('axios');
const cheerio = require('cheerio');

const LOCATION_BASE = {
  williamsburg: 'https://nitehawkcinema.com/williamsburg',
  prospectpark: 'https://nitehawkcinema.com/prospectpark',
};

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

function unixToLocalDate(unixSec) {
  // Convert Unix timestamp (seconds) to ET ISO date string
  const d = new Date(unixSec * 1000);
  return d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); // YYYY-MM-DD
}

function unixToLocalTime(unixSec) {
  const d = new Date(unixSec * 1000);
  return d.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

async function scrape(locationKey, theaterName, weekDates) {
  const theaterId = locationKey === 'williamsburg' ? 'nitehawk-williamsburg' : 'nitehawk-prospectpark';
  const base = LOCATION_BASE[locationKey];
  const weekSet = new Set(weekDates);
  const results = [];

  // Step 1: Get available date links from main page
  let mainHtml;
  try {
    const res = await axios.get(`${base}/`, { headers: HEADERS, timeout: 15000 });
    mainHtml = res.data;
  } catch (err) {
    throw new Error(`Could not load Nitehawk main page: ${err.message}`);
  }

  const $main = cheerio.load(mainHtml);
  const datePageUrls = new Map(); // date → URL

  $main('.date-box').each((_, el) => {
    const date = $main(el).attr('data-date');
    const href = $main(el).attr('href');
    if (date && href && weekSet.has(date)) {
      datePageUrls.set(date, href.startsWith('http') ? href : base + href);
    }
  });

  if (datePageUrls.size === 0) {
    console.warn(`[nitehawk] No matching week dates found in date selector for ${locationKey}`);
    return results;
  }

  // Step 2: For each available week date, collect movie page links
  const moviePageUrls = new Map(); // movieSlug → full URL (deduplicated)

  for (const [date, url] of datePageUrls) {
    try {
      await new Promise(r => setTimeout(r, 300));
      const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
      const $ = cheerio.load(res.data);

      $('a.overlay-link').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        // Add date param to link if not already present
        const movieUrl = href.includes('?') ? href : `${href}?date=${date}`;
        // Dedup by base slug
        const slug = href.split('/movies/')[1]?.split('/')[0] || href;
        if (!moviePageUrls.has(slug)) moviePageUrls.set(slug, movieUrl);
      });
    } catch (err) {
      console.warn(`[nitehawk] Failed to load date page ${url}: ${err.message}`);
    }
  }

  // Step 3: Fetch each movie page and parse all showtimes for the week
  for (const [slug, movieUrl] of moviePageUrls) {
    try {
      await new Promise(r => setTimeout(r, 400));
      const res = await axios.get(movieUrl, { headers: HEADERS, timeout: 15000 });
      const $ = cheerio.load(res.data);

      const movie = $('.show-title, h1.show-title, [class*="show-title"]').first().text().trim()
        || $('h1').first().text().trim();
      if (!movie) continue;

      const formatEl = $('.show-subhead, [class*="subhead"]').first();
      const format = formatEl.length ? formatEl.text().trim() || null : null;

      // Each showtime <li> has data-date (Unix timestamp) and .showtime link with time text
      $('li[data-date]').each((_, li) => {
        const unixTs = parseInt($(li).attr('data-date'), 10);
        if (!unixTs) return;

        const isoDate = unixToLocalDate(unixTs);
        if (!weekSet.has(isoDate)) return;

        const timeEl = $(li).find('a.showtime, .showtime');
        const rawTime = timeEl.text().replace(/OC|CC|AD|\n/gi, '').trim();
        if (!rawTime) return;

        const showtime = rawTime.toLowerCase().includes('m')
          ? rawTime.replace(/\s+/g, ' ').trim()
          : rawTime;

        // Normalize: "3:00 pm" → "3:00 PM"
        const normalizedTime = showtime.replace(/(am|pm)/i, m => ' ' + m.toUpperCase()).replace(/\s+/g, ' ').trim();

        results.push({
          theater: theaterName,
          theaterId,
          date: isoDate,
          movie,
          showtimes: [normalizedTime],
          format: format || null,
          notes: null,
          url: movieUrl.split('?')[0], // strip ?date= param to get stable film page URL
        });
      });
    } catch (err) {
      console.warn(`[nitehawk] Failed movie page ${movieUrl}: ${err.message}`);
    }
  }

  // Merge entries with same theater+date+movie
  const map = new Map();
  results.forEach(e => {
    const key = `${e.date}|${e.movie}`;
    if (map.has(key)) {
      map.get(key).showtimes.push(...e.showtimes);
    } else {
      map.set(key, { ...e, showtimes: [...e.showtimes] });
    }
  });

  return Array.from(map.values()).map(e => ({
    ...e,
    showtimes: [...new Set(e.showtimes)],
  }));
}

module.exports = scrape;
