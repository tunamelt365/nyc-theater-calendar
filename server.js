const express = require('express');
const path = require('path');
const cache = require('./cache');
const runAllScrapers = require('./scraper/index');

// Prevent any stray unhandled rejection or exception from crashing the server
process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled rejection (ignored):', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught exception (ignored):', err.message);
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/showtimes', (req, res) => {
  if (!cache.hasData()) {
    return res.status(503).json({ error: 'No data yet. Click Refresh to load showtimes.' });
  }
  const { data, timestamp } = cache.get();
  res.json({ cached_at: timestamp, ...data });
});

app.post('/api/refresh', async (req, res) => {
  try {
    console.log('[refresh] Starting scrape of all theaters...');
    const result = await runAllScrapers();
    cache.set(result);
    const { timestamp } = cache.get();
    console.log(`[refresh] Done. ${result.showtimes.length} showtime entries scraped.`);
    res.json({ cached_at: timestamp, ...result });
  } catch (err) {
    console.error('[refresh] Fatal error:', err.message);
    res.status(500).json({ error: 'Scrape failed: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`NYC Theater Calendar running at http://localhost:${PORT}`);
  console.log('Open the URL in your browser, then click Refresh to load showtimes.');
});
