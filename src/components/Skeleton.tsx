export function Skeleton({ className = 'h-4 w-full' }: { className?: string }) {
  return <div data-testid="skeleton" className={`animate-pulse rounded-sm bg-brand-surfaceMuted ${className}`} />
}
