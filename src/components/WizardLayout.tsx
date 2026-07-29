import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { AppShell } from './AppShell'
import { Breadcrumb } from './Breadcrumb'
import { Stepper } from './Stepper'
import { Skeleton } from './Skeleton'
import { Button } from './Button'
import { simulateAsyncLoad } from '../lib/simulateAsyncLoad'

const STEP_LABELS = ['Details', 'Locations & Coaches', 'Schedule', 'Pricing', 'Review']

type WizardLayoutProps = {
  stepIndex: number
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
        className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6"
      >
        <Breadcrumb items={['Home', 'Create Service']} />
        <Stepper steps={STEP_LABELS} currentIndex={stepIndex} />
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" exit={{ opacity: 0 }} className="flex flex-col gap-3">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-8 w-1/2" />
            </motion.div>
          ) : (
            <motion.div
              key={`content-${stepIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-1 flex-col gap-4"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
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
