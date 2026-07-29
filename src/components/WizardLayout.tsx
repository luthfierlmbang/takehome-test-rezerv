import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { AppShell } from './AppShell'
import { Breadcrumb } from './Breadcrumb'
import { Stepper } from './Stepper'
import { FormSkeleton, SectionSkeleton } from './Skeleton'
import { Button } from './Button'
import { simulateAsyncLoad } from '../lib/simulateAsyncLoad'

const STEP_LABELS = ['Details', 'Locations & Coaches', 'Schedule', 'Pricing', 'Review']

type WizardLayoutProps = {
  stepIndex: number
  /** Picks the skeleton shape so the placeholder matches the screen it stands in for. */
  skeleton?: 'form' | 'section'
  onNext: () => void
  onBack?: () => void
  nextLabel?: string
  backLabel?: string
  nextState?: 'default' | 'loading'
  nextDisabled?: boolean
  backDisabled?: boolean
  children: ReactNode
}

export function WizardLayout({
  stepIndex,
  skeleton = 'section',
  onNext,
  onBack,
  nextLabel = 'Next',
  backLabel = 'Back',
  nextState,
  nextDisabled,
  backDisabled,
  children,
}: WizardLayoutProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    let cancelled = false
    simulateAsyncLoad().then(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [stepIndex])

  return (
    <AppShell title="Create a service">
      <div
        data-testid="step-content-region"
        aria-busy={loading}
        className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-6"
      >
        <Breadcrumb items={['Home', 'Create Service']} />
        <Stepper steps={STEP_LABELS} currentIndex={stepIndex} />
        {loading ? (
          skeleton === 'form' ? (
            <FormSkeleton />
          ) : (
            <SectionSkeleton />
          )
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-1 flex-col gap-4"
          >
            {children}
          </motion.div>
        )}
      </div>
      <div className="shrink-0 px-6 pb-6">
        <div className="flex h-16 items-center justify-end gap-4 rounded-2xl border border-brand-border bg-white px-4">
          <Button variant="secondary" onClick={onBack} disabled={backDisabled || !onBack}>
            {backLabel !== 'Cancel' && <ArrowLeft size={16} />}
            {backLabel}
          </Button>
          <Button variant="primary" onClick={onNext} state={nextState} disabled={nextDisabled}>
            {nextLabel}
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
