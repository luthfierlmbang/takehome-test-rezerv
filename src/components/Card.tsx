import type { ReactNode } from 'react'

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-brand-border p-6">
      <div>{children}</div>
    </div>
  )
}
