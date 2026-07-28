import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StepLayout } from '../components/StepLayout'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { EmptyState } from '../components/EmptyState'
import { useBooking } from '../context/BookingContext'

export default function Step2() {
  const navigate = useNavigate()
  const { data, updateField } = useBooking()
  const [error, setError] = useState<string | undefined>()

  function handleNext() {
    if (!data.serviceName.trim()) {
      setError('Service name is required')
      return
    }
    setError(undefined)
    navigate('/step-3')
  }

  return (
    <StepLayout
      stepIndex={1}
      title="Basic details"
      description="Give your service a name and description."
      onBack={() => navigate('/step-1')}
      onNext={handleNext}
    >
      <div className="flex gap-4">
        <Card>
          <div className="flex flex-col gap-4">
            <Input
              label="Service name"
              value={data.serviceName}
              onChange={(v) => updateField('serviceName', v)}
              error={error}
              placeholder="e.g. Personal Training"
            />
            <Input
              label="Description"
              value={data.serviceDescription}
              onChange={(v) => updateField('serviceDescription', v)}
              placeholder="What does this service include?"
            />
          </div>
        </Card>
        <Card>
          <EmptyState label="No image uploaded yet" actionLabel="Upload image" onAction={() => {}} />
        </Card>
      </div>
    </StepLayout>
  )
}
