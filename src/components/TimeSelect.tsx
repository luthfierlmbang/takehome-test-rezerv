import { useId } from 'react'
import { Clock } from '@phosphor-icons/react'
import { formatMinutes, intervalMinutes, minutesToTimeValue, parseTimeToMinutes } from '../lib/slots'

const MINUTES_IN_DAY = 24 * 60

/**
 * Time field whose options are generated from the slot interval, so only times that sit
 * on the grid can be chosen.
 *
 * A native <input type="time"> can't do this: browsers ignore `step` when building the
 * picker's minute list, so a 30-minute interval would still offer 12:21.
 */
export function TimeSelect({
  label,
  value,
  onChange,
  interval,
  after,
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  interval: string
  /** Only offer times later than this one — used to keep "Until" after "Bookable from". */
  after?: string
  disabled?: boolean
}) {
  const id = useId()
  const step = intervalMinutes(interval)
  const floor = after ? parseTimeToMinutes(after) : null

  const options: { value: string; label: string }[] = []
  for (let t = 0; t < MINUTES_IN_DAY; t += step) {
    if (floor !== null && t <= floor) continue
    options.push({ value: minutesToTimeValue(t), label: formatMinutes(t) })
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base leading-[26px] text-black">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full appearance-none rounded-lg border border-brand-border bg-white px-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-brand-primary/40 disabled:bg-brand-surfaceMuted disabled:text-brand-textMuted"
        >
          <option value="">--.--</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Clock
          size={16}
          color="#71717A"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        />
      </div>
    </div>
  )
}
