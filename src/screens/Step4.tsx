import { useNavigate } from 'react-router-dom'
import { StepLayout } from '../components/StepLayout'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { useBooking } from '../context/BookingContext'

export default function Step4() {
  const navigate = useNavigate()
  const { data, updateField } = useBooking()

  return (
    <StepLayout
      stepIndex={2}
      title="Locations & coaches"
      description="Choose where this service is offered and who runs it."
      onBack={() => navigate('/step-3')}
      onNext={() => navigate('/step-5')}
    >
      <Card>
        <div className="flex flex-col gap-4">
          <Input label="Location" value={data.location} onChange={(v) => updateField('location', v)} placeholder="e.g. Downtown Studio" />
          <Input label="Coach" value={data.coach} onChange={(v) => updateField('coach', v)} placeholder="e.g. Jamie Lee" />
        </div>
      </Card>
    </StepLayout>
  )
}
