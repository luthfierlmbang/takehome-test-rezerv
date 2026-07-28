import { useNavigate } from 'react-router-dom'
import { StepLayout } from '../components/StepLayout'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { useBooking } from '../context/BookingContext'

export default function Step5() {
  const navigate = useNavigate()
  const { data, updateField } = useBooking()

  return (
    <StepLayout
      stepIndex={3}
      title="Bookable durations & settings"
      description="Set how long each session runs."
      onBack={() => navigate('/step-4')}
      onNext={() => navigate('/step-6')}
    >
      <Card>
        <Input
          label="Duration (minutes)"
          value={data.duration}
          onChange={(v) => updateField('duration', v)}
          placeholder="e.g. 60"
        />
      </Card>
    </StepLayout>
  )
}
