/** Shared slot maths: the Schedule step defines the grid, the Pricing step previews it. */

export function parseTimeToMinutes(value: string): number | null {
  // Guard on the shape first: Number('') is 0, so a bare split would let '' through as 0.
  const match = /^(\d{1,2}):(\d{2})$/.exec(value)
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  if (h > 23 || m > 59) return null
  return h * 60 + m
}

export function minutesToTimeValue(total: number): string {
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Display form used on chips, e.g. 12.15pm / 1.00pm — minutes are always shown. */
export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  const period = h >= 12 ? 'pm' : 'am'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}.${String(m).padStart(2, '0')}${period}`
}

export function intervalMinutes(label: string): number {
  if (label === 'Every 30 Min') return 30
  if (label === 'Every Hour') return 60
  return 15
}

/** Rounds a time value down onto the interval grid; returns '' for unparseable input. */
export function snapToInterval(value: string, interval: string): string {
  const minutes = parseTimeToMinutes(value)
  if (minutes === null) return ''
  const step = intervalMinutes(interval)
  return minutesToTimeValue(Math.floor(minutes / step) * step)
}

/** Holds a time inside [min, max]; blank bounds are ignored. Returns '' for unparseable input. */
export function clampToWindow(value: string, min: string, max: string): string {
  const minutes = parseTimeToMinutes(value)
  if (minutes === null) return ''
  const lower = parseTimeToMinutes(min)
  const upper = parseTimeToMinutes(max)
  if (lower !== null && minutes < lower) return minutesToTimeValue(lower)
  if (upper !== null && minutes > upper) return minutesToTimeValue(upper)
  return value
}

/** Minutes in a duration label like "2 Hours"; null when the label isn't one. */
export function durationMinutes(label: string): number | null {
  const match = /^(\d+)\s*Hour/i.exec(label)
  return match ? Number(match[1]) * 60 : null
}

/**
 * Start times on the grid. With a duration, only starts whose session still *finishes*
 * by closing time are offered — a 4-hour session must not start at 3pm when the day
 * ends at 4pm, even though 3pm itself is inside the bookable window.
 */
export function generateStartMinutes(from: string, until: string, interval: string, duration = 0): number[] {
  const start = parseTimeToMinutes(from)
  const end = parseTimeToMinutes(until)
  if (start === null || end === null || end <= start) return []
  const step = intervalMinutes(interval)
  const times: number[] = []
  for (let t = start; duration ? t + duration <= end : t < end; t += step) times.push(t)
  return times
}

export function generateStartTimes(from: string, until: string, interval: string, duration = 0): string[] {
  return generateStartMinutes(from, until, interval, duration).map(formatMinutes)
}

export type DaySchedule = { from: string; until: string; interval: string }

/** What a given day actually runs, falling back to the shared row. */
export function scheduleForDay(
  day: string,
  { perDayHours, daySchedules, bookableFrom, bookableUntil, slotInterval }: ScheduleShape,
): DaySchedule {
  const shared = { from: bookableFrom, until: bookableUntil, interval: slotInterval }
  if (!perDayHours) return shared
  return daySchedules[day] ?? shared
}

export type ScheduleShape = {
  availableDays: string[]
  perDayHours: boolean
  daySchedules: Record<string, DaySchedule>
  bookableFrom: string
  bookableUntil: string
  slotInterval: string
}

export type ScheduleGroup = { days: string[]; from: string; until: string; interval: string }

/**
 * Available days bucketed by the schedule they share, in day order.
 *
 * Everything downstream — the start-time preview, the pricing preview, the review
 * summary — reads the schedule through this, so per-day schedules cost them one loop
 * instead of a special case. With per-day off it yields exactly one group, which is why
 * those screens look unchanged until the operator asks for something different.
 */
export function scheduleGroups(schedule: ScheduleShape, days?: string[]): ScheduleGroup[] {
  const groups: ScheduleGroup[] = []
  for (const day of schedule.availableDays) {
    if (days && !days.includes(day)) continue
    const { from, until, interval } = scheduleForDay(day, schedule)
    const existing = groups.find((g) => g.from === from && g.until === until && g.interval === interval)
    if (existing) existing.days.push(day)
    else groups.push({ days: [day], from, until, interval })
  }
  return groups
}

/**
 * The finest grid any of the given days runs on. A price rule can span days, so its
 * boundaries are offered on this grid — otherwise an hourly weekday would hide the
 * 1.30pm edge a half-hourly Saturday genuinely has. A rule is a plain time range, so it
 * prices each day's slots correctly whether or not its edges land on that day's own grid.
 */
export function finestInterval(schedule: ScheduleShape, days?: string[]): string {
  const intervals = scheduleGroups(schedule, days)
    .map((g) => g.interval)
    .filter(Boolean)
  if (!intervals.length) return schedule.slotInterval
  return intervals.reduce((finest, i) => (intervalMinutes(i) < intervalMinutes(finest) ? i : finest))
}

/**
 * The outer edges across the given days (the whole week when none are named) — a price
 * rule has to sit inside these, since a window outside every covered day's hours could
 * never price a real slot. A Saturday rule is bounded by Saturday's own hours.
 */
export function scheduleBounds(schedule: ScheduleShape, days?: string[]): { from: string; until: string } {
  const groups = scheduleGroups(schedule, days).filter((g) => g.from && g.until)
  const fallback = days ? { from: '', until: '' } : { from: schedule.bookableFrom, until: schedule.bookableUntil }
  if (!groups.length) return fallback

  const starts = groups.map((g) => parseTimeToMinutes(g.from)).filter((m): m is number => m !== null)
  const ends = groups.map((g) => parseTimeToMinutes(g.until)).filter((m): m is number => m !== null)
  if (!starts.length || !ends.length) return fallback

  return { from: minutesToTimeValue(Math.min(...starts)), until: minutesToTimeValue(Math.max(...ends)) }
}

export type Window = { start: number; end: number }

const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const WEEKEND_NAMES = ['Saturday', 'Sunday']

/** The calendar days an "applies on" scope covers — a single day covers just itself. */
export function scopeDays(scope: string): string[] {
  if (scope === 'Every day') return [...WEEKDAY_NAMES, ...WEEKEND_NAMES]
  if (scope === 'Weekdays') return WEEKDAY_NAMES
  if (scope === 'Weekends') return WEEKEND_NAMES
  return scope ? [scope] : []
}

/**
 * Whether two "applies on" scopes can land on the same calendar day. Two Weekdays rules
 * can coexist at different hours, but they must not claim the same hour; a Saturday rule
 * collides with a Weekends one but never with a Weekdays one.
 */
export function dayScopesOverlap(a: string, b: string): boolean {
  const bDays = scopeDays(b)
  return scopeDays(a).some((day) => bDays.includes(day))
}

/** Merges overlapping/touching windows so gap maths doesn't have to handle duplicates. */
export function mergeWindows(windows: Window[]): Window[] {
  const sorted = [...windows].sort((x, y) => x.start - y.start)
  const merged: Window[] = []
  for (const w of sorted) {
    const last = merged[merged.length - 1]
    if (last && w.start <= last.end) last.end = Math.max(last.end, w.end)
    else merged.push({ ...w })
  }
  return merged
}

/** Earliest blocked start at or after `minutes`, or null when the rest of the day is free. */
export function nextBlockedStart(windows: Window[], minutes: number): number | null {
  const next = mergeWindows(windows).find((w) => w.start >= minutes)
  return next ? next.start : null
}

/** Whether a slot *starting* here belongs to a claimed window. Start-inclusive. */
export function isBlocked(windows: Window[], minutes: number): boolean {
  return windows.some((w) => minutes >= w.start && minutes < w.end)
}

/**
 * Whether an *end* time falls inside a claimed window. Both edges are excluded: a window
 * finishing exactly where another begins does not overlap it, so 12pm-1pm is legal next
 * to a 1pm-3pm rule even though 1pm is a blocked *start*.
 */
export function isBlockedEnd(windows: Window[], minutes: number): boolean {
  return windows.some((w) => minutes > w.start && minutes < w.end)
}

export type PreviewSlot = { time: string; price: string; ruledBy: string | null }

type RuleWindow = { id: string; from: string; to: string; price: string }

/**
 * Prices every slot in the day. A slot starting inside a rule's window takes that rule's
 * price; where windows overlap the later rule wins, matching the card's own wording.
 * Everything else takes the base price. This is what a customer would see.
 */
export function buildDayPreview({
  from,
  until,
  interval,
  basePrice,
  rules,
}: {
  from: string
  until: string
  interval: string
  basePrice: string
  rules: RuleWindow[]
}): PreviewSlot[] {
  const windows = rules
    .map((rule) => ({
      id: rule.id,
      price: rule.price,
      start: parseTimeToMinutes(rule.from),
      end: parseTimeToMinutes(rule.to),
    }))
    .filter((w) => w.start !== null && w.end !== null && w.end > w.start && w.price !== '')

  return generateStartMinutes(from, until, interval).map((minutes) => {
    // Last match wins, so scan from the end of the list.
    const owner = [...windows].reverse().find((w) => minutes >= (w.start as number) && minutes < (w.end as number))
    return {
      time: formatMinutes(minutes),
      price: owner ? owner.price : basePrice,
      ruledBy: owner ? owner.id : null,
    }
  })
}
