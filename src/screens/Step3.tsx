import { useNavigate } from 'react-router-dom'
import { Trash, UploadSimple } from '@phosphor-icons/react'
import { WizardLayout } from '../components/WizardLayout'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import { useBooking } from '../context/BookingContext'
import padelCourtUrl from '../assets/padel-court.png'

const SERVICE_TYPES = ['Padel', 'Tennis', 'Yoga', 'Personal Training']
const BOOKING_CATEGORIES = ['Class', 'Private session', 'Court rental']

export default function Step3() {
  const navigate = useNavigate()
  const { data, updateField } = useBooking()

  return (
    <WizardLayout stepIndex={0} backLabel="Cancel" onBack={() => navigate('/step-2')} onNext={() => navigate('/step-4')}>
      <div className="flex gap-4">
        <section className="flex-1 rounded-2xl border border-brand-border p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-medium leading-[31px] text-black">Basic details</h2>
              <p className="text-base leading-[26px] text-brand-textMuted">
                Add the essentials first. You'll set up locations, coaches, availability, and pricing next.
              </p>
            </div>
            <Select
              label="Service Type"
              value={data.serviceType}
              onChange={(v) => updateField('serviceType', v)}
              options={SERVICE_TYPES}
              placeholder="Padel"
            />
            <Input label="Service Name" value={data.serviceName} onChange={(v) => updateField('serviceName', v)} />
            <Select
              label="Booking category"
              value={data.bookingCategory}
              onChange={(v) => updateField('bookingCategory', v)}
              options={BOOKING_CATEGORIES}
              placeholder="Select a category"
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-sm font-medium text-black">
                Description
              </label>
              <textarea
                id="description"
                value={data.serviceDescription}
                onChange={(e) => updateField('serviceDescription', e.target.value)}
                rows={3}
                className="rounded-lg border border-brand-border px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
            </div>
          </div>
        </section>

        <section className="flex-1 rounded-2xl border border-brand-border p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-medium leading-[31px] text-black">Image</h2>
              <p className="text-base leading-[26px] text-brand-textMuted">
                Add the essentials first. You'll set up locations, coaches, availability, and pricing next.
              </p>
            </div>
            <img src={padelCourtUrl} alt="" className="h-[250px] w-full rounded-lg object-cover" />
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => updateField('hasImage', false)}
                className="flex h-8 flex-1 items-center justify-center gap-2 rounded-lg border border-[#F5A3A3] text-xs font-semibold text-[#D92D20]"
              >
                <Trash size={16} />
                Remove
              </button>
              <button
                type="button"
                className="flex h-8 flex-1 items-center justify-center gap-2 rounded-lg border border-brand-border text-xs font-semibold text-[#0B0B0B]"
              >
                <UploadSimple size={16} />
                Change image
              </button>
            </div>
          </div>
        </section>
      </div>
    </WizardLayout>
  )
}
