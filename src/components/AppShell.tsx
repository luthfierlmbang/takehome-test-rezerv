import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { TopBar } from './TopBar'

const NAV_ITEMS = [
  { label: 'Overview', href: '/step-1', icon: 'overview' as const },
  { label: 'Service', href: '/step-2', icon: 'service' as const },
]

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Navbar activeItem="Service" items={NAV_ITEMS} />
      <main className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={title} />
        {children}
      </main>
    </div>
  )
}
