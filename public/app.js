const THEATER_ORDER = [
  { id: 'metrograph',           name: 'Metrograph' },
  { id: 'ifc',                  name: 'IFC Center' },
  { id: 'angelika-nyc',         name: 'Angelika Film Center' },
  { id: 'angelika-village-east',name: 'Angelika Village East' },
  { id: 'filmforum',            name: 'Film Forum' },
  { id: 'quad',                 name: 'Quad Cinema' },
  { id: 'roxy',                 name: 'Roxy Cinema' },
  { id: 'alamo-manhattan',      name: 'Alamo Drafthouse Lower Manhattan' },
  { id: 'alamo-brooklyn',       name: 'Alamo Drafthouse Brooklyn' },
  { id: 'nitehawk-williamsburg',name: 'Nitehawk Williamsburg' },
  { id: 'nitehawk-prospectpark',name: 'Nitehawk Prospect Park' },
  { id: 'syndicated',           name: 'Syndicated Bar Theatre Kitchen' },
  { id: 'paris',                name: 'Paris Theater' },
  { id: 'anthology',            name: 'Anthology Film Archives' },
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDayHeader(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayIndex = (date.getDay() + 6) % 7; // Mon=0
  return `${DAY_LABELS[dayIndex]} ${m}/${d}`;
}

function isToday(isoDate) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  return isoDate === todayStr;
}

function getWeekDates(weekStart) {
  const [y, m, d] = weekStart.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  });
}

function formatWeekLabel(weekStart, weekEnd) {
  const [sy, sm, sd] = weekStart.split('-').map(Number);
  const [ey, em, ed] = weekEnd.split('-').map(Number);
  return `${MONTH_LABELS[sm-1]} ${sd} – ${MONTH_LABELS[em-1]} ${ed}, ${ey}`;
}

// Progress bar — simulates fill over ~75s, snaps to 100% on complete
let _progressTimer = null;

function startProgress() {
  const track = document.getElementById('progress-bar-track');
  const bar = document.getElementById('progress-bar');

  // Reset without transition, then show track
  bar.style.transition = 'none';
  bar.style.width = '0%';
  track.classList.add('active');

  // Force reflow so 0% starting point registers before animating
  bar.offsetWidth;

  // Animate to 85% over 75s (fast start, slows near the end)
  bar.style.transition = 'width 75s cubic-bezier(0.1, 0.5, 0.3, 1)';
  bar.style.width = '85%';
}

function completeProgress() {
  const track = document.getElementById('progress-bar-track');
  const bar = document.getElementById('progress-bar');

  bar.style.transition = 'width 0.3s ease-out';
  bar.style.width = '100%';
  setTimeout(() => {
    track.classList.remove('active');
    setTimeout(() => { bar.style.transition = 'none'; bar.style.width = '0%'; }, 200);
  }, 400);
}

function showStatus(msg, isError = false) {
  const bar = document.getElementById('status-bar');
  bar.textContent = msg;
  bar.className = 'status-bar' + (isError ? ' error' : '');
}

function hideStatus() {
  document.getElementById('status-bar').className = 'status-bar hidden';
}

function renderCalendar(data) {
  const grid = document.getElementById('calendar-grid');
  const headerRow = document.getElementById('day-header-row');
  grid.innerHTML = '';
  headerRow.innerHTML = '';

  const weekDates = getWeekDates(data.week_start);

  // Populate sticky day header row
  weekDates.forEach(date => {
    const cell = document.createElement('div');
    cell.className = 'day-header' + (isToday(date) ? ' today' : '');
    cell.textContent = formatDayHeader(date);
    headerRow.appendChild(cell);
  });

  // Group showtimes: date → theaterId → [entries]
  const byDate = {};
  weekDates.forEach(d => { byDate[d] = {}; });

  data.showtimes.forEach(entry => {
    if (!byDate[entry.date]) return;
    if (!byDate[entry.date][entry.theaterId]) byDate[entry.date][entry.theaterId] = [];
    byDate[entry.date][entry.theaterId].push(entry);
  });

  weekDates.forEach(date => {
    const col = document.createElement('div');
    col.className = 'day-column';

    const content = document.createElement('div');
    content.className = 'day-content';

    const theaterEntries = byDate[date];
    let hasAny = false;

    THEATER_ORDER.forEach(({ id, name }) => {
      const entries = theaterEntries[id];
      if (!entries || entries.length === 0) return;
      hasAny = true;

      const block = document.createElement('div');
      block.className = 'theater-block';

      const theaterLabel = document.createElement('div');
      theaterLabel.className = 'theater-name';
      theaterLabel.textContent = name;
      block.appendChild(theaterLabel);

      // Group by movie title
      const byMovie = {};
      entries.forEach(e => {
        if (!byMovie[e.movie]) byMovie[e.movie] = { showtimes: [], format: e.format, notes: e.notes, url: e.url || null };
        byMovie[e.movie].showtimes.push(...e.showtimes);
      });

      Object.entries(byMovie).forEach(([title, info]) => {
        const movieEl = document.createElement('div');
        movieEl.className = 'movie-entry';

        const titleEl = document.createElement(info.url ? 'a' : 'div');
        titleEl.className = 'movie-title';
        titleEl.textContent = title;
        if (info.url) {
          titleEl.href = info.url;
          titleEl.target = '_blank';
          titleEl.rel = 'noopener noreferrer';
        }
        movieEl.appendChild(titleEl);

        const timesEl = document.createElement('div');
        timesEl.className = 'movie-showtimes';
        const uniqueTimes = [...new Set(info.showtimes)];
        timesEl.textContent = uniqueTimes.join(' · ');
        movieEl.appendChild(timesEl);

        if (info.format || info.notes) {
          const metaEl = document.createElement('div');
          metaEl.className = 'movie-meta';
          const parts = [info.format, info.notes].filter(Boolean);
          metaEl.textContent = parts.join(' · ');
          movieEl.appendChild(metaEl);
        }

        block.appendChild(movieEl);
      });

      content.appendChild(block);
    });

    if (!hasAny) {
      const empty = document.createElement('div');
      empty.className = 'empty-day';
      empty.textContent = 'No listings';
      content.appendChild(empty);
    }

    col.appendChild(content);
    grid.appendChild(col);
  });

  // Update header info
  document.getElementById('week-label').textContent = formatWeekLabel(data.week_start, data.week_end);
  if (data.cached_at) {
    const d = new Date(data.cached_at);
    document.getElementById('last-updated').textContent =
      `Updated ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }
}

function renderLoading() {
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = `<div class="loading-overlay">
    <strong>Refreshing showtimes...</strong>
    <p>Scraping all 14 theaters — this takes about a minute. Please wait.</p>
  </div>`;
}

async function fetchShowtimes() {
  try {
    const res = await fetch('/api/showtimes');
    if (res.status === 503) {
      // First load — auto-trigger a refresh
      showStatus('No data yet. Loading showtimes for the first time...');
      await triggerRefresh();
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderCalendar(data);
    hideStatus();
  } catch (err) {
    showStatus('Could not load showtimes. Make sure the server is running.', true);
  }
}

async function triggerRefresh() {
  const btn = document.getElementById('refresh-btn');
  btn.disabled = true;
  btn.textContent = 'Refreshing...';
  renderLoading();
  showStatus('Scraping all 14 theaters — this takes about a minute...');
  startProgress();

  try {
    const res = await fetch('/api/refresh', { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    completeProgress();
    renderCalendar(data);
    hideStatus();
  } catch (err) {
    completeProgress();
    showStatus('Refresh failed. Check the terminal for errors.', true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Refresh';
  }
}

function updateHeaderHeight() {
  const h = document.querySelector('#app-chrome').offsetHeight;
  document.documentElement.style.setProperty('--header-height', h + 'px');
  // Sync day-header-row scroll position with calendar grid
  const headerRow = document.getElementById('day-header-row');
  const grid = document.getElementById('calendar-grid');
  if (headerRow && grid) {
    grid.addEventListener('scroll', () => { headerRow.scrollLeft = grid.scrollLeft; }, { passive: true });
  }
}

function closeWelcome() {
  document.getElementById('welcome-overlay').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  updateHeaderHeight();
  window.addEventListener('resize', updateHeaderHeight);
  fetchShowtimes();
  // Show welcome popup on every page load
  document.getElementById('welcome-overlay').classList.remove('hidden');
});
