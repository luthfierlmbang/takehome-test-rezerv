export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-brand-textMuted">
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-2">
          <span
            className={i === items.length - 1 ? 'text-black' : ''}
            aria-current={i === items.length - 1 ? 'page' : undefined}
          >
            {item}
          </span>
          {i < items.length - 1 && (
            <span data-testid="breadcrumb-caret" aria-hidden>
              ›
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
