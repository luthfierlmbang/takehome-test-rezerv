import { Link } from 'react-router-dom'
import { CaretRight, CourtBasketball, Gear, House, SidebarSimple } from '@phosphor-icons/react'
import logoUrl from '../assets/logo.svg'
import avatarUrl from '../assets/avatar-andrew.png'

type NavItem = { label: string; href: string; icon: 'overview' | 'service' }

const ICONS = { overview: House, service: CourtBasketball }

export function Navbar({ activeItem, items }: { activeItem: string; items: NavItem[] }) {
  return (
    <aside className="flex h-full w-[291px] shrink-0 flex-col justify-between bg-white p-4">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <img src={logoUrl} alt="rezerv" className="h-[51px] w-[173px] object-contain object-left" />
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4F4F5]">
            <SidebarSimple size={16} color="#71717A" />
          </span>
        </div>

        <nav aria-label="Main" className="flex flex-col gap-2">
          {items.map((item) => {
            const Icon = ICONS[item.icon]
            const isActive = item.label === activeItem
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex h-[37px] items-center justify-between rounded-lg border px-3 text-sm ${
                  isActive ? 'border-brand-border bg-brand-surfaceMuted' : 'border-transparent bg-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon size={20} color="#000000" />
                  <span className={isActive ? 'font-semibold text-black' : 'text-black'}>{item.label}</span>
                </span>
                <CaretRight size={16} color="#71717A" />
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex h-14 items-center gap-3 rounded-lg border border-brand-border bg-white px-2">
        <span className="relative shrink-0">
          <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-[1.5px] border-white bg-[#34A853]" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium leading-[21px] text-black">Andrew Chapman</span>
          <span className="truncate text-sm leading-[21px] text-brand-textMuted">andrewc@mail.com</span>
        </div>
        <span className="ml-auto shrink-0">
          <Gear size={16} color="#71717A" />
        </span>
      </div>
    </aside>
  )
}
