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

/** Display form used on chips, e.g. 12.15pm / 1pm. */
export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  const period = h >= 12 ? 'pm' : 'am'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}${m === 0 ? '' : `.${String(m).padStart(2, '0')}`}${period}`
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

export function generateStartMinutes(from: string, until: string, interval: string): number[] {
  const start = parseTimeToMinutes(from)
  const end = parseTimeToMinutes(until)
  if (start === null || end === null || end <= start) return []
  const step = intervalMinutes(interval)
  const times: number[] = []
  for (let t = start; t < end; t += step) times.push(t)
  return times
}

export function generateStartTimes(from: string, until: string, interval: string): string[] {
  return generateStartMinutes(from, until, interval).map(formatMinutes)
}

export type Window = { start: number; end: number }

/**
 * Whether two "applies on" scopes can land on the same calendar day. Two Weekdays rules
 * can coexist at different hours, but they must not claim the same hour; Weekdays and
 * Weekends never collide; "Every day" collides with everything.
 */
export function dayScopesOverlap(a: string, b: string): boolean {
  if (!a || !b) return false
  if (a === b) return true
  return a === 'Every day' || b === 'Every day'
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

export function isBlocked(windows: Window[], minutes: number): boolean {
  return windows.some((w) => minutes >= w.start && minutes < w.end)
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
