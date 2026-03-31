const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const { getCurrentWeekDates, getWeekBounds } = require('./utils');

function getChromePath() {
  return process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath();
}

const metrograph = require('./metrograph');
const ifc = require('./ifc');
const angelika = require('./angelika');
const filmforum = require('./filmforum');
const quad = require('./quad');
const roxy = require('./roxy');
const alamo = require('./alamo');
const nitehawk = require('./nitehawk');
const syndicated = require('./syndicated');
const paris = require('./paris');
const anthology = require('./anthology');

const PUPPETEER_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--ignore-certificate-errors',
];

// Wrap a scraper that needs its own browser instance
async function withBrowser(fn) {
  const browser = await puppeteer.launch({ headless: true, executablePath: getChromePath(), args: PUPPETEER_ARGS, protocolTimeout: 300000 });
  try {
    return await fn(browser);
  } finally {
    await browser.close().catch(() => {});
  }
}

async function runAllScrapers() {
  const weekDates = getCurrentWeekDates();
  const { week_start, week_end } = getWeekBounds();

  console.log(`[scraper] Scraping week ${week_start} to ${week_end}`);

  const scraperTasks = [
    // Puppeteer scrapers — each gets its own browser
    { name: 'Metrograph',                       fn: () => withBrowser(b => metrograph(b, weekDates)) },
    { name: 'IFC Center',                       fn: () => withBrowser(b => ifc(b, weekDates)) },
    { name: 'Angelika Film Center',             fn: () => withBrowser(b => angelika(b, 'nyc', 'Angelika Film Center', weekDates)) },
    { name: 'Angelika Village East',            fn: () => withBrowser(b => angelika(b, 'villageeast', 'Angelika Village East', weekDates)) },
    { name: 'Quad Cinema',                      fn: () => withBrowser(b => quad(b, weekDates)) },
    { name: 'Paris Theater',                    fn: () => withBrowser(b => paris(b, weekDates)) },
    { name: 'Anthology Film Archives',          fn: () => withBrowser(b => anthology(b, weekDates)) },

    // Non-Puppeteer scrapers — run directly
    { name: 'Film Forum',                       fn: () => filmforum(weekDates) },
    { name: 'Roxy Cinema',                      fn: () => roxy(null, weekDates) },
    { name: 'Alamo Drafthouse Lower Manhattan', fn: () => alamo(null, 'manhattan', 'Alamo Drafthouse Lower Manhattan', weekDates) },
    { name: 'Alamo Drafthouse Brooklyn',        fn: () => alamo(null, 'brooklyn', 'Alamo Drafthouse Brooklyn', weekDates) },
    { name: 'Nitehawk Williamsburg',            fn: () => nitehawk('williamsburg', 'Nitehawk Williamsburg', weekDates) },
    { name: 'Nitehawk Prospect Park',           fn: () => nitehawk('prospectpark', 'Nitehawk Prospect Park', weekDates) },
    { name: 'Syndicated',                       fn: () => syndicated(weekDates) },
  ];

  let allShowtimes = [];

  const results = await Promise.allSettled(scraperTasks.map(t => t.fn()));

  results.forEach((result, i) => {
    const { name } = scraperTasks[i];
    if (result.status === 'fulfilled') {
      const entries = result.value || [];
      console.log(`[scraper] ${name}: ${entries.length} entries`);
      allShowtimes = allShowtimes.concat(entries);
    } else {
      console.error(`[scraper] ${name} FAILED: ${result.reason?.message || result.reason}`);
    }
  });

  // Filter to current week only
  const weekSet = new Set(weekDates);
  allShowtimes = allShowtimes.filter(e => weekSet.has(e.date));

  return { week_start, week_end, showtimes: allShowtimes };
}

module.exports = runAllScrapers;
