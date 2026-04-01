const TRIVIA = [
  "Darth Vader never says \"Luke, I am your father.\" The actual line is \"No. I am your father.\"",
  "The dog who played Toto in The Wizard of Oz was named Terry and earned $125/week on set — more than several of the actors playing Munchkins.",
  "The "future" in Back to the Future Part II was October 21, 2015. We've already been there — still no hoverboards.",
  "John Wick's entire three-movie killing spree was triggered by someone murdering his puppy and stealing his car.",
  "Michael Keaton's real name is Michael Douglas. He changed it because another Michael Douglas was already famous.",
  "Michael Caine's real name is Maurice Micklewhite. He chose \"Caine\" after glancing at a poster for The Caine Mutiny.",
  "Harrison Ford wasn't supposed to be Han Solo — he was just reading lines to help other actors audition when George Lucas cast him.",
  "After Wallace & Gromit started obsessing over Wensleydale cheese in their shorts, the real Wensleydale Creamery was saved from bankruptcy by the spike in sales.",
  "The entire score of Birdman is just drums. No orchestra, no strings — just a live drummer playing the whole way through.",
  "To promote The Simpsons Movie, 7-Eleven converted 11 of their real stores into actual Kwik-E-Marts for a month.",
  "In Toy Story, Buzz Lightyear is convinced he's a real space ranger — yet he still freezes whenever a human walks in, just like all the other toys.",
  "Nicolas Cage once bought a dinosaur skull for $276,000 at auction and had to return it to the Mongolian government because it was stolen property.",
  "The shower scene in Psycho took 7 days to film, used 70 camera setups, and contains no actual nudity.",
  "The Wilhelm Scream — a goofy stock sound effect of a man yelping — has been used in over 400 films, including every Star Wars and Indiana Jones movie.",
  "Tom Hanks lost 50 pounds for Cast Away. Production literally shut down for a year while he dieted, then resumed for the island sequences.",
  "Bruce Campbell's entire victory speech after defeating a monster in Evil Dead 2 is just: \"Groovy.\"",
  "The velociraptor sounds in Jurassic Park are recordings of tortoises mating.",
  "Marlon Brando improvised putting the cat in his lap in The Godfather's opening scene. The cat wasn't in the script at all — it just wandered onto set.",
  "Sean Connery wore a toupee in every single James Bond film.",
  "Robin Williams improvised so much of the Genie's dialogue in Aladdin that the animators had to redesign scenes around his ad-libs.",
  "Matt Damon and Ben Affleck sold the Good Will Hunting script for $600,000 but made acting in it themselves a non-negotiable condition of the sale.",
  "Clueless is a complete scene-for-scene adaptation of Jane Austen's Emma, set in a Beverly Hills high school.",
  "James Cameron personally drew the nude sketch of Kate Winslet in Titanic.",
  "The Titanic movie cost more to make than the actual Titanic ship cost to build, even adjusted for inflation.",
  "The original Alien cast had no idea what the chest-bursting scene would look like. Ridley Scott kept it secret so their horrified reactions would be real.",
  "In Grease, all the actors playing high schoolers were well into their 20s. Stockard Channing, who played Rizzo, was 34.",
  "Steven Spielberg initially laughed when John Williams played him the Jaws theme, thinking it was a joke. Williams had to play it several more times before Spielberg realized it was the actual score.",
  "Eddie Murphy and Dan Aykroyd's characters in Trading Places have their entire lives destroyed as part of a bet made for exactly one dollar.",
  "The Shining's hedge maze didn't exist in Stephen King's original novel. Kubrick added it, and King famously hated the adaptation.",
  "In Jurassic Park, the raptor that delivers the \"clever girl\" kill had been pretending to be alone while her packmate flanked the hunter from the side.",
  "Clint Eastwood has directed and produced dozens of films but has never watched any of them after they were finished.",
  "The Stay Puft Marshmallow Man in Ghostbusters was designed to be the most harmless, comforting form the villain could possibly take. It still destroys several city blocks.",
  "In Parasite, the \"smell\" that the wealthy Park family keeps noticing is a major plot device — but director Bong Joon-ho never actually explains what it is. He said it represents class itself.",
  "Apocalypse Now's opening napalm sequence used a real fire. Coppola set an actual set ablaze, and Marlon Brando arrived on set weeks late, 100 pounds overweight, and having not read the source material.",
  "The Dude's rug in The Big Lebowski — the one that \"really tied the room together\" — is referenced exactly nine times throughout the movie.",
  "In the original Star Wars, R2-D2 and C-3PO were the only characters to appear in all six prequel and original trilogy films, making them the true protagonists by screen time continuity.",
  "The \"I see dead people\" line from The Sixth Sense was delivered by Haley Joel Osment, who was 11 years old and received an Academy Award nomination for it.",
  "The $5 milkshake in Pulp Fiction was a real menu item at the actual Jack Rabbit Slim's-inspired diner used in filming. In 1994, $5 for a milkshake was genuinely scandalous.",
  "Toy Story (1995) was the first feature-length film made entirely with CGI. The entire animation team at Pixar consisted of about 27 people.",
  "The iconic line from Casablanca — \"Here's looking at you, kid\" — was reportedly improvised by Humphrey Bogart and wasn't in the original script.",
  "Home Alone was the highest-grossing film of 1990 and cost only $15 million to make, earning over $476 million worldwide.",
  "In the original Ghostbusters script, the ghost exterminators operated in a dystopian future where there were thousands of them. Dan Aykroyd and Harold Ramis rewrote it entirely.",
  "During the filming of The Wizard of Oz, the \"tornado\" was a 35-foot muslin stocking spun on a gantry and dusted with fuller's earth to look like a cloud.",
  "The Wilhelm Scream was first recorded in 1951 for a film called Distant Drums and is named after a character named Private Wilhelm who gets shot in the leg by an arrow in The Charge at Feather River (1953).",
  "Pixar hid a \"A113\" — the number of the animation classroom at CalArts where many Pixar founders studied — in every single one of their films.",
];

function showTrivia() {
  const fact = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
  document.getElementById('trivia-text').textContent = fact;
  document.getElementById('trivia-overlay').classList.remove('hidden');
}

function closeTrivia() {
  document.getElementById('trivia-overlay').classList.add('hidden');
}

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
