import { useNavigate } from 'react-router-dom'
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
      <div>
        <h2 className="text-2xl font-medium leading-[31px] text-black">Pricing</h2>
        <p className="text-base leading-[26px] text-brand-textMuted">Set one base price, then add rules for the times that should cost more or less.</p>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-black">Base price applies to every slot unless a rule overrides it</span>
          <div className="flex items-center gap-1 rounded-lg border border-brand-border px-3 py-2 text-sm">
            <span className="text-brand-textMuted">$</span>
            <input
              aria-label="Base price"
              value={data.basePrice}
              onChange={(e) => updateField('basePrice', e.target.value)}
              placeholder="20"
              className="w-16 outline-none"
            />
            <span className="text-brand-textMuted">Per Session</span>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-medium text-black">Time-based price rules</h3>
            <p className="text-sm text-brand-textMuted">A rule changes the price for slots inside its time range.</p>
          </div>
          <div className="rounded-lg border border-brand-border p-4">
            <p className="mb-3 text-sm font-medium text-black">Rule 1</p>
            <div className="grid grid-cols-4 gap-4">
              <Select
                label="Applies on"
                value={data.ruleAppliesOn}
                onChange={(v) => updateField('ruleAppliesOn', v)}
                options={APPLIES_ON}
                placeholder="Select"
              />
              <div className="flex flex-col gap-1">
                <label htmlFor="rule-from" className="text-sm font-medium text-black">
                  Bookable from
                </label>
                <input
                  id="rule-from"
                  type="time"
                  value={data.ruleFrom}
                  onChange={(e) => updateField('ruleFrom', e.target.value)}
                  className="rounded-lg border border-brand-border px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="rule-to" className="text-sm font-medium text-black">
                  To
                </label>
                <input
                  id="rule-to"
                  type="time"
                  value={data.ruleTo}
                  onChange={(e) => updateField('ruleTo', e.target.value)}
                  className="rounded-lg border border-brand-border px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="rule-price" className="text-sm font-medium text-black">
                  Price
                </label>
                <input
                  id="rule-price"
                  value={data.rulePrice}
                  onChange={(e) => updateField('rulePrice', e.target.value)}
                  placeholder="14.00"
                  className="rounded-lg border border-brand-border px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div>
          <span id="payment-group-label" className="text-sm font-medium text-black">
            Payment Method
          </span>
          <div role="group" aria-labelledby="payment-group-label" className="mt-2 flex gap-2">
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
