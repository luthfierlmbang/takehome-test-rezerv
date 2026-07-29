import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeSlash, Plus, Trash } from '@phosphor-icons/react'
import { WizardLayout } from '../components/WizardLayout'
import { Card } from '../components/Card'
import { Select } from '../components/Select'
import { CheckboxChip } from '../components/CheckboxChip'
import { PricePreview } from '../components/PricePreview'
import { TimeSelect } from '../components/TimeSelect'
import { useBooking } from '../context/BookingContext'
import { clampToWindow, snapToInterval } from '../lib/slots'

const APPLIES_ON = ['Weekdays', 'Weekends', 'Every day']

/** Keeps money fields to digits and a single decimal point. */
function toAmount(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, '')
  const [whole, ...rest] = cleaned.split('.')
  return rest.length ? `${whole}.${rest.join('').slice(0, 2)}` : whole
}

export default function Step5() {
  const navigate = useNavigate()
  const { data, updateField } = useBooking()
  const [previewOpen, setPreviewOpen] = useState(false)

  const scheduleReady = Boolean(data.slotInterval && data.bookableFrom && data.bookableUntil)

  /**
   * The Schedule step owns the grid, so when it changes a rule set earlier can fall off
   * it — 13:15 under a 30-minute interval, or 8am once the day starts at 9am. Pull the
   * stored window back onto the grid rather than letting it price slots that don't exist.
   */
  useEffect(() => {
    if (!scheduleReady) return

    const reconcile = (value: string) => {
      if (!value) return value
      return clampToWindow(snapToInterval(value, data.slotInterval), data.bookableFrom, data.bookableUntil)
    }

    const from = reconcile(data.ruleFrom)
    const to = reconcile(data.ruleTo)
    if (from !== data.ruleFrom) updateField('ruleFrom', from)
    // A window that collapsed to zero length no longer describes anything.
    if (to !== data.ruleTo || (from && to && to <= from)) {
      updateField('ruleTo', to > from ? to : '')
    }
    // Deliberately keyed to the schedule only: re-running on every rule edit would fight the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.slotInterval, data.bookableFrom, data.bookableUntil, scheduleReady])

  function handleRuleFromChange(value: string) {
    updateField('ruleFrom', value)
    // An end at or before the new start can no longer stand.
    if (data.ruleTo && data.ruleTo <= value) updateField('ruleTo', '')
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

          <div className="rounded-lg border border-brand-border px-4 py-3">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium leading-[26px] text-black">Rules 1</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-8 items-center gap-1 rounded-lg border border-[#F1441E] px-3 text-xs font-semibold text-[#F1441E] transition-colors hover:bg-[#FEF3F2]"
                  >
                    <Trash size={16} />
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewOpen((open) => !open)}
                    aria-expanded={previewOpen}
                    aria-controls="rule-price-preview"
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
                  value={data.ruleAppliesOn}
                  onChange={(v) => updateField('ruleAppliesOn', v)}
                  options={APPLIES_ON}
                />
                {/* A rule can only cover slots that exist, so it rides the same grid and
                    stays inside the bookable hours set on the Schedule step. */}
                <TimeSelect
                  label="Bookable from"
                  value={data.ruleFrom}
                  onChange={handleRuleFromChange}
                  interval={data.slotInterval}
                  min={data.bookableFrom}
                  max={data.bookableUntil}
                  disabled={!scheduleReady}
                />
                <TimeSelect
                  label="To"
                  value={data.ruleTo}
                  onChange={(v) => updateField('ruleTo', v)}
                  interval={data.slotInterval}
                  after={data.ruleFrom}
                  max={data.bookableUntil}
                  disabled={!scheduleReady}
                />
                <div className="flex flex-col gap-2">
                  <label htmlFor="rule-price" className="text-base leading-[26px] text-black">
                    Price
                  </label>
                  <div className="flex h-9 items-center gap-1 rounded-lg border border-brand-border px-3 text-sm">
                    <span className="text-brand-textMuted">$</span>
                    <input
                      id="rule-price"
                      inputMode="decimal"
                      value={data.rulePrice}
                      onChange={(e) => updateField('rulePrice', toAmount(e.target.value))}
                      className="w-full text-black outline-none"
                    />
                  </div>
                </div>
              </div>

              {!scheduleReady && (
                <p className="text-xs text-brand-textMuted">
                  Set the slot interval and bookable hours on the Schedule step to add a time-based rule.
                </p>
              )}

              <div id="rule-price-preview">{previewOpen && <PricePreview data={data} />}</div>
            </div>
          </div>

          <button
            type="button"
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
