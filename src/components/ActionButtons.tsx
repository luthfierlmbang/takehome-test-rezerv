import { Button } from './Button'

type ActionButtonsProps = {
  onBack?: () => void
  onNext: () => void
  nextLabel?: string
  nextState?: 'default' | 'loading'
  backDisabled?: boolean
}

export function ActionButtons({ onBack, onNext, nextLabel = 'Next', nextState, backDisabled }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-4 rounded-lg border border-brand-border bg-white px-4 py-4">
      <Button variant="secondary" onClick={onBack} disabled={backDisabled || !onBack}>
        Back
      </Button>
      <Button variant="primary" onClick={onNext} state={nextState}>
        {nextLabel}
      </Button>
    </div>
  )
}
