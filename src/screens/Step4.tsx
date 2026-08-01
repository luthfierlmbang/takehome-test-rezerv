import { useNavigate } from 'react-router-dom'
import { WizardLayout } from '../components/WizardLayout'
import { Card } from '../components/Card'
import { Select } from '../components/Select'
import { CheckboxChip } from '../components/CheckboxChip'
import { TimeSelect } from '../components/TimeSelect'
import { useBooking } from '../context/BookingContext'
import {
  durationMinutes,
  generateStartTimes,
  parseTimeToMinutes,
  scheduleForDay,
  scheduleGroups,
  snapToInterval,
} from '../lib/slots'

const DURATIONS = ['1 Hour', '2 Hours', '4 Hours']
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
/** A long range can generate dozens of slots; cap the preview so it stays one tidy row. */
const MAX_VISIBLE_TIMES = 12
const INTERVALS = ['Every 15 Min', 'Every 30 Min', 'Every Hour']

/** 'Every 15 Min' -> '15 minutes', matching Figma's sentence under the fields. */
function intervalPhrase(label: string): string {
  if (label === 'Every Hour') return 'hour'
  return label.replace('Every ', '').replace('Min', 'minutes')
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

  /** Kept in DAYS order so the summary reads Monday-first however they were clicked. */
  function toggleDay(day: string, checked: boolean) {
    const next = checked ? [...data.availableDays, day] : data.availableDays.filter((d) => d !== day)
    updateField('availableDays', DAYS.filter((d) => next.includes(d)))
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

  /**
   * Turning per-day schedules on seeds every available day from the shared row, so the
   * operator edits away from a working schedule instead of seven empty ones.
   */
  function handlePerDayToggle(perDay: boolean) {
    if (perDay) {
      const seeded = { ...data.daySchedules }
      for (const day of data.availableDays) {
        seeded[day] ??= { from: data.bookableFrom, until: data.bookableUntil, interval: data.slotInterval }
      }
      updateField('daySchedules', seeded)
    }
    updateField('perDayHours', perDay)
  }

  function handleDayScheduleChange(day: string, key: 'from' | 'until' | 'interval', value: string) {
    const current = scheduleForDay(day, data)
    const next = { ...current }

    if (key === 'interval') {
      // The day's own grid moved, so its hours re-snap onto it.
      next.interval = value
      next.from = snapToInterval(current.from, value)
      next.until = snapToInterval(current.until, value)
    } else {
      next[key] = current.interval ? snapToInterval(value, current.interval) : value
      // An end at or before the start can no longer stand.
      if (key === 'from') {
        const start = parseTimeToMinutes(next.from)
        const end = parseTimeToMinutes(current.until)
        if (start !== null && end !== null && end <= start) next.until = ''
      }
    }

    updateField('daySchedules', { ...data.daySchedules, [day]: next })
  }

  const groups = scheduleGroups(data).filter((g) => generateStartTimes(g.from, g.until, g.interval).length)
  // One grid across every group — always, until per-day intervals actually diverge.
  const sharedInterval = groups.every((g) => g.interval === groups[0]?.interval) ? (groups[0]?.interval ?? '') : ''

  // A duration that fits no day at all can never be booked — that is the one duration
  // fact worth interrupting the operator with.
  const unfitDurations = groups.length
    ? data.selectedDurations.filter((label) => {
        const duration = durationMinutes(label) ?? 0
        return groups.every((g) => generateStartTimes(g.from, g.until, g.interval, duration).length === 0)
      })
    : []

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

          {/* "Avalaible" is Figma's spelling — kept so the screen matches the design 1:1. */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <span id="days-group-label" className="text-base font-medium leading-[26px] text-black">
                Avalaible Days
              </span>
              <p className="text-sm leading-[21px] text-brand-textMuted">Which days does this schedule apply to.</p>
            </div>
            <div role="group" aria-labelledby="days-group-label" className="flex flex-wrap gap-4">
              {DAYS.map((day) => (
                <CheckboxChip
                  key={day}
                  label={day}
                  checked={data.availableDays.includes(day)}
                  onChange={(checked) => toggleDay(day, checked)}
                />
              ))}
            </div>
            {data.availableDays.length === 0 && (
              <p className="text-xs text-[#D92D20]">Pick at least one day, or the service can never be booked.</p>
            )}
          </div>

          {/* Figma orders these Slot Interval → Bookable from → Until. All three move into
              the per-day rows together: a day's interval belongs with the hours it applies
              to, and splitting them would leave the grid claiming to be shared. */}
          {!data.perDayHours && (
            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Slot Interval"
                value={data.slotInterval}
                onChange={handleIntervalChange}
                options={INTERVALS}
                placeholder="Select interval"
              />
              <TimeSelect
                label="Bookable from"
                value={data.bookableFrom}
                onChange={handleFromChange}
                interval={data.slotInterval}
                disabled={!data.slotInterval}
              />
              <TimeSelect
                label="Until"
                value={data.bookableUntil}
                onChange={handleUntilChange}
                interval={data.slotInterval}
                after={data.bookableFrom}
                disabled={!data.slotInterval}
              />
            </div>
          )}

          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-black">
            <input
              type="checkbox"
              checked={data.perDayHours}
              onChange={(e) => handlePerDayToggle(e.target.checked)}
              className="h-4 w-4 rounded accent-brand-primary"
            />
            Set different hours for each day
          </label>

          {data.perDayHours && (
            <div className="flex flex-col divide-y divide-brand-border rounded-lg border border-brand-border">
              {DAYS.filter((day) => data.availableDays.includes(day)).map((day) => {
                const schedule = scheduleForDay(day, data)
                return (
                  <div key={day} className="grid grid-cols-[110px_1fr_1fr_1fr] items-center gap-4 px-4 py-3">
                    <span className="text-sm font-medium text-black">{day}</span>
                    <Select
                      label={`${day} slot interval`}
                      hideLabel
                      value={schedule.interval}
                      onChange={(v) => handleDayScheduleChange(day, 'interval', v)}
                      options={INTERVALS}
                      placeholder="Select interval"
                    />
                    <TimeSelect
                      label={`${day} bookable from`}
                      hideLabel
                      value={schedule.from}
                      onChange={(v) => handleDayScheduleChange(day, 'from', v)}
                      interval={schedule.interval}
                      disabled={!schedule.interval}
                    />
                    <TimeSelect
                      label={`${day} until`}
                      hideLabel
                      value={schedule.until}
                      onChange={(v) => handleDayScheduleChange(day, 'until', v)}
                      interval={schedule.interval}
                      after={schedule.from}
                      disabled={!schedule.interval}
                    />
                  </div>
                )
              })}
              {data.availableDays.length === 0 && (
                <p className="px-4 py-3 text-sm text-brand-textMuted">
                  Pick a day above and its hours will appear here.
                </p>
              )}
            </div>
          )}

          {!data.perDayHours && !data.slotInterval && (
            <p className="text-xs text-brand-textMuted">Pick a slot interval first — it sets the times you can choose.</p>
          )}

          {groups.length > 0 && (
            <div className="flex flex-col gap-3">
              {/* Figma's sentence — dropped by mistake when intervals went per-day, which
                  left the interval unreadable in the preview. It holds whenever every
                  group runs one grid, i.e. always until per-day intervals diverge. */}
              <p className="text-xs text-brand-textMuted">
                {sharedInterval ? (
                  <>
                    Customers can start every{' '}
                    <span className="font-medium text-black">{intervalPhrase(sharedInterval)}</span>. With these
                    settings, a day shows these start times:
                  </>
                ) : (
                  'With these settings, a day shows these start times:'
                )}
              </p>
              {groups.map((group) => {
                // One row of chips per schedule, exactly as Figma draws it. The duration
                // maths runs quietly underneath and only speaks up — below, in red — when
                // a chosen duration could never be booked at all.
                const times = generateStartTimes(group.from, group.until, group.interval)
                return (
                  <div key={group.days.join()} className="flex flex-col gap-2">
                    {/* Only worth naming the days once more than one schedule is in play.
                        The interval rides along, since it can now differ per group too. */}
                    {groups.length > 1 && (
                      <p className="text-xs font-medium text-black">
                        {group.days.join(', ')} <span className="text-brand-textMuted">· {group.interval}</span>
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      {times.slice(0, MAX_VISIBLE_TIMES).map((time) => (
                        <span key={time} className="rounded-lg bg-brand-surfaceMuted px-2 py-1 text-xs text-black">
                          {time}
                        </span>
                      ))}
                      {times.length > MAX_VISIBLE_TIMES && (
                        <span className="text-xs text-brand-textMuted">+{times.length - MAX_VISIBLE_TIMES} more</span>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Quiet until it matters: a duration no day can hold means customers could
                  pick a package that never has a single start time. That deserves a
                  warning; everything short of that is just maths the operator didn't ask
                  to see. */}
              {unfitDurations.map((label) => (
                <p key={label} className="text-xs text-[#D92D20]">
                  {label} doesn't fit the bookable hours — customers would never be able to book it.
                </p>
              ))}
            </div>
          )}
        </div>
      </Card>
    </WizardLayout>
  )
}
