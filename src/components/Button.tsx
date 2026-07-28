import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: 'primary' | 'secondary'
  state?: 'default' | 'loading'
}

const VARIANT_CLASSES: Record<ButtonProps['variant'], string> = {
  primary: 'bg-brand-primary text-white hover:bg-[#0d4750] disabled:bg-[#083035]/40',
  secondary: 'bg-white border border-brand-border text-black hover:bg-brand-surfaceMuted disabled:opacity-40',
}

export function Button({ variant, state = 'default', disabled, className, children, ...rest }: ButtonProps) {
  const isDisabled = disabled || state === 'loading'

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.15 }}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className ?? ''}`}
      {...rest}
    >
      {state === 'loading' && (
        <span
          data-testid="button-spinner"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </motion.button>
  )
}
