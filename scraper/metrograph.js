// Metrograph — Puppeteer
// Structure: .day-selector-day[data-vars-ga-label] maps dates to index
//            .calendar-list-day (same order) contains films
//            Each film: h4>a.title, .film-metadata, .showtimes>a (times like "4:00pm")

const { normalizeTime } = require('./utils');

const THEATER = 'Metrograph';
const THEATER_ID = 'metrograph';
const URL = 'https://metrograph.com/calendar';

async function scrape(browser, weekDates) {
  const weekSet = new Set(weekDates);
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    const entries = await page.evaluate((theater, theaterId, weekDatesArr) => {
      const weekSet = new Set(weekDatesArr);
      const results = [];

      // Get ordered list of dates from day selector
      const dayBtns = document.querySelectorAll('.day-selector-day');
      const dates = [...dayBtns].map(btn => btn.getAttribute('data-vars-ga-label')).filter(Boolean);

      // Get ordered list of day content grids
      const dayGrids = document.querySelectorAll('.calendar-list-day');

      dayGrids.forEach((grid, i) => {
        const date = dates[i];
        if (!date || !weekSet.has(date)) return;

        grid.querySelectorAll('.item.film-thumbnail, .homepage-in-theater-movie').forEach(item => {
          const titleEl = item.querySelector('a.title, h4 a, .title');
          if (!titleEl) return;
          const movie = titleEl.textContent.trim();
          if (!movie) return;

          const metaEl = item.querySelector('.film-metadata');
          let format = null;
          if (metaEl) {
            const meta = metaEl.textContent;
            const fmtMatch = meta.match(/\b(35mm|70mm|DCP|16mm|digital)\b/i);
            if (fmtMatch) format = fmtMatch[1];
          }

          const showtimes = [];
          item.querySelectorAll('.showtimes a').forEach(a => {
            const t = a.textContent.trim();
            if (/\d+:\d+|\d+(am|pm)/i.test(t)) showtimes.push(t);
          });

          const url = (titleEl && titleEl.tagName === 'A' && titleEl.href)
            ? titleEl.href
            : 'https://metrograph.com/calendar';

          if (showtimes.length > 0) {
            results.push({ theater, theaterId, date, movie, showtimes, format: format || null, notes: null, url });
          }
        });
      });

      return results;
    }, THEATER, THEATER_ID, weekDates);

    return entries.map(e => ({
      ...e,
      showtimes: e.showtimes.map(t => normalizeTime(t)).filter(Boolean),
    }));
  } finally {
    await page.close();
  }
}

module.exports = scrape;
