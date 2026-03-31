// Syndicated Bar Theatre Kitchen — Axios + Cheerio via Veezi ticketing page
// URL: https://ticketing.useast.veezi.com/sessions/?siteToken=dxdq5wzbef6bz2sjqt83ytzn1c
// Structure: div.date > h3.date-title ("Monday 30, March") + div.film > h3.title + ul.session-times > li > a > time

const axios = require('axios');
const cheerio = require('cheerio');

const THEATER = 'Syndicated Bar Theatre Kitchen';
const THEATER_ID = 'syndicated';
const VEEZI_URL = 'https://ticketing.useast.veezi.com/sessions/?siteToken=dxdq5wzbef6bz2sjqt83ytzn1c';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

const MONTH_MAP = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
};

// Parse "Monday 30, March" → "2026-03-30"
function parseDateTitle(str, year) {
  // Format: "DayName DD, MonthName"
  const match = str.match(/(\d{1,2}),?\s+(\w+)/i);
  if (!match) return null;
  const day = String(parseInt(match[1], 10)).padStart(2, '0');
  const monthStr = match[2].toLowerCase();
  const month = MONTH_MAP[monthStr];
  if (!month) return null;
  return `${year}-${month}-${day}`;
}

async function scrape(weekDates) {
  const weekSet = new Set(weekDates);
  const year = new Date().getFullYear();
  const results = [];

  const res = await axios.get(VEEZI_URL, { headers: HEADERS, timeout: 15000 });
  const $ = cheerio.load(res.data);

  $('div.date').each((_, dateDiv) => {
    const dateTitleEl = $(dateDiv).find('h3.date-title').first();
    const dateStr = dateTitleEl.text().trim();
    const date = parseDateTitle(dateStr, year);
    if (!date || !weekSet.has(date)) return;

    $(dateDiv).find('div.film').each((_, filmEl) => {
      const movie = $(filmEl).find('h3.title').first().text().trim();
      if (!movie) return;

      const showtimes = [];
      $(filmEl).find('.session-times li time').each((_, timeEl) => {
        const t = $(timeEl).text().trim();
        if (t) showtimes.push(t);
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
          url: 'https://syndicatedbk.com',
        });
      }
    });
  });

  return results;
}

module.exports = scrape;
