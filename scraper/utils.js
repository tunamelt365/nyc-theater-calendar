const { addDays, format, parse, isValid } = require('date-fns');

function getCurrentWeekDates() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(today, i), 'yyyy-MM-dd')
  );
}

function getWeekBounds() {
  const dates = getCurrentWeekDates();
  return { week_start: dates[0], week_end: dates[6] };
}

// Normalize various time string formats to "7:00 PM"
function normalizeTime(str) {
  if (!str) return null;
  str = str.trim().replace(/\s+/g, ' ');

  // Already in good format (with or without space before AM/PM)
  const goodFmt = str.match(/^(\d{1,2}:\d{2})\s?(AM|PM)$/i);
  if (goodFmt) {
    return `${goodFmt[1]} ${goodFmt[2].toUpperCase()}`;
  }

  // "7pm" or "7:30pm"
  const match = str.match(/^(\d{1,2})(?::(\d{2}))?\s?(am|pm)$/i);
  if (match) {
    const hour = match[1];
    const min = match[2] || '00';
    const meridiem = match[3].toUpperCase();
    return `${hour}:${min} ${meridiem}`;
  }

  // 24-hour "19:30"
  const h24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    let hour = parseInt(h24[1], 10);
    const min = h24[2];
    const meridiem = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    return `${hour}:${min} ${meridiem}`;
  }

  return str; // return as-is if we can't parse it
}

// Normalize date strings like "Mon Mar 30", "Monday, March 30", "3/30" to "2026-03-30"
function normalizeDate(str, referenceYear) {
  if (!str) return null;
  str = str.trim().replace(/\s+/g, ' ');
  const year = referenceYear || new Date().getFullYear();

  const formats = [
    'EEE MMM d',
    'EEEE, MMMM d',
    'MMMM d',
    'MMM d',
    'M/d',
    'MM/dd',
    'EEE M/d',
    'EEE MM/dd',
  ];

  for (const fmt of formats) {
    try {
      const d = parse(`${str} ${year}`, `${fmt} yyyy`, new Date());
      if (isValid(d)) return format(d, 'yyyy-MM-dd');
    } catch (_) {}
  }

  return null;
}

// Apply a trailing AM/PM to a list of times that may not have it
// e.g. ["1:00", "3:15", "7:45pm"] → ["1:00 PM", "3:15 PM", "7:45 PM"]
function applyTrailingMeridiem(times) {
  if (!times || times.length === 0) return [];
  const last = times[times.length - 1];
  const meridiemMatch = last.match(/(am|pm)/i);
  if (!meridiemMatch) return times.map(t => normalizeTime(t));
  const meridiem = meridiemMatch[1].toUpperCase();
  return times.map(t => {
    if (/am|pm/i.test(t)) return normalizeTime(t);
    return normalizeTime(t + ' ' + meridiem);
  });
}

module.exports = { getCurrentWeekDates, getWeekBounds, normalizeTime, normalizeDate, applyTrailingMeridiem };
