/**
 * Shimmer placeholder. The sweep is a moving highlight rather than a whole-block
 * pulse, so a group of skeletons reads as one loading surface.
 */
export function Skeleton({ className = 'h-4 w-full' }: { className?: string }) {
  return (
    <div
      data-testid="skeleton"
      className={`relative overflow-hidden rounded-lg bg-brand-surfaceMuted ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  )
}

/** Mirrors the two-column card layout used by the Details steps. */
export function FormSkeleton() {
  return (
    <div className="flex gap-4">
      {[0, 1].map((column) => (
        <div key={column} className="flex-1 rounded-2xl border border-brand-border p-6">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Mirrors the single full-width card used by the later steps. */
export function SectionSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-96" />
      </div>
      <div className="rounded-2xl border border-brand-border p-6">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-4">
            <Skeleton className="h-16 w-56" />
            <Skeleton className="h-16 w-56" />
            <Skeleton className="h-16 w-56" />
          </div>
        </div>
      </div>
    </div>
  )
}
