import { useNavigate } from 'react-router-dom'
import { StepLayout } from '../components/StepLayout'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { useBooking } from '../context/BookingContext'

export default function Step6() {
  const navigate = useNavigate()
  const { data, updateField } = useBooking()

  return (
    <StepLayout
      stepIndex={4}
      title="Pricing"
      description="Set one base price, then add rules for time-based pricing."
      onBack={() => navigate('/step-5')}
      onNext={() => navigate('/step-7')}
    >
      <div className="flex flex-col gap-4">
        <Card>
          <Input label="Base price" value={data.price} onChange={(v) => updateField('price', v)} placeholder="e.g. 50" />
        </Card>
        <Card>
          <Input
            label="Payment method"
            value={data.paymentMethod}
            onChange={(v) => updateField('paymentMethod', v)}
            placeholder="e.g. Card on file"
          />
        </Card>
      </div>
    </StepLayout>
  )
}
