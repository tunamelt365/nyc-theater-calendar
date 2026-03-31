// Film Forum — Axios + Cheerio
// Structure: fetch any current film page, which contains a week schedule
// in tabs #tabs-0 (Mon) through #tabs-6 (Sun).
// Each tab has <p> blocks: <strong><a>TITLE</a></strong><br><span>time</span>...
// Times have no AM/PM — assume PM for all cinema times.

const axios = require('axios');
const cheerio = require('cheerio');
const { normalizeTime } = require('./utils');

const THEATER = 'Film Forum';
const THEATER_ID = 'filmforum';
const BASE = 'https://filmforum.org';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

// Convert a time string like "1:00" or "12:30" to "1:00 PM" / "12:30 PM"
// For cinema times without explicit AM/PM, default to PM.
// Exception: very late shows (1am, 2am) are encoded as hours 1-4 which are rare.
function cinemaTimeToPM(str) {
  str = str.trim();
  if (/am|pm/i.test(str)) return normalizeTime(str);
  // No meridiem — default to PM
  return normalizeTime(str + ' pm');
}

async function scrape(weekDates) {
  // First get the now-showing page to find a current film slug
  const listRes = await axios.get(`${BASE}/now-showing`, { headers: HEADERS, timeout: 15000 });
  const $list = cheerio.load(listRes.data);

  // Find first film-details element with a SHOWTIMES link
  let filmUrl = null;
  $list('.film-details').each((_, el) => {
    if (filmUrl) return;
    const link = $list(el).find('a[href*="/film/"]').first().attr('href');
    if (link) filmUrl = link.startsWith('http') ? link : BASE + link;
  });

  if (!filmUrl) throw new Error('Could not find any film link on Film Forum now-showing page');

  // Fetch the film page — it contains the full week schedule for ALL films
  const filmRes = await axios.get(filmUrl, { headers: HEADERS, timeout: 15000 });
  const $ = cheerio.load(filmRes.data);

  const results = [];

  // Each tab #tabs-0 through #tabs-6 = Mon through Sun = weekDates[0..6]
  for (let i = 0; i <= 6; i++) {
    const tabEl = $(`#tabs-${i}`);
    if (!tabEl.length) continue;
    const date = weekDates[i];
    if (!date) continue;

    // Each <p> in this tab is one film
    tabEl.find('p').each((_, p) => {
      const titleEl = $(p).find('strong a, strong').first();
      const movie = titleEl.text().trim();
      if (!movie) return;

      const showtimes = [];
      $(p).find('span').each((_, span) => {
        const t = $(span).text().trim();
        if (/\d+:\d+/.test(t)) {
          showtimes.push(cinemaTimeToPM(t));
        }
      });

      if (showtimes.length > 0) {
        results.push({
          theater: THEATER,
          theaterId: THEATER_ID,
          date,
          movie,
          showtimes: [...new Set(showtimes)],
          format: null,
          notes: null,
          url: 'https://filmforum.org',
        });
      }
    });
  }

  return results;
}

module.exports = scrape;
