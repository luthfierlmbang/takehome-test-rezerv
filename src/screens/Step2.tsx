import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WizardLayout } from '../components/WizardLayout'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import { useBooking } from '../context/BookingContext'
import { ImageUploader } from '../components/ImageUploader'

const SERVICE_TYPES = ['Padel', 'Tennis', 'Yoga', 'Personal Training']
const BOOKING_CATEGORIES = ['Class', 'Private session', 'Court rental']

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
    <WizardLayout
      stepIndex={0}
      skeleton="form"
      backLabel="Cancel"
      onBack={() => navigate('/step-1')}
      onNext={handleNext}
    >
      <div className="flex items-start gap-4">
        <section className="flex-1 rounded-2xl border border-brand-border p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-medium leading-[31px] text-black">Basic details</h2>
              <p className="text-base leading-[26px] text-brand-textMuted">
                Add the essentials first. You'll set up locations, coaches, availability, and pricing next.
              </p>
            </div>
            <div className="flex flex-col gap-4">
            <Select
              label="Service Type"
              value={data.serviceType}
              onChange={(v) => updateField('serviceType', v)}
              options={SERVICE_TYPES}
              placeholder="Padel"
            />
            <Input
              label="Service Name"
              value={data.serviceName}
              onChange={(v) => updateField('serviceName', v)}
              error={error}
              placeholder="e.g. Private Padel Coaching"
            />
            <Select
              label="Booking category"
              value={data.bookingCategory}
              onChange={(v) => updateField('bookingCategory', v)}
              options={BOOKING_CATEGORIES}
              placeholder="Select a category"
            />
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-base leading-[26px] text-black">
                Description
              </label>
              <textarea
                id="description"
                value={data.serviceDescription}
                onChange={(e) => updateField('serviceDescription', e.target.value)}
                placeholder="Tell customers what this service includes, who it's for, and what they should bring."
                className="h-[122px] resize-none rounded-lg border border-brand-border px-3 py-2 text-sm text-black outline-none placeholder:text-[#A1A1AA] focus:ring-2 focus:ring-brand-primary/40"
              />
            </div>
            </div>
          </div>
        </section>

        <section className="flex-1 rounded-2xl border border-brand-border p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-medium leading-[31px] text-black">Add a service image</h2>
              <p className="text-base leading-[26px] text-brand-textMuted">
                Use a clear image that helps customers recognise this service at a glance.
              </p>
            </div>
            <ImageUploader hasImage={data.hasImage} onChange={(v) => updateField('hasImage', v)} />
          </div>
        </section>
      </div>
    </WizardLayout>
  )
}
