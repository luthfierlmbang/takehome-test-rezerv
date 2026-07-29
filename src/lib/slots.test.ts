import {
  buildDayPreview,
  dayScopesOverlap,
  generateStartTimes,
  mergeWindows,
  nextBlockedStart,
  snapToInterval,
} from './slots'

test('snaps a time down onto the interval grid', () => {
  expect(snapToInterval('12:15', 'Every 15 Min')).toBe('12:15')
  expect(snapToInterval('12:15', 'Every 30 Min')).toBe('12:00')
  expect(snapToInterval('12:45', 'Every Hour')).toBe('12:00')
  expect(snapToInterval('', 'Every Hour')).toBe('')
})

test('generates start times on the chosen interval', () => {
  expect(generateStartTimes('12:00', '13:00', 'Every 15 Min')).toEqual(['12pm', '12.15pm', '12.30pm', '12.45pm'])
  expect(generateStartTimes('12:00', '13:00', 'Every Hour')).toEqual(['12pm'])
  // An end at or before the start yields nothing rather than looping.
  expect(generateStartTimes('13:00', '12:00', 'Every Hour')).toEqual([])
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
    { time: '12pm', price: '20', ruledBy: null },
    { time: '1pm', price: '14.00', ruledBy: 'a' },
    { time: '2pm', price: '20', ruledBy: null },
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
    { time: '12pm', price: '30', ruledBy: 'early' },
    { time: '1pm', price: '30', ruledBy: 'early' },
    // 2pm sits in both windows; the rule lower in the list takes it.
    { time: '2pm', price: '40', ruledBy: 'late' },
    { time: '3pm', price: '40', ruledBy: 'late' },
  ])
})

test('day scopes only collide when they can share a calendar day', () => {
  expect(dayScopesOverlap('Weekdays', 'Weekdays')).toBe(true)
  expect(dayScopesOverlap('Weekdays', 'Weekends')).toBe(false)
  // "Every day" covers both, so it collides with either.
  expect(dayScopesOverlap('Every day', 'Weekends')).toBe(true)
  expect(dayScopesOverlap('Weekdays', 'Every day')).toBe(true)
  expect(dayScopesOverlap('', 'Weekdays')).toBe(false)
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
