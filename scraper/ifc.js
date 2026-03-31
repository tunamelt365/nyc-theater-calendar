// IFC Center — Puppeteer for home page (JS-rendered film list) + Axios for film pages (static HTML)
// Home page: https://www.ifccenter.com — film links are JS-rendered
// Film page structure:
//   ul.schedule-list > li > div.details > p > strong (date: "Mon Mar 30")
//                                        > ul.times > li > span (time: "12:55 pm")

const axios = require('axios');
const cheerio = require('cheerio');
const { normalizeDate, normalizeTime } = require('./utils');

const THEATER = 'IFC Center';
const THEATER_ID = 'ifc';
const BASE = 'https://www.ifccenter.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

async function scrape(browser, weekDates) {
  const weekSet = new Set(weekDates);
  const year = new Date().getFullYear();
  const results = [];
  const page = await browser.newPage();
  await page.setUserAgent(HEADERS['User-Agent']);

  try {
    // Step 1: Get film links from the home page (requires JS)
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(r => setTimeout(r, 5000));

    const filmUrls = await page.evaluate((base) => {
      const links = new Set();
      document.querySelectorAll('a[href*="/films/"]').forEach(a => {
        const href = a.href;
        if (href && href !== `${base}/films/` && href.includes('/films/') && !href.includes('#')) {
          links.add(href);
        }
      });
      return [...links];
    }, BASE);

    if (filmUrls.length === 0) {
      console.warn('[ifc] No film links found on home page');
      return results;
    }

    // Step 2: Fetch each film page with Axios (static HTML has schedule)
    await Promise.all(filmUrls.map(async (url) => {
      try {
        const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        const $ = cheerio.load(res.data);

        const movie = $('h1').first().text().trim();
        if (!movie) return;

        // Format from page info (e.g. "35mm" in description)
        const pageText = $('body').text();
        const fmtMatch = pageText.match(/\b(35mm|70mm|DCP)\b/i);
        const format = fmtMatch ? fmtMatch[1].toUpperCase() : null;

        $('ul.schedule-list > li').each((_, li) => {
          const dateStr = $(li).find('div.details > p > strong').first().text().trim();
          if (!dateStr) return;

          const date = normalizeDate(dateStr, year);
          if (!date || !weekSet.has(date)) return;

          const showtimes = [];
          $(li).find('ul.times li span').each((_, span) => {
            const t = $(span).text().trim();
            const normalized = normalizeTime(t);
            if (normalized) showtimes.push(normalized);
          });

          if (showtimes.length > 0) {
            results.push({
              theater: THEATER,
              theaterId: THEATER_ID,
              date,
              movie,
              showtimes,
              format,
              notes: null,
              url,
            });
          }
        });
      } catch (_) {
        // Skip failed film pages
      }
    }));
  } finally {
    await page.close().catch(() => {});
  }

  // Merge same movie/date entries
  const map = new Map();
  results.forEach(e => {
    const key = `${e.date}|${e.movie}`;
    if (map.has(key)) {
      map.get(key).showtimes.push(...e.showtimes);
    } else {
      map.set(key, { ...e });
    }
  });

  return Array.from(map.values()).map(e => ({
    ...e,
    showtimes: [...new Set(e.showtimes)],
  }));
}

module.exports = scrape;
