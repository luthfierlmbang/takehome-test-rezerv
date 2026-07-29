import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { WizardLayout } from '../components/WizardLayout'
import { Card } from '../components/Card'
import { ErrorBanner } from '../components/ErrorBanner'
import { useBooking, type BookingData } from '../context/BookingContext'
import { simulateAsyncLoad } from '../lib/simulateAsyncLoad'

function summarize(data: BookingData) {
  return {
    Service: data.serviceName || '—',
    Locations: data.offerAtLocation ? 'Padel Arena KLCC' : '—',
    Coaches: data.selectedCoaches.length ? data.selectedCoaches.join(', ') : '—',
    Durations: data.selectedDurations.length ? data.selectedDurations.join(' / ') : '—',
    'Start times': data.bookableFrom && data.bookableUntil ? `${data.bookableFrom} – ${data.bookableUntil}` : '—',
    Pricing: data.basePrice ? `Base $${data.basePrice}${data.rulePrice ? ' + 1 time rule' : ''}` : '—',
    Payment:
      [data.paymentDropIn && 'Drop-in', data.paymentClassPack && 'Class pack'].filter(Boolean).join(' · ') || '—',
  }
}

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
      <WizardLayout stepIndex={4} onNext={() => {}} backDisabled>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card>
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="text-lg font-medium text-black">Service published</span>
              <p className="text-sm text-brand-textMuted">Customers can now book "{data.serviceName || 'this service'}".</p>
            </div>
          </Card>
        </motion.div>
      </WizardLayout>
    )
  }

  const summary = summarize(data)

  return (
    <WizardLayout
      stepIndex={4}
      onBack={() => navigate('/step-6')}
      onNext={handlePublish}
      nextLabel="Publish Service"
      nextState={status === 'publishing' ? 'loading' : 'default'}
    >
      <div>
        <h2 className="text-2xl font-medium leading-[31px] text-black">Review this is what customers will see</h2>
        <p className="text-base leading-[26px] text-brand-textMuted">Check the booking page preview. Anything off? Jump straight back to that step.</p>
      </div>
      {status === 'error' && <ErrorBanner message="Publishing failed. Please try again." />}
      <Card>
        <dl data-testid="review-details" className="flex flex-col divide-y divide-brand-border">
          {Object.entries(summary).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-3">
              <dt className="text-sm text-brand-textMuted">{label}</dt>
              <dd className="text-sm text-black">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </WizardLayout>
  )
}
