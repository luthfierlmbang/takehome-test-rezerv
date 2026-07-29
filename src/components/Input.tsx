import { useId } from 'react'

type InputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
}

/** Metrics match the Figma "Input/Text Fields" component: 16px label, 8px gap, 36px field. */
export function Input({ label, value, onChange, error, disabled, placeholder }: InputProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base leading-[26px] text-black">
        {label}
      </label>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className={`h-9 rounded-lg border px-3 text-sm text-black transition-colors placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-brand-primary/40 disabled:bg-brand-surfaceMuted disabled:text-brand-textMuted ${
          error ? 'border-red-500' : 'border-brand-border focus:border-brand-primary'
        }`}
      />
      {error && (
        <span id={errorId} className="text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  )
}
