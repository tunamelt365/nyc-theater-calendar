// Anthology Film Archives — Puppeteer
// Structure: td.calendar_day contains span.day (day number) and li.calendar_event
// Each event: "5:30 PM <br> <a>FILM TITLE</a>"
// Calendar is month-based; need to handle week spanning two months.

const THEATER = 'Anthology Film Archives';
const THEATER_ID = 'anthology';

async function scrape(browser, weekDates) {
  const weekSet = new Set(weekDates);

  // Determine which months we need to fetch (week may span two months)
  const months = new Set(weekDates.map(d => d.slice(0, 7))); // "YYYY-MM"

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const allResults = [];

  try {
    for (const yearMonth of months) {
      const [year, month] = yearMonth.split('-').map(Number);

      await page.goto(
        `https://anthologyfilmarchives.org/film_screenings/calendar?month=${String(month).padStart(2, '0')}&year=${year}`,
        { waitUntil: 'networkidle2', timeout: 25000 }
      );
      await new Promise(r => setTimeout(r, 1500));

      const entries = await page.evaluate((yearVal, monthVal, weekDatesArr) => {
        const weekSet = new Set(weekDatesArr);
        const results = [];

        document.querySelectorAll('td.calendar_day').forEach(td => {
          const daySpan = td.querySelector('span.day');
          if (!daySpan) return;

          const dayNum = parseInt(daySpan.textContent.trim(), 10);
          if (!dayNum) return;

          const isoDate = `${yearVal}-${String(monthVal).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          if (!weekSet.has(isoDate)) return;

          td.querySelectorAll('li.calendar_event').forEach(ev => {
            // Text node is the time, <a> is the title
            const titleEl = ev.querySelector('a');
            if (!titleEl) return;
            const movie = titleEl.textContent.trim();
            if (!movie) return;

            // Time is the text content before the <br>
            const rawText = ev.innerHTML;
            const timeMatch = rawText.match(/^\s*([\d:]+\s*(?:AM|PM))/i);
            if (!timeMatch) return;

            const rawTime = timeMatch[1].trim();
            const [timePart, meridiem] = rawTime.split(/\s+/);
            const [h, m] = timePart.split(':').map(Number);
            const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
            const showtime = `${h12}:${String(m).padStart(2, '0')} ${meridiem.toUpperCase()}`;

            const url = titleEl.href || 'https://anthologyfilmarchives.org/film_screenings/calendar';
            results.push({ date: isoDate, movie, showtime, url });
          });
        });

        return results;
      }, year, month, weekDates);

      entries.forEach(({ date, movie, showtime, url }) => {
        allResults.push({
          theater: THEATER,
          theaterId: THEATER_ID,
          date,
          movie,
          showtimes: [showtime],
          format: null,
          notes: null,
          url: url || 'https://anthologyfilmarchives.org/film_screenings/calendar',
        });
      });
    }
  } finally {
    await page.close();
  }

  // Merge duplicate movie entries per day
  const map = new Map();
  allResults.forEach(e => {
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
