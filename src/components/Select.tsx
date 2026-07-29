import { useId } from 'react'
import { CaretDown } from '@phosphor-icons/react'

type SelectProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
}

/** Metrics match the Figma "Input/Text Fields" component: 16px label, 8px gap, 36px field. */
export function Select({ label, value, onChange, options, placeholder }: SelectProps) {
  const id = useId()

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base leading-[26px] text-black">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full appearance-none rounded-lg border border-brand-border bg-white px-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
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
        <CaretDown
          size={16}
          color="#71717A"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        />
      </div>
    </div>
  )
}
