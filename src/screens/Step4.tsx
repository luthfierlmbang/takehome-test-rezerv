import { useNavigate } from 'react-router-dom'
import { MapPin } from '@phosphor-icons/react'
import { WizardLayout } from '../components/WizardLayout'
import { Toggle } from '../components/Toggle'
import { useBooking } from '../context/BookingContext'
import janineUrl from '../assets/coach-janine.png'
import lukeUrl from '../assets/coach-luke.png'
import leiaUrl from '../assets/coach-leia.png'
import hanUrl from '../assets/coach-han.png'

const COACHES = [
  { name: 'Janine Skuywalker', avatar: janineUrl },
  { name: 'Luke Skywalker', avatar: lukeUrl },
  { name: 'Leia Organa', avatar: leiaUrl },
  { name: 'Han Solo', avatar: hanUrl },
]

export default function Step4() {
  const navigate = useNavigate()
  const { data, updateField } = useBooking()

  function toggleCoach(name: string, checked: boolean) {
    updateField(
      'selectedCoaches',
      checked ? [...data.selectedCoaches, name] : data.selectedCoaches.filter((c) => c !== name),
    )
  }

  return (
    <WizardLayout stepIndex={1} onBack={() => navigate('/step-3')} onNext={() => navigate('/step-5')}>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-medium leading-[31px] text-black">Locations &amp; coaches</h2>
        <p className="text-base leading-[26px] text-brand-textMuted">
          Choose where this service is offered and who delivers it at each location.
        </p>
      </div>

      <div className="rounded-2xl border border-brand-border p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-base font-medium leading-[26px] text-black">Padel Arena KLCC</span>
              <span className="flex items-center gap-1 text-sm text-brand-textMuted">
                <MapPin size={16} />
                12 Jalan Ampang, Kuala Lumpur
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-textMuted">
              Offer at this location
              <Toggle
                label="Offer at this location"
                checked={data.offerAtLocation}
                onChange={(v) => updateField('offerAtLocation', v)}
              />
            </div>
          </div>

          <div className="border-t border-brand-border pt-4">
            <span id="coach-group-label" className="text-base font-medium leading-[26px] text-black">
              Coach
            </span>
            <div role="group" aria-labelledby="coach-group-label" className="mt-4 flex flex-wrap gap-4">
              {COACHES.map((coach) => {
                const checked = data.selectedCoaches.includes(coach.name)
                return (
                  <label
                    key={coach.name}
                    className="flex h-16 cursor-pointer items-center gap-4 rounded-lg border border-brand-border px-4"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => toggleCoach(coach.name, e.target.checked)}
                      className="h-5 w-5 rounded accent-brand-primary"
                    />
                    <span className="flex items-center gap-2">
                      <img src={coach.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                      <span className="text-sm font-medium text-black">{coach.name}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </WizardLayout>
  )
}
