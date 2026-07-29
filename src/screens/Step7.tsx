import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { StepLayout } from '../components/StepLayout'
import { Card } from '../components/Card'
import { ErrorBanner } from '../components/ErrorBanner'
import { useBooking } from '../context/BookingContext'
import { simulateAsyncLoad } from '../lib/simulateAsyncLoad'

const REVIEW_ROWS: { label: string; key: keyof ReturnType<typeof useBooking>['data'] }[] = [
  { label: 'Service', key: 'serviceName' },
  { label: 'Locations', key: 'location' },
  { label: 'Coaches', key: 'coach' },
  { label: 'Durations', key: 'duration' },
  { label: 'Pricing', key: 'price' },
  { label: 'Payment', key: 'paymentMethod' },
]

export default function Step7() {
  const navigate = useNavigate()
  const { data } = useBooking()
  const [status, setStatus] = useState<'idle' | 'publishing' | 'error' | 'success'>('idle')
  // Deterministic, testable trigger for the failure path (no Math.random): typing the
  // "fail" sentinel into the service name simulates a publish error on the first attempt
  // only, so retrying (without touching the sentinel) demonstrates the recovery path.
  const hasFailedRef = useRef(false)

  async function handlePublish() {
    setStatus('publishing')
    const shouldFail =
      import.meta.env.DEV && data.serviceName.trim().toLowerCase() === 'fail' && !hasFailedRef.current
    try {
      await simulateAsyncLoad(600, shouldFail)
      setStatus('success')
    } catch {
      hasFailedRef.current = true
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <StepLayout stepIndex={5} title="Review" description="Your service is live." onNext={() => {}} backDisabled>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card>
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="text-lg font-medium text-black">Service published</span>
              <p className="text-sm text-brand-textMuted">Customers can now book "{data.serviceName || 'this service'}".</p>
            </div>
          </Card>
        </motion.div>
      </StepLayout>
    )
  }

  return (
    <StepLayout
      stepIndex={5}
      title="Review"
      description="Check the booking page preview on the right before publishing."
      onBack={() => navigate('/step-6')}
      onNext={handlePublish}
      nextLabel="Publish"
      nextState={status === 'publishing' ? 'loading' : 'default'}
    >
      <div className="flex flex-col gap-4">
        {status === 'error' && <ErrorBanner message="Publishing failed. Please try again." />}
        <Card>
          <dl data-testid="review-details" className="flex flex-col divide-y divide-brand-border">
            {REVIEW_ROWS.map((row) => (
              <div key={row.key} className="flex items-center justify-between py-3">
                <dt className="text-sm text-brand-textMuted">{row.label}</dt>
                <dd className="text-sm text-black">{data[row.key] || '—'}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </StepLayout>
  )
}
