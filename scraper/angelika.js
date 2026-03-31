// Angelika Film Center — Puppeteer (to get bearer token) + Axios (Reading Cinemas API)
// API: https://production-api.readingcinemas.com/films?countryId=6&cinemaId=XXXX&status=getShows&flag=initial&selectedDate=
// Cinema IDs: NYC = "0000000005", Village East = "0000000004"
// Showtime structure: movie.showdates[].showtypes[].showtimes[].date_time ("2026-03-30T14:50:00-04")

const axios = require('axios');

const CINEMA_IDS = {
  nyc: '0000000005',
  villageeast: '0000000004',
};

const THEATER_IDS = {
  nyc: 'angelika-nyc',
  villageeast: 'angelika-village-east',
};

const API_BASE = 'https://production-api.readingcinemas.com';

function dateTimeToShowtime(dateTimeStr) {
  // "2026-03-30T14:50:00-04" → "2:50 PM"
  const match = dateTimeStr.match(/T(\d{2}):(\d{2}):/);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const min = match[2];
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  return `${hour}:${min} ${meridiem}`;
}

// Fetch a bearer token by loading the Angelika page via Puppeteer
async function getBearerToken(browser, locationSlug) {
  const url = `https://angelikafilmcenter.com/${locationSlug}`;
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  let token = null;
  page.on('request', req => {
    if (req.url().includes('/films?') && req.url().includes('readingcinemas.com')) {
      const auth = req.headers()['authorization'];
      if (auth) token = auth;
    }
  });

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 8000));
  } finally {
    await page.close().catch(() => {});
  }
  return token;
}

async function scrapeLocation(token, cinemaId, theaterName, theaterId, weekDates) {
  const results = [];
  const headers = {
    Authorization: token,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  // API returns one day at a time — query each day in the week in parallel
  const dayResults = await Promise.all(weekDates.map(async (date) => {
    try {
      const res = await axios.get(`${API_BASE}/films`, {
        params: { countryId: '6', cinemaId, status: 'getShows', flag: 'initial', selectedDate: date },
        headers,
        timeout: 15000,
      });

      const movies = res.data?.nowShowing?.data?.movies || [];
      const entries = [];

      movies.forEach(movie => {
        const name = movie.name;
        if (!name) return;

        (movie.showdates || []).forEach(showdate => {
          if (showdate.date !== date) return;

          const showtimes = [];
          (showdate.showtypes || []).forEach(showtype => {
            (showtype.showtimes || []).forEach(st => {
              if (st.date_time && st.enabled !== false) {
                const t = dateTimeToShowtime(st.date_time);
                if (t) showtimes.push(t);
              }
            });
          });

          if (showtimes.length > 0) {
            entries.push({
              theater: theaterName,
              theaterId,
              date,
              movie: name,
              showtimes: [...new Set(showtimes)].sort(),
              format: null,
              notes: null,
              url: `https://angelikafilmcenter.com/${cinemaId === '0000000005' ? 'nyc' : 'villageeast'}`,
            });
          }
        });
      });

      return entries;
    } catch (_) {
      return [];
    }
  }));

  dayResults.forEach(entries => results.push(...entries));
  return results;
}

async function scrape(browser, locationSlug, theaterName, weekDates) {
  const theaterId = THEATER_IDS[locationSlug];
  const cinemaId = CINEMA_IDS[locationSlug];

  const token = await getBearerToken(browser, locationSlug);
  if (!token) throw new Error(`Angelika ${locationSlug}: could not get bearer token`);

  return scrapeLocation(token, cinemaId, theaterName, theaterId, weekDates);
}

module.exports = scrape;
