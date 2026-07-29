import { useNavigate } from 'react-router-dom'
import { Eye, Plus, Trash } from '@phosphor-icons/react'
import { WizardLayout } from '../components/WizardLayout'
import { Card } from '../components/Card'
import { Select } from '../components/Select'
import { CheckboxChip } from '../components/CheckboxChip'
import { useBooking } from '../context/BookingContext'

const APPLIES_ON = ['Weekdays', 'Weekends', 'Every day']

export default function Step6() {
  const navigate = useNavigate()
  const { data, updateField } = useBooking()

  return (
    <WizardLayout stepIndex={3} onBack={() => navigate('/step-5')} onNext={() => navigate('/step-7')}>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-medium leading-[31px] text-black">Pricing</h2>
        <p className="text-base leading-[26px] text-brand-textMuted">
          Set one base price, then add rules for the times that should cost more or less.
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <span className="text-base font-medium leading-[26px] text-black">
            Base price applies to every slot unless a rule overrides it
          </span>
          <div className="flex h-9 items-center gap-2 rounded-lg border border-brand-border px-3 text-sm">
            <span className="text-brand-textMuted">$</span>
            <input
              aria-label="Base price"
              value={data.basePrice}
              onChange={(e) => updateField('basePrice', e.target.value)}
              className="w-12 text-black outline-none"
            />
            <span className="text-brand-textMuted">Per Session</span>
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
                    className="flex h-8 min-w-[130px] items-center justify-center gap-1 rounded-lg bg-brand-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-[#0d4750]"
                  >
                    <Eye size={16} />
                    Preview
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
                <div className="flex flex-col gap-2">
                  <label htmlFor="rule-from" className="text-base leading-[26px] text-black">
                    Bookable from
                  </label>
                  <input
                    id="rule-from"
                    type="time"
                    value={data.ruleFrom}
                    onChange={(e) => updateField('ruleFrom', e.target.value)}
                    className="h-9 rounded-lg border border-brand-border px-3 text-sm text-black outline-none focus:ring-2 focus:ring-brand-primary/40"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="rule-to" className="text-base leading-[26px] text-black">
                    To
                  </label>
                  <input
                    id="rule-to"
                    type="time"
                    value={data.ruleTo}
                    onChange={(e) => updateField('ruleTo', e.target.value)}
                    className="h-9 rounded-lg border border-brand-border px-3 text-sm text-black outline-none focus:ring-2 focus:ring-brand-primary/40"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="rule-price" className="text-base leading-[26px] text-black">
                    Price
                  </label>
                  <div className="flex h-9 items-center gap-1 rounded-lg border border-brand-border px-3 text-sm">
                    <span className="text-brand-textMuted">$</span>
                    <input
                      id="rule-price"
                      value={data.rulePrice}
                      onChange={(e) => updateField('rulePrice', e.target.value)}
                      className="w-full text-black outline-none"
                    />
                  </div>
                </div>
              </div>
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
