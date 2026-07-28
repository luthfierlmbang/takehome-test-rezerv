import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from './Navbar'
import { Breadcrumb } from './Breadcrumb'
import { Stepper } from './Stepper'
import { PageHeader } from './PageHeader'
import { ActionButtons } from './ActionButtons'
import { Skeleton } from './Skeleton'
import { simulateAsyncLoad } from '../lib/simulateAsyncLoad'

const STEP_LABELS = ['Overview', 'Basic details', 'Locations', 'Durations', 'Pricing', 'Payment', 'Review']
const NAV_ITEMS = [
  { label: 'Services', href: '/step-1' },
  { label: 'Calendar', href: '#' },
]

type StepLayoutProps = {
  stepIndex: number
  title: string
  description: string
  onNext: () => void
  onBack?: () => void
  nextLabel?: string
  nextState?: 'default' | 'loading'
  backDisabled?: boolean
  children: ReactNode
}

export function StepLayout({
  stepIndex,
  title,
  description,
  onNext,
  onBack,
  nextLabel,
  nextState,
  backDisabled,
  children,
}: StepLayoutProps) {
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
    <div className="flex h-screen overflow-hidden bg-white">
      <Navbar activeItem="Services" items={NAV_ITEMS} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <PageHeader title={title} description={description} />
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-8 py-6">
          <Breadcrumb items={['Services', title]} />
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
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="shrink-0 px-8 pb-6">
          <ActionButtons
            onBack={onBack}
            onNext={onNext}
            nextLabel={nextLabel}
            nextState={nextState}
            backDisabled={backDisabled}
          />
        </div>
      </div>
    </div>
  )
}
