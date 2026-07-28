import { Button } from './Button'

type EmptyStateProps = {
  label: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ label, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-brand-border p-8 text-center">
      <span className="text-sm text-brand-textMuted">{label}</span>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
