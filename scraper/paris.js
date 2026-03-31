// Paris Theater — Puppeteer (Next.js app, single-day schedule widget)
// URL: https://www.paristheaternyc.com
// Day picker: div[class*="home_day__"][role="button"] with aria-label="Select MON"
//             span[class*="home_weekDate__"] contains "3/30"
// Schedule container: div[class*="home_schedule_list__"]
// Each item: div[class*="home_schedule_item__"]
//   title: a[class*="home_title__"]
//   showtimes: div[class*="home_time__"] > a (text: "1:00 PM")

const THEATER = 'Paris Theater';
const THEATER_ID = 'paris';
const URL = 'https://www.paristheaternyc.com';

async function scrape(browser, weekDates) {
  const weekSet = new Set(weekDates);
  const year = new Date().getFullYear();
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const results = [];

  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(r => setTimeout(r, 6000));

    // Get available day picker entries: { ariaLabel, dateStr } e.g. { ariaLabel: "Select TUE", dateStr: "3/31" }
    const dayPickerEntries = await page.evaluate(() => {
      const days = Array.from(document.querySelectorAll('[role="button"]'))
        .filter(el => el.getAttribute('aria-label')?.startsWith('Select '));
      return days.map(el => {
        const dateSpan = el.querySelector('[class*="home_weekDate__"]');
        return {
          ariaLabel: el.getAttribute('aria-label'),
          dateStr: dateSpan ? dateSpan.textContent.trim() : null,
        };
      });
    });

    // Map "3/30" → "2026-03-30"
    function toIso(dateStr) {
      if (!dateStr) return null;
      const m = dateStr.match(/^(\d{1,2})\/(\d{1,2})$/);
      if (!m) return null;
      return `${year}-${String(parseInt(m[1], 10)).padStart(2, '0')}-${String(parseInt(m[2], 10)).padStart(2, '0')}`;
    }

    // Extract current day's schedule
    async function extractCurrentSchedule(date) {
      return page.evaluate((dateVal, theater, theaterId) => {
        const items = document.querySelectorAll('[class*="home_schedule_item__"]');
        const entries = [];
        items.forEach(item => {
          const titleEl = item.querySelector('[class*="home_title__"]');
          if (!titleEl) return;
          const movie = titleEl.textContent.trim();
          if (!movie) return;

          const showtimes = Array.from(item.querySelectorAll('[class*="home_time__"] a'))
            .map(a => a.textContent.trim())
            .filter(t => /\d:\d{2}\s*(AM|PM)/i.test(t));

          const url = (titleEl.tagName === 'A' && titleEl.href)
            ? titleEl.href
            : 'https://www.paristheaternyc.com';

          if (showtimes.length > 0) {
            entries.push({ theater, theaterId, date: dateVal, movie, showtimes, format: null, notes: null, url });
          }
        });
        return entries;
      }, date, THEATER, THEATER_ID);
    }

    // Process each day in the picker that falls within our week
    for (const entry of dayPickerEntries) {
      const date = toIso(entry.dateStr);
      if (!date || !weekSet.has(date)) continue;

      // Click the day picker div
      await page.evaluate((ariaLabel) => {
        const el = Array.from(document.querySelectorAll('[role="button"]'))
          .find(e => e.getAttribute('aria-label') === ariaLabel);
        if (el) el.click();
      }, entry.ariaLabel);

      await new Promise(r => setTimeout(r, 800));

      const dayEntries = await extractCurrentSchedule(date);
      results.push(...dayEntries);
    }

    // Also grab the currently-displayed day (today's date if already shown)
    // Find which date is currently active (home_current_day class)
    const currentDate = await page.evaluate((yearVal) => {
      const current = document.querySelector('[class*="home_current_day__"]');
      if (!current) return null;
      const dateSpan = current.querySelector('[class*="home_weekDate__"]');
      if (!dateSpan) return null;
      const m = dateSpan.textContent.trim().match(/^(\d{1,2})\/(\d{1,2})$/);
      if (!m) return null;
      return `${yearVal}-${String(parseInt(m[1], 10)).padStart(2, '0')}-${String(parseInt(m[2], 10)).padStart(2, '0')}`;
    }, year);

    // If current day wasn't in dayPickerEntries (it may not have role="button"), grab it now
    if (currentDate && weekSet.has(currentDate) && !results.some(r => r.date === currentDate)) {
      const todayEntries = await extractCurrentSchedule(currentDate);
      results.push(...todayEntries);
    }

  } finally {
    await page.close();
  }

  // Merge duplicates
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
