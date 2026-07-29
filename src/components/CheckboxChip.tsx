import type { ReactNode } from 'react'

export function CheckboxChip({
  label,
  checked,
  onChange,
  icon,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  icon?: ReactNode
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
        checked ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-border'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded-sm accent-brand-primary"
      />
      {icon}
      <span className="text-black">{label}</span>
    </label>
  )
}
