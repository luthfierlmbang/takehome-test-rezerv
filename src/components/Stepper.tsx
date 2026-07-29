import { motion } from 'framer-motion'

type StepState = 'completed' | 'current' | 'upcoming'

function stateFor(index: number, currentIndex: number): StepState {
  if (index < currentIndex) return 'completed'
  if (index === currentIndex) return 'current'
  return 'upcoming'
}

const STATE_CLASSES: Record<StepState, string> = {
  completed: 'bg-brand-primary text-white',
  current: 'bg-white border-2 border-brand-primary text-brand-primary',
  upcoming: 'bg-brand-surfaceMuted text-brand-textMuted',
}

export function Stepper({ steps, currentIndex }: { steps: string[]; currentIndex: number }) {
  return (
    <ol aria-label="Steps" className="flex w-full items-center gap-2">
      {steps.map((step, i) => {
        const state = stateFor(i, currentIndex)
        return (
          <li
            key={step}
            data-testid={`step-${i}`}
            data-state={state}
            aria-current={state === 'current' ? 'step' : undefined}
            className="flex flex-1 flex-col items-center gap-1"
          >
            <motion.span
              layout
              transition={{ duration: 0.25 }}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${STATE_CLASSES[state]}`}
            >
              {i + 1}
            </motion.span>
            <span className="text-xs text-brand-textMuted">{step}</span>
          </li>
        )
      })}
    </ol>
  )
}
