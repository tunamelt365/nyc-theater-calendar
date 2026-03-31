// Quad Cinema — Puppeteer (JS-rendered React app, invalid SSL cert)
// Structure: h4>a (film title) followed by ul.showtimes-list with li>a links
// Each <a> links to Fandango with ?date=YYYY-MM-DD param
// Times formatted as "12.25pm" (dots instead of colons)

const THEATER = 'Quad Cinema';
const THEATER_ID = 'quad';
const URL = 'https://www.quadcinema.com/now-playing/';

function quadTimeTo12h(str) {
  // Converts "12.25pm" → "12:25 PM", "7.30pm" → "7:30 PM"
  str = str.trim();
  const match = str.match(/^(\d{1,2})\.(\d{2})\s?(am|pm)$/i);
  if (match) {
    return `${match[1]}:${match[2]} ${match[3].toUpperCase()}`;
  }
  return str;
}

async function scrape(browser, weekDates) {
  const weekSet = new Set(weekDates);
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Must ignore SSL cert error for quadcinema.com
  await page.setBypassCSP(true);

  try {
    await page.goto(URL, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    }).catch(() => {}); // SSL error is expected; page still loads

    await new Promise(r => setTimeout(r, 3000));

    const rawEntries = await page.evaluate(() => {
      const entries = [];
      document.querySelectorAll('h4').forEach(h4 => {
        const titleEl = h4.querySelector('a');
        if (!titleEl) return;
        const movie = titleEl.textContent.trim();
        if (!movie) return;

        const list = h4.nextElementSibling;
        if (!list || !list.classList.contains('showtimes-list')) return;

        list.querySelectorAll('li').forEach(li => {
          const a = li.querySelector('a');
          if (!a) return;
          const timeText = a.textContent.trim();
          const href = a.href;
          const dateMatch = href.match(/date=(\d{4}-\d{2}-\d{2})/);
          const date = dateMatch ? dateMatch[1] : null;
          const url = titleEl.href || 'https://www.quadcinema.com/now-playing/';
          entries.push({ movie, timeText, date, url });
        });
      });
      return entries;
    });

    // Group by date+movie
    const map = new Map();
    rawEntries.forEach(({ movie, timeText, date, url }) => {
      if (!date || !weekSet.has(date)) return;
      const key = `${date}|${movie}`;
      if (!map.has(key)) map.set(key, { movie, date, showtimes: [], url });
      map.get(key).showtimes.push(quadTimeTo12h(timeText));
    });

    return Array.from(map.values()).map(({ movie, date, showtimes, url }) => ({
      theater: THEATER,
      theaterId: THEATER_ID,
      date,
      movie,
      showtimes: [...new Set(showtimes)],
      format: null,
      notes: null,
      url,
    }));
  } finally {
    await page.close();
  }
}

module.exports = scrape;
