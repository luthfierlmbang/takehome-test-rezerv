import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DotsThree, MapPin, Plus } from '@phosphor-icons/react'
import { AppShell } from '../components/AppShell'
import { Button } from '../components/Button'
import { Toast } from '../components/Toast'
import { useBooking, type BookingData } from '../context/BookingContext'
import heroUrl from '../assets/hero-illustration.png'
import padelCourtUrl from '../assets/padel-court.png'

function summarizeDurations(service: BookingData) {
  return service.selectedDurations.length ? service.selectedDurations.join(' / ') : '—'
}

function summarizePrice(service: BookingData) {
  return service.basePrice ? `$${service.basePrice} per session` : '—'
}

export default function Step1() {
  const navigate = useNavigate()
  const location = useLocation()
  const { publishedServices } = useBooking()
  const justPublished = (location.state as { justPublished?: boolean } | null)?.justPublished

  if (publishedServices.length === 0) {
    return (
      <AppShell title="Service">
        <div className="flex flex-1 flex-col overflow-y-auto pb-6 pl-[15px] pr-6 pt-6">
          <div className="flex flex-col items-center gap-[25px] rounded-2xl border border-brand-border p-6">
            <img src={heroUrl} alt="" className="h-[180px] w-[180px] object-contain" />
            <div className="flex w-full flex-col gap-4 text-center">
              <h2 className="text-xl font-semibold leading-[26px] text-brand-textMuted">Create your first service</h2>
              <p className="text-xl leading-[26px] text-brand-textMuted">
                Set up what customers can book, including the service details, coaches, availability, and pricing.
              </p>
            </div>
            <Button variant="primary" size="lg" onClick={() => navigate('/step-2')}>
              Create Service
              <Plus size={20} />
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Service">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-6 pl-[15px] pr-6 pt-6">
        {justPublished && <Toast message="Service published — customers can book it now." />}

        <div className="flex items-center justify-between">
          <span className="text-base font-medium leading-[26px] text-black">
            {publishedServices.length} {publishedServices.length === 1 ? 'service' : 'services'}
          </span>
          <Button variant="primary" onClick={() => navigate('/step-2')}>
            Create Service
            <Plus size={16} />
          </Button>
        </div>

        <ul className="flex flex-col gap-4">
          {publishedServices.map((service, i) => (
            <motion.li
              key={`${service.serviceName}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: 'easeOut' }}
              whileHover={{ y: -2 }}
              className="flex items-center gap-4 rounded-2xl border border-brand-border p-4"
            >
              <img
                src={padelCourtUrl}
                alt=""
                className="h-20 w-28 shrink-0 rounded-lg bg-brand-surfaceMuted object-cover"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-base font-medium leading-[26px] text-black">
                    {service.serviceName || 'Untitled service'}
                  </span>
                  <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary">
                    Live
                  </span>
                </div>
                <span className="flex items-center gap-1 text-sm text-brand-textMuted">
                  <MapPin size={14} />
                  {service.offerAtLocation ? 'Padel Arena KLCC' : 'No location'}
                  {service.selectedCoaches.length > 0 && ` · ${service.selectedCoaches.length} coaches`}
                </span>
                <span className="text-sm text-brand-textMuted">
                  {summarizeDurations(service)} · {summarizePrice(service)}
                </span>
              </div>
              <button
                type="button"
                aria-label={`More options for ${service.serviceName || 'this service'}`}
                className="shrink-0 rounded-lg p-2 text-brand-textMuted transition-colors hover:bg-brand-surfaceMuted"
              >
                <DotsThree size={20} weight="bold" />
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </AppShell>
  )
}
