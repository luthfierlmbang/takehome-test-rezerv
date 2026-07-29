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

export type PreviewSlot = { time: string; price: string; ruled: boolean }

/**
 * Prices every slot in the day: slots that start inside the rule's window take the rule
 * price, everything else takes the base price. This is what a customer would see.
 */
export function buildDayPreview({
  from,
  until,
  interval,
  basePrice,
  ruleFrom,
  ruleTo,
  rulePrice,
}: {
  from: string
  until: string
  interval: string
  basePrice: string
  ruleFrom: string
  ruleTo: string
  rulePrice: string
}): PreviewSlot[] {
  const ruleStart = parseTimeToMinutes(ruleFrom)
  const ruleEnd = parseTimeToMinutes(ruleTo)
  const hasRule = ruleStart !== null && ruleEnd !== null && ruleEnd > ruleStart && rulePrice !== ''

  return generateStartMinutes(from, until, interval).map((minutes) => {
    const ruled = hasRule && minutes >= (ruleStart as number) && minutes < (ruleEnd as number)
    return {
      time: formatMinutes(minutes),
      price: ruled ? rulePrice : basePrice,
      ruled,
    }
  })
}
