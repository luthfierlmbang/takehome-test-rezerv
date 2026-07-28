import { useNavigate } from 'react-router-dom'
import { StepLayout } from '../components/StepLayout'
import { Card } from '../components/Card'

export default function Step1() {
  const navigate = useNavigate()

  return (
    <StepLayout
      stepIndex={0}
      title="New service"
      description="Set up a bookable service in a few quick steps."
      onNext={() => navigate('/step-2')}
      nextLabel="Get started"
      backDisabled
    >
      <Card>
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="h-[180px] w-[180px] rounded-lg bg-brand-surfaceMuted" />
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-medium text-brand-textMuted">Create your first service</h2>
            <p className="max-w-md text-sm text-brand-textMuted">
              Tell us the basics, then add locations, coaches, durations, and pricing.
            </p>
          </div>
        </div>
      </Card>
    </StepLayout>
  )
}
