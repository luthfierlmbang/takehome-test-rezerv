import { useNavigate } from 'react-router-dom'
import { Plus } from '@phosphor-icons/react'
import { AppShell } from '../components/AppShell'
import { Button } from '../components/Button'
import heroUrl from '../assets/hero-illustration.png'

export default function Step1() {
  const navigate = useNavigate()

  return (
    <AppShell title="Service">
      <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-6 pt-6">
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
