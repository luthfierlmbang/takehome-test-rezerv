import { useNavigate } from 'react-router-dom'
import { WizardLayout } from '../components/WizardLayout'
import { Card } from '../components/Card'
import { Select } from '../components/Select'
import { CheckboxChip } from '../components/CheckboxChip'
import { useBooking } from '../context/BookingContext'
import { generateStartTimes, intervalMinutes, parseTimeToMinutes, snapToInterval } from '../lib/slots'

const DURATIONS = ['1 Hour', '2 Hours', '4 Hours']
/** A long range can generate dozens of slots; cap the preview so it stays one tidy row. */
const MAX_VISIBLE_TIMES = 12
const INTERVALS = ['Every 15 Min', 'Every 30 Min', 'Every Hour']

export default function Step4() {
  const navigate = useNavigate()
  const { data, updateField } = useBooking()

  function toggleDuration(label: string, checked: boolean) {
    updateField(
      'selectedDurations',
      checked ? [...data.selectedDurations, label] : data.selectedDurations.filter((d) => d !== label),
    )
  }

  /**
   * The interval defines the grid every start time sits on, so changing it re-snaps the
   * hours already picked — otherwise "Every Hour" could still hold a 12:15 start.
   */
  function handleIntervalChange(interval: string) {
    updateField('slotInterval', interval)
    if (data.bookableFrom) updateField('bookableFrom', snapToInterval(data.bookableFrom, interval))
    if (data.bookableUntil) updateField('bookableUntil', snapToInterval(data.bookableUntil, interval))
  }

  function handleFromChange(value: string) {
    const snapped = data.slotInterval ? snapToInterval(value, data.slotInterval) : value
    updateField('bookableFrom', snapped)

    // Keep the range valid: an end at or before the new start can no longer stand.
    const start = parseTimeToMinutes(snapped)
    const end = parseTimeToMinutes(data.bookableUntil)
    if (start !== null && end !== null && end <= start) updateField('bookableUntil', '')
  }

  function handleUntilChange(value: string) {
    updateField('bookableUntil', data.slotInterval ? snapToInterval(value, data.slotInterval) : value)
  }

  const stepSeconds = data.slotInterval ? intervalMinutes(data.slotInterval) * 60 : undefined
  const startTimes = generateStartTimes(data.bookableFrom, data.bookableUntil, data.slotInterval)
  const timeFieldClass =
    'h-9 rounded-lg border border-brand-border px-3 text-sm text-black outline-none focus:ring-2 focus:ring-brand-primary/40 disabled:bg-brand-surfaceMuted disabled:text-brand-textMuted'

  return (
    <WizardLayout stepIndex={2} onBack={() => navigate('/step-3')} onNext={() => navigate('/step-5')}>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-medium leading-[31px] text-black">Durations &amp; booking slots</h2>
        <p className="text-base leading-[26px] text-brand-textMuted">
          Durations are what customers choose. The slot interval controls how often a new start time appears.
        </p>
      </div>
      <Card>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <span id="duration-group-label" className="text-base font-medium leading-[26px] text-black">
              Bookable durations
            </span>
            <div role="group" aria-labelledby="duration-group-label" className="flex flex-wrap gap-4">
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
              onChange={handleIntervalChange}
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
                step={stepSeconds}
                value={data.bookableFrom}
                disabled={!data.slotInterval}
                onChange={(e) => handleFromChange(e.target.value)}
                className={timeFieldClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="bookable-until" className="text-base leading-[26px] text-black">
                Until
              </label>
              <input
                id="bookable-until"
                type="time"
                step={stepSeconds}
                min={data.bookableFrom || undefined}
                value={data.bookableUntil}
                disabled={!data.slotInterval}
                onChange={(e) => handleUntilChange(e.target.value)}
                className={timeFieldClass}
              />
            </div>
          </div>

          {!data.slotInterval && (
            <p className="text-xs text-brand-textMuted">Pick a slot interval first — it sets the times you can choose.</p>
          )}

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
