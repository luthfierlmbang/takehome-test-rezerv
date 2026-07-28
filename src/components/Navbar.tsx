import { Link } from 'react-router-dom'

type NavItem = { label: string; href: string }

export function Navbar({ activeItem, items }: { activeItem: string; items: NavItem[] }) {
  return (
    <aside className="flex h-full w-[291px] flex-col justify-between border-r border-brand-border bg-white p-4">
      <nav className="flex flex-col gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`rounded-sm px-3 py-2 text-sm transition-colors hover:bg-brand-surfaceMuted ${
              item.label === activeItem ? 'bg-brand-surfaceMuted font-medium text-black' : 'text-brand-textMuted'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3 rounded-lg border border-brand-border bg-white p-3">
        <div className="h-8 w-8 rounded-full bg-brand-surfaceMuted" />
        <span className="text-sm">Account</span>
      </div>
    </aside>
  )
}
