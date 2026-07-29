import { useNavigate } from 'react-router-dom'
import { WizardLayout } from '../components/WizardLayout'
import { Card } from '../components/Card'
import { Select } from '../components/Select'
import { CheckboxChip } from '../components/CheckboxChip'
import { useBooking } from '../context/BookingContext'

const DURATIONS = ['1 Hour', '2 Hours', '4 Hours']
/** A long range can generate dozens of slots; cap the preview so it stays one tidy row. */
const MAX_VISIBLE_TIMES = 12
const INTERVALS = ['Every 15 Min', 'Every 30 Min', 'Every Hour']

function parseTimeToMinutes(value: string): number | null {
  const [h, m] = value.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

function formatMinutes(total: number): string {
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  const period = h >= 12 ? 'pm' : 'am'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}${m === 0 ? '' : `.${String(m).padStart(2, '0')}`}${period}`
}

function intervalMinutes(label: string): number {
  if (label === 'Every 30 Min') return 30
  if (label === 'Every Hour') return 60
  return 15
}

function generateStartTimes(from: string, until: string, interval: string): string[] {
  const start = parseTimeToMinutes(from)
  const end = parseTimeToMinutes(until)
  if (start === null || end === null || end <= start) return []
  const step = intervalMinutes(interval)
  const times: string[] = []
  for (let t = start; t < end; t += step) {
    times.push(formatMinutes(t))
  }
  return times
}

export default function Step4() {
  const navigate = useNavigate()
  const { data, updateField } = useBooking()

  function toggleDuration(label: string, checked: boolean) {
    updateField(
      'selectedDurations',
      checked ? [...data.selectedDurations, label] : data.selectedDurations.filter((d) => d !== label),
    )
  }

  const startTimes = generateStartTimes(data.bookableFrom, data.bookableUntil, data.slotInterval)

  return (
    <WizardLayout stepIndex={2} onBack={() => navigate('/step-3')} onNext={() => navigate('/step-5')}>
      <div>
        <h2 className="text-2xl font-medium leading-[31px] text-black">Durations &amp; booking slots</h2>
        <p className="text-sm text-brand-textMuted">
          Durations are what customers choose. The slot interval controls how often a new start time appears.
        </p>
      </div>
      <Card>
        <div className="flex flex-col gap-4">
          <div>
            <span id="duration-group-label" className="text-sm font-medium text-black">
              Bookable durations
            </span>
            <div role="group" aria-labelledby="duration-group-label" className="mt-2 flex flex-wrap gap-2">
              {DURATIONS.map((label) => (
                <CheckboxChip
                  key={label}
                  label={label}
                  checked={data.selectedDurations.includes(label)}
                  onChange={(checked) => toggleDuration(label, checked)}
                />
              ))}
            </div>
          </div>
          {/* Figma orders these Slot Interval → Bookable from → Until. */}
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Slot Interval"
              value={data.slotInterval}
              onChange={(v) => updateField('slotInterval', v)}
              options={INTERVALS}
              placeholder="Select interval"
            />
            <div className="flex flex-col gap-2">
              <label htmlFor="bookable-from" className="text-base leading-[26px] text-black">
                Bookable from
              </label>
              <input
                id="bookable-from"
                type="time"
                value={data.bookableFrom}
                onChange={(e) => updateField('bookableFrom', e.target.value)}
                className="h-9 rounded-lg border border-brand-border px-3 text-sm text-black outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="bookable-until" className="text-base leading-[26px] text-black">
                Until
              </label>
              <input
                id="bookable-until"
                type="time"
                value={data.bookableUntil}
                onChange={(e) => updateField('bookableUntil', e.target.value)}
                className="h-9 rounded-lg border border-brand-border px-3 text-sm text-black outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
            </div>
          </div>
          {startTimes.length > 0 && (
            <div>
              <p className="text-xs text-brand-textMuted">
                Customers can start every <span className="font-medium text-black">{data.slotInterval}</span>. With these
                settings, a day shows these start times:
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {startTimes.slice(0, MAX_VISIBLE_TIMES).map((time) => (
                  <span key={time} className="rounded-lg bg-brand-surfaceMuted px-2 py-1 text-xs text-black">
                    {time}
                  </span>
                ))}
                {startTimes.length > MAX_VISIBLE_TIMES && (
                  <span className="text-xs text-brand-textMuted">
                    +{startTimes.length - MAX_VISIBLE_TIMES} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </WizardLayout>
  )
}
