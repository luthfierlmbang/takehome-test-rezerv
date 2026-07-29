import { MagnifyingGlass } from '@phosphor-icons/react'

export function TopBar({ title }: { title: string }) {
  return (
    <div className="flex items-start justify-between bg-white px-6 pb-4 pt-6">
      <h1 className="text-[32px] font-medium leading-[38px] text-black">{title}</h1>
      <div className="flex h-9 w-[280px] items-center gap-2 rounded-lg border border-brand-border bg-white px-3">
        <MagnifyingGlass size={16} color="#71717A" />
        <input
          type="search"
          placeholder="Search"
          aria-label="Search"
          className="w-full bg-transparent text-sm text-black outline-none placeholder:text-[#A1A1AA]"
        />
      </div>
    </div>
  )
}
