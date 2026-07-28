import { useNavigate } from 'react-router-dom'
import { StepLayout } from '../components/StepLayout'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { useBooking } from '../context/BookingContext'

export default function Step3() {
  const navigate = useNavigate()
  const { data, updateField } = useBooking()

  return (
    <StepLayout
      stepIndex={1}
      title="Basic details"
      description="Confirm the details customers will see."
      onBack={() => navigate('/step-2')}
      onNext={() => navigate('/step-4')}
    >
      <div className="flex gap-4">
        <Card>
          <div className="flex flex-col gap-4">
            <Input
              label="Service name"
              value={data.serviceName}
              onChange={(v) => updateField('serviceName', v)}
            />
            <Input
              label="Description"
              value={data.serviceDescription}
              onChange={(v) => updateField('serviceDescription', v)}
            />
          </div>
        </Card>
        <Card>
          <div className="h-[455px] w-full rounded-lg bg-brand-surfaceMuted" />
        </Card>
      </div>
    </StepLayout>
  )
}
