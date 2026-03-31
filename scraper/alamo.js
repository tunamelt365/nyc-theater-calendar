// Alamo Drafthouse — JSON API
// API: https://drafthouse.com/s/mother/v2/schedule/market/nyc
// Returns sessions (showings) + presentations (film details)
// Cinema IDs: Lower Manhattan = "2103", Downtown Brooklyn = "2101"

const axios = require('axios');

const API_URL = 'https://drafthouse.com/s/mother/v2/schedule/market/nyc';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

const CINEMA_IDS = {
  manhattan: '2103',   // Lower Manhattan (28 Liberty St)
  brooklyn: '2101',    // Downtown Brooklyn (445 Albee Square West)
};

async function scrape(browser, locationKey, theaterName, weekDates) {
  const theaterId = locationKey === 'manhattan' ? 'alamo-manhattan' : 'alamo-brooklyn';
  const cinemaId = CINEMA_IDS[locationKey];
  const weekSet = new Set(weekDates);

  const res = await axios.get(API_URL, { headers: HEADERS, timeout: 15000 });
  const data = res.data?.data;

  if (!data) throw new Error('Unexpected Alamo API response structure');

  // Build a map of presentationSlug → film title
  const presentations = data.presentations || [];
  const titleMap = new Map();
  presentations.forEach(p => {
    const title = p.show?.title || p.event?.title || p.slug;
    if (title) titleMap.set(p.slug, title);
  });

  // Filter sessions for this cinema + current week
  const sessions = data.sessions || [];
  const filtered = sessions.filter(s =>
    s.cinemaId === cinemaId &&
    weekSet.has(s.businessDateClt) &&
    !s.isHidden
  );

  // Group by date+movie
  const map = new Map();
  filtered.forEach(s => {
    const movie = titleMap.get(s.presentationSlug) || s.presentationSlug;
    const date = s.businessDateClt;

    // Parse local showtime from showTimeClt (already local ET)
    let showtime = null;
    if (s.showTimeClt) {
      const timePart = s.showTimeClt.slice(11, 16); // "HH:MM"
      const [h, m] = timePart.split(':').map(Number);
      const meridiem = h >= 12 ? 'PM' : 'AM';
      const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      showtime = `${h12}:${String(m).padStart(2, '0')} ${meridiem}`;
    }
    if (!showtime) return;

    const key = `${date}|${movie}`;
    if (!map.has(key)) {
      map.set(key, {
        theater: theaterName,
        theaterId,
        date,
        movie,
        showtimes: [],
        format: null,
        notes: null,
        url: `https://drafthouse.com/nyc/show/${s.presentationSlug}`,
      });
    }
    map.get(key).showtimes.push(showtime);
  });

  return Array.from(map.values()).map(e => ({
    ...e,
    showtimes: [...new Set(e.showtimes)].sort(),
  }));
}

module.exports = scrape;
