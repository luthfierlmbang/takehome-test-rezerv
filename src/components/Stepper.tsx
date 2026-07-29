type StepState = 'completed' | 'current' | 'upcoming'

function stateFor(index: number, currentIndex: number): StepState {
  if (index < currentIndex) return 'completed'
  if (index === currentIndex) return 'current'
  return 'upcoming'
}

export function Stepper({ steps, currentIndex }: { steps: string[]; currentIndex: number }) {
  return (
    <ol aria-label="Steps" className="flex h-[62px] w-full items-start">
      {steps.map((step, i) => {
        const state = stateFor(i, currentIndex)
        const isLast = i === steps.length - 1
        return (
          <li
            key={step}
            data-testid={`step-${i}`}
            data-state={state}
            aria-current={state === 'current' ? 'step' : undefined}
            className={`flex items-start ${isLast ? '' : 'flex-1'}`}
          >
            <div className="relative flex w-6 shrink-0 flex-col items-center gap-1">
              <span
                className={`h-6 w-6 rounded-full ${state === 'upcoming' ? 'bg-brand-border' : 'bg-brand-primary'}`}
              />
              <span className="absolute top-7 whitespace-nowrap text-xs font-medium leading-[15px] text-black">
                {step}
              </span>
            </div>
            {!isLast && (
              <span className={`mt-[11px] h-0.5 flex-1 ${i < currentIndex ? 'bg-brand-primary' : 'bg-brand-border'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
