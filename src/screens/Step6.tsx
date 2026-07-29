import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WizardLayout } from '../components/WizardLayout'
import { Card } from '../components/Card'
import { ErrorBanner } from '../components/ErrorBanner'
import { useBooking, type BookingData } from '../context/BookingContext'
import { simulateAsyncLoad } from '../lib/simulateAsyncLoad'

/** Only rules with a usable window and price actually change what a customer pays. */
function summarizePricing(data: BookingData): string {
  if (!data.basePrice) return '—'
  const active = data.priceRules.filter((r) => r.from && r.to && r.price).length
  if (active === 0) return `Base $${data.basePrice}`
  return `Base $${data.basePrice} + ${active} time rule${active > 1 ? 's' : ''}`
}

function summarize(data: BookingData) {
  return {
    Service: data.serviceName || '—',
    Locations: data.offerAtLocation ? 'Padel Arena KLCC' : '—',
    Coaches: data.selectedCoaches.length ? data.selectedCoaches.join(', ') : '—',
    Durations: data.selectedDurations.length ? data.selectedDurations.join(' / ') : '—',
    'Start times': data.bookableFrom && data.bookableUntil ? `${data.bookableFrom} – ${data.bookableUntil}` : '—',
    Pricing: summarizePricing(data),
    Payment:
      [data.paymentDropIn && 'Drop-in', data.paymentClassPack && 'Class pack'].filter(Boolean).join(' · ') || '—',
  }
}

export default function Step6() {
  const navigate = useNavigate()
  const { data, publishService } = useBooking()
  const [status, setStatus] = useState<'idle' | 'publishing' | 'error'>('idle')
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
      // The published service becomes the Service screen's filled state, so land the
      // user back there rather than on a dead-end confirmation panel.
      publishService()
      navigate('/step-1', { state: { justPublished: true } })
    } catch {
      hasFailedRef.current = true
      setStatus('error')
    }
  }

  const summary = summarize(data)

  return (
    <WizardLayout
      stepIndex={4}
      onBack={() => navigate('/step-5')}
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
