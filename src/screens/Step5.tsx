import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeSlash, Plus, Trash } from '@phosphor-icons/react'
import { WizardLayout } from '../components/WizardLayout'
import { Card } from '../components/Card'
import { Select } from '../components/Select'
import { CheckboxChip } from '../components/CheckboxChip'
import { PricePreview } from '../components/PricePreview'
import { TimeSelect } from '../components/TimeSelect'
import { useBooking, type PriceRule } from '../context/BookingContext'
import {
  clampToWindow,
  dayScopesOverlap,
  parseTimeToMinutes,
  finestInterval,
  scheduleBounds,
  scheduleGroups,
  scopeDays,
  snapToInterval,
  type Window,
} from '../lib/slots'

/** Keeps money fields to digits and a single decimal point. */
function toAmount(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, '')
  const [whole, ...rest] = cleaned.split('.')
  return rest.length ? `${whole}.${rest.join('').slice(0, 2)}` : whole
}

export default function Step5() {
  const navigate = useNavigate()
  const { data, updateField, addPriceRule, updatePriceRule, removePriceRule } = useBooking()
  // Figma shows the preview expanded, so it is visible unless explicitly hidden.
  const [hiddenPreviews, setHiddenPreviews] = useState<string[]>([])

  // Mirrors the Schedule step's own choice: a rule either covers every available day, or
  // names one of them. Days the schedule doesn't offer are not offered here either.
  const appliesOptions = ['Every day', ...data.availableDays]

  /**
   * What the schedule gives the days a rule covers: their outer hours, the finest grid
   * among them, and whether any of them is actually available. A Saturday rule is
   * bounded by Saturday's own hours, not the week's.
   */
  function scheduleFor(scope: string) {
    const days = scopeDays(scope)
    const bounds = scheduleBounds(data, days)
    const interval = finestInterval(data, days)
    return {
      bounds,
      interval,
      covered: scheduleGroups(data, days).length > 0,
      ready: Boolean(interval && bounds.from && bounds.until),
    }
  }

  /**
   * The Schedule step owns each day's grid, so when it changes a rule set earlier can
   * fall off it — 13:15 under a 30-minute interval, or 8am once the day starts at 9am.
   * Pull every stored window back onto its own days' grid rather than letting it price
   * slots that don't exist.
   */
  useEffect(() => {
    for (const rule of data.priceRules) {
      const { bounds, interval, ready } = scheduleFor(rule.appliesOn)
      if (!ready) continue

      const reconcile = (value: string) => {
        if (!value) return value
        return clampToWindow(snapToInterval(value, interval), bounds.from, bounds.until)
      }

      const from = reconcile(rule.from)
      const to = reconcile(rule.to)
      if (from !== rule.from) updatePriceRule(rule.id, 'from', from)
      // A window that collapsed to zero length no longer describes anything.
      if (to !== rule.to || (from && to && to <= from)) {
        updatePriceRule(rule.id, 'to', to > from ? to : '')
      }
    }
    // Deliberately keyed to the schedule only: re-running on every rule edit would fight the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.slotInterval, data.bookableFrom, data.bookableUntil, data.perDayHours, data.daySchedules, data.availableDays])

  function handleRuleFromChange(id: string, value: string) {
    const rule = data.priceRules.find((r) => r.id === id)
    updatePriceRule(id, 'from', value)
    // An end at or before the new start can no longer stand.
    if (rule?.to && rule.to <= value) updatePriceRule(id, 'to', '')
  }

  /**
   * Widening a rule's days can drag it onto hours another rule already owns, so drop a
   * window that would now collide rather than leaving two rules fighting over a slot.
   */
  function handleAppliesOnChange(rule: PriceRule, appliesOn: string) {
    updatePriceRule(rule.id, 'appliesOn', appliesOn)

    const claimed = claimedHoursFor({ ...rule, appliesOn })
    const start = parseTimeToMinutes(rule.from)
    const end = parseTimeToMinutes(rule.to)
    if (start === null || end === null) return

    const collides = claimed.some((w) => start < w.end && end > w.start)
    if (collides) {
      updatePriceRule(rule.id, 'from', '')
      updatePriceRule(rule.id, 'to', '')
    }
  }

  function claimedHoursFor(rule: PriceRule): Window[] {
    return data.priceRules
      .filter((other) => other.id !== rule.id && dayScopesOverlap(other.appliesOn, rule.appliesOn))
      .map((other) => ({
        start: parseTimeToMinutes(other.from),
        end: parseTimeToMinutes(other.to),
      }))
      .filter((w): w is Window => w.start !== null && w.end !== null && w.end > w.start)
  }


  return (
    <WizardLayout stepIndex={3} onBack={() => navigate('/step-4')} onNext={() => navigate('/step-6')}>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-medium leading-[31px] text-black">Pricing</h2>
        <p className="text-base leading-[26px] text-brand-textMuted">
          Set one base price, then add rules for the times that should cost more or less.
        </p>
      </div>

      <Card>
        {/* Figma stacks this: 16px medium label, then a 75px price field with "Per Session" beside it. */}
        <div className="flex w-[420px] flex-col gap-2">
          <label htmlFor="base-price" className="text-base font-medium leading-[26px] text-black">
            Base price applies to every slot unless a rule overrides it
          </label>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-[75px] items-center gap-1 rounded-lg border border-brand-border px-3 text-sm">
              <span className="text-brand-textMuted">$</span>
              <input
                id="base-price"
                inputMode="decimal"
                value={data.basePrice}
                onChange={(e) => updateField('basePrice', toAmount(e.target.value))}
                className="w-full text-black outline-none"
              />
            </div>
            <span className="text-xs leading-[15px] text-black">Per Session</span>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-medium leading-[26px] text-black">Time-based price rules</h3>
            <p className="text-base leading-[26px] text-[#52525B]">
              A rule changes the price for slots inside its time range. If rules overlap, the one lower in the list wins.
            </p>
          </div>

          {data.priceRules.length === 0 && (
            <p className="rounded-lg border border-dashed border-brand-border px-4 py-6 text-center text-sm text-brand-textMuted">
              No price rules yet — every slot uses the base price.
            </p>
          )}

          {data.priceRules.map((rule, index) => {
            const previewOpen = !hiddenPreviews.includes(rule.id)
            const priceId = `${rule.id}-price`
            const claimed = claimedHoursFor(rule)
            const { bounds, interval, covered, ready } = scheduleFor(rule.appliesOn)
            // A day can drop out of the schedule after the rule picked it; keep it
            // visible in the dropdown rather than showing a silently blank field.
            const options = appliesOptions.includes(rule.appliesOn)
              ? appliesOptions
              : [...appliesOptions, rule.appliesOn]
            return (
              <div key={rule.id} className="rounded-lg border border-brand-border px-4 py-3">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium leading-[26px] text-black">Rules {index + 1}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => removePriceRule(rule.id)}
                        aria-label={`Remove rule ${index + 1}`}
                        className="flex h-8 items-center gap-1 rounded-lg border border-[#F1441E] px-3 text-xs font-semibold text-[#F1441E] transition-colors hover:bg-[#FEF3F2]"
                      >
                        <Trash size={16} />
                        Remove
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setHiddenPreviews((hidden) =>
                            previewOpen ? [...hidden, rule.id] : hidden.filter((id) => id !== rule.id),
                          )
                        }
                        aria-expanded={previewOpen}
                        aria-label={previewOpen ? `Hide preview for rule ${index + 1}` : `Preview rule ${index + 1}`}
                        className="flex h-8 min-w-[130px] items-center justify-center gap-1 rounded-lg bg-brand-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-[#0d4750]"
                      >
                        {previewOpen ? <EyeSlash size={16} /> : <Eye size={16} />}
                        {previewOpen ? 'Hide preview' : 'Preview'}
                      </button>
                    </div>
                  </div>

                  <div className="h-px w-full bg-brand-border" />

                  <div className="grid grid-cols-4 gap-4">
                    <Select
                      label="Applies on"
                      value={rule.appliesOn}
                      onChange={(v) => handleAppliesOnChange(rule, v)}
                      options={options}
                    />
                    {/* A rule can only cover slots that exist, so its times ride the
                        schedule of the days it applies to — a Saturday rule offers
                        Saturday's hours on Saturday's grid. `blocked` additionally hides
                        hours another rule on the same days already claims. */}
                    <TimeSelect
                      label="Time book from"
                      value={rule.from}
                      onChange={(v) => handleRuleFromChange(rule.id, v)}
                      interval={interval}
                      min={bounds.from}
                      max={bounds.until}
                      blocked={claimed}
                      disabled={!ready}
                    />
                    <TimeSelect
                      label="To"
                      value={rule.to}
                      onChange={(v) => updatePriceRule(rule.id, 'to', v)}
                      interval={interval}
                      after={rule.from}
                      max={bounds.until}
                      blocked={claimed}
                      disabled={!ready}
                    />
                    <div className="flex flex-col gap-2">
                      <label htmlFor={priceId} className="text-base leading-[26px] text-black">
                        Price
                      </label>
                      <div className="flex h-9 items-center gap-1 rounded-lg border border-brand-border px-3 text-sm">
                        <span className="text-brand-textMuted">$</span>
                        <input
                          id={priceId}
                          inputMode="decimal"
                          value={rule.price}
                          onChange={(e) => updatePriceRule(rule.id, 'price', toAmount(e.target.value))}
                          className="w-full text-black outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {!ready && (
                    <p className="text-xs text-brand-textMuted">
                      {covered
                        ? 'Set the slot interval and bookable hours on the Schedule step to add a time-based rule.'
                        : `${rule.appliesOn} isn't picked on the Schedule step, so this rule has no slots to price.`}
                    </p>
                  )}

                  {previewOpen && <PricePreview data={data} ruleId={rule.id} />}
                </div>
              </div>
            )
          })}

          <button
            type="button"
            onClick={addPriceRule}
            className="flex h-9 items-center justify-center gap-2 rounded-lg border border-brand-border text-sm font-medium text-black transition-colors hover:bg-brand-surfaceMuted"
          >
            <Plus size={16} />
            Add price rule
          </button>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <span id="payment-group-label" className="text-base font-medium leading-[26px] text-black">
            Payment Method
          </span>
          <div role="group" aria-labelledby="payment-group-label" className="flex gap-4">
            <CheckboxChip label="Drop In" checked={data.paymentDropIn} onChange={(v) => updateField('paymentDropIn', v)} />
            <CheckboxChip
              label="Class pack credits"
              checked={data.paymentClassPack}
              onChange={(v) => updateField('paymentClassPack', v)}
            />
          </div>
        </div>
      </Card>
    </WizardLayout>
  )
}
