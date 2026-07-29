import { buildDayPreview, generateStartTimes, snapToInterval } from './slots'

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
    ruleFrom: '13:00',
    ruleTo: '14:00',
    rulePrice: '14.00',
  })

  expect(slots).toEqual([
    { time: '12pm', price: '20', ruled: false },
    { time: '1pm', price: '14.00', ruled: true },
    { time: '2pm', price: '20', ruled: false },
  ])
})

test('falls back to the base price when the rule window is unusable', () => {
  const slots = buildDayPreview({
    from: '12:00',
    until: '14:00',
    interval: 'Every Hour',
    basePrice: '20',
    ruleFrom: '13:00',
    ruleTo: '13:00', // zero-length window
    rulePrice: '14.00',
  })

  expect(slots.every((s) => !s.ruled && s.price === '20')).toBe(true)
})
