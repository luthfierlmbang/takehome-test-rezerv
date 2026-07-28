import { useId } from 'react'

type InputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
}

export function Input({ label, value, onChange, error, disabled, placeholder }: InputProps) {
  const id = useId()

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-black">
        {label}
      </label>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded-sm border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/40 disabled:bg-brand-surfaceMuted disabled:text-brand-textMuted ${
          error ? 'border-red-500' : 'border-brand-border focus:border-brand-primary'
        }`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
