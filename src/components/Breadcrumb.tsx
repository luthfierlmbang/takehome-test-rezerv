import { CaretRight, House } from '@phosphor-icons/react'

export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={item} className="flex items-center gap-2">
            {i === 0 && <House size={16} color="#71717A" />}
            <span
              className={isLast ? 'font-medium text-black' : 'text-brand-textMuted'}
              aria-current={isLast ? 'page' : undefined}
            >
              {item}
            </span>
            {!isLast && (
              <span data-testid="breadcrumb-caret" aria-hidden>
                <CaretRight size={14} color="#71717A" />
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
