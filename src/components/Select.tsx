import { useId } from 'react'
import { ChevronDown } from 'lucide-react'

type SelectProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
}

export function Select({ label, value, onChange, options, placeholder }: SelectProps) {
  const id = useId()

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-black">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-textMuted" />
      </div>
    </div>
  )
}
