import {
  buildDayPreview,
  dayScopesOverlap,
  durationMinutes,
  finestInterval,
  generateStartTimes,
  isBlocked,
  isBlockedEnd,
  mergeWindows,
  nextBlockedStart,
  scheduleBounds,
  scheduleForDay,
  scheduleGroups,
  scopeDays,
  snapToInterval,
} from './slots'

test('a claimed window blocks starts on its opening edge but not ends', () => {
  const claimed = [{ start: 780, end: 900 }] // 1pm-3pm

  // A slot starting at 1pm belongs to the window; one starting at 3pm does not.
  expect(isBlocked(claimed, 780)).toBe(true)
  expect(isBlocked(claimed, 900)).toBe(false)

  // Ends are exclusive at both edges, so a rule may finish exactly where this one starts.
  expect(isBlockedEnd(claimed, 780)).toBe(false)
  expect(isBlockedEnd(claimed, 900)).toBe(false)
  expect(isBlockedEnd(claimed, 840)).toBe(true)
})

test('snaps a time down onto the interval grid', () => {
  expect(snapToInterval('12:15', 'Every 15 Min')).toBe('12:15')
  expect(snapToInterval('12:15', 'Every 30 Min')).toBe('12:00')
  expect(snapToInterval('12:45', 'Every Hour')).toBe('12:00')
  expect(snapToInterval('', 'Every Hour')).toBe('')
})

test('generates start times on the chosen interval', () => {
  expect(generateStartTimes('12:00', '13:00', 'Every 15 Min')).toEqual(['12.00pm', '12.15pm', '12.30pm', '12.45pm'])
  expect(generateStartTimes('12:00', '13:00', 'Every Hour')).toEqual(['12.00pm'])
  // An end at or before the start yields nothing rather than looping.
  expect(generateStartTimes('13:00', '12:00', 'Every Hour')).toEqual([])
})

test('a duration keeps only the starts whose session finishes by closing', () => {
  // 12-4 with a 4-hour session: noon is the one start that still ends on time.
  expect(generateStartTimes('12:00', '16:00', 'Every Hour', 240)).toEqual(['12.00pm'])
  expect(generateStartTimes('12:00', '16:00', 'Every Hour', 60)).toEqual(['12.00pm', '1.00pm', '2.00pm', '3.00pm'])
  // A day shorter than the session offers nothing at all.
  expect(generateStartTimes('09:00', '12:00', 'Every Hour', 240)).toEqual([])
})

test('duration labels parse to minutes', () => {
  expect(durationMinutes('1 Hour')).toBe(60)
  expect(durationMinutes('4 Hours')).toBe(240)
  expect(durationMinutes('nonsense')).toBeNull()
})

test('prices only the slots that start inside the rule window', () => {
  const slots = buildDayPreview({
    from: '12:00',
    until: '15:00',
    interval: 'Every Hour',
    basePrice: '20',
    rules: [{ id: 'a', from: '13:00', to: '14:00', price: '14.00' }],
  })

  expect(slots).toEqual([
    { time: '12.00pm', price: '20', ruledBy: null },
    { time: '1.00pm', price: '14.00', ruledBy: 'a' },
    { time: '2.00pm', price: '20', ruledBy: null },
  ])
})

test('falls back to the base price when the rule window is unusable', () => {
  const slots = buildDayPreview({
    from: '12:00',
    until: '14:00',
    interval: 'Every Hour',
    basePrice: '20',
    rules: [{ id: 'a', from: '13:00', to: '13:00', price: '14.00' }], // zero-length window
  })

  expect(slots.every((s) => s.ruledBy === null && s.price === '20')).toBe(true)
})

test('where rules overlap, the later one wins', () => {
  const slots = buildDayPreview({
    from: '12:00',
    until: '16:00',
    interval: 'Every Hour',
    basePrice: '20',
    rules: [
      { id: 'early', from: '12:00', to: '15:00', price: '30' },
      { id: 'late', from: '14:00', to: '16:00', price: '40' },
    ],
  })

  expect(slots).toEqual([
    { time: '12.00pm', price: '30', ruledBy: 'early' },
    { time: '1.00pm', price: '30', ruledBy: 'early' },
    // 2pm sits in both windows; the rule lower in the list takes it.
    { time: '2.00pm', price: '40', ruledBy: 'late' },
    { time: '3.00pm', price: '40', ruledBy: 'late' },
  ])
})

const WEEK = {
  availableDays: ['Monday', 'Tuesday', 'Saturday'],
  perDayHours: false,
  daySchedules: {},
  bookableFrom: '12:00',
  bookableUntil: '18:00',
  slotInterval: 'Every Hour',
}

test('days sharing a schedule collapse into one group', () => {
  expect(scheduleGroups(WEEK)).toEqual([
    { days: ['Monday', 'Tuesday', 'Saturday'], from: '12:00', until: '18:00', interval: 'Every Hour' },
  ])

  const split = {
    ...WEEK,
    perDayHours: true,
    daySchedules: { Saturday: { from: '09:00', until: '15:00', interval: 'Every Hour' } },
  }

  // Monday and Tuesday fall back to the shared row, so only Saturday splits off.
  expect(scheduleGroups(split)).toEqual([
    { days: ['Monday', 'Tuesday'], from: '12:00', until: '18:00', interval: 'Every Hour' },
    { days: ['Saturday'], from: '09:00', until: '15:00', interval: 'Every Hour' },
  ])
})

test('the interval alone is enough to split a group', () => {
  const split = {
    ...WEEK,
    perDayHours: true,
    // Same hours as the others, finer grid — still its own schedule.
    daySchedules: { Saturday: { from: '12:00', until: '18:00', interval: 'Every 30 Min' } },
  }

  expect(scheduleGroups(split)).toEqual([
    { days: ['Monday', 'Tuesday'], from: '12:00', until: '18:00', interval: 'Every Hour' },
    { days: ['Saturday'], from: '12:00', until: '18:00', interval: 'Every 30 Min' },
  ])
})

test('the finest interval in play wins, so rule edges stay reachable', () => {
  expect(finestInterval(WEEK)).toBe('Every Hour')

  const mixed = {
    ...WEEK,
    perDayHours: true,
    daySchedules: { Saturday: { from: '12:00', until: '18:00', interval: 'Every 15 Min' } },
  }

  // A rule spans days, so it must be able to express Saturday's quarter-hour edges.
  expect(finestInterval(mixed)).toBe('Every 15 Min')
})

test('schedule bounds span the outer edges of the whole week', () => {
  expect(scheduleBounds(WEEK)).toEqual({ from: '12:00', until: '18:00' })

  const split = {
    ...WEEK,
    perDayHours: true,
    daySchedules: { Saturday: { from: '09:00', until: '20:00', interval: 'Every Hour' } },
  }

  // Earliest start across any day, latest end across any day.
  expect(scheduleBounds(split)).toEqual({ from: '09:00', until: '20:00' })
})

test('a day with no schedule of its own inherits the shared row', () => {
  const schedule = { ...WEEK, perDayHours: true, daySchedules: {} }
  expect(scheduleForDay('Monday', schedule)).toEqual({ from: '12:00', until: '18:00', interval: 'Every Hour' })

  const saturday = { from: '09:00', until: '15:00', interval: 'Every 30 Min' }
  expect(scheduleForDay('Saturday', { ...schedule, daySchedules: { Saturday: saturday } })).toEqual(saturday)
})

test('day scopes only collide when they can share a calendar day', () => {
  expect(dayScopesOverlap('Weekdays', 'Weekdays')).toBe(true)
  expect(dayScopesOverlap('Weekdays', 'Weekends')).toBe(false)
  // "Every day" covers both, so it collides with either.
  expect(dayScopesOverlap('Every day', 'Weekends')).toBe(true)
  expect(dayScopesOverlap('Weekdays', 'Every day')).toBe(true)
  expect(dayScopesOverlap('', 'Weekdays')).toBe(false)
  // Single days collide with themselves and with any scope that contains them.
  expect(dayScopesOverlap('Saturday', 'Saturday')).toBe(true)
  expect(dayScopesOverlap('Saturday', 'Every day')).toBe(true)
  expect(dayScopesOverlap('Saturday', 'Monday')).toBe(false)
})

test('a scope names the calendar days it covers', () => {
  expect(scopeDays('Saturday')).toEqual(['Saturday'])
  expect(scopeDays('Every day')).toHaveLength(7)
  expect(scopeDays('')).toEqual([])
})

test('schedule maths can be scoped to a subset of days', () => {
  const split = {
    ...WEEK,
    perDayHours: true,
    daySchedules: { Saturday: { from: '09:00', until: '15:00', interval: 'Every 30 Min' } },
  }

  // Asking about Saturday alone gives Saturday's own schedule, not the week's edges.
  expect(scheduleBounds(split, ['Saturday'])).toEqual({ from: '09:00', until: '15:00' })
  expect(finestInterval(split, ['Saturday'])).toBe('Every 30 Min')
  expect(finestInterval(split, ['Monday'])).toBe('Every Hour')
  // A day the schedule doesn't offer has no bounds at all.
  expect(scheduleBounds(split, ['Sunday'])).toEqual({ from: '', until: '' })
})

test('merges touching windows and finds the next blocked start', () => {
  const merged = mergeWindows([
    { start: 600, end: 720 },
    { start: 700, end: 800 },
    { start: 900, end: 960 },
  ])
  expect(merged).toEqual([
    { start: 600, end: 800 },
    { start: 900, end: 960 },
  ])

  expect(nextBlockedStart(merged, 0)).toBe(600)
  expect(nextBlockedStart(merged, 800)).toBe(900)
  expect(nextBlockedStart(merged, 1000)).toBeNull()
})
