import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
> & {
  variant: 'primary' | 'secondary'
  size?: 'sm' | 'lg'
  state?: 'default' | 'loading'
}

const VARIANT_CLASSES: Record<ButtonProps['variant'], string> = {
  primary: 'bg-brand-primary text-white hover:bg-[#0d4750] disabled:bg-brand-surfaceMuted disabled:text-[#D4D4D8]',
  secondary: 'bg-white border border-brand-border text-black hover:bg-brand-surfaceMuted disabled:text-[#D4D4D8]',
}

const SIZE_CLASSES = {
  sm: 'h-8 min-w-[130px] px-4 text-xs font-semibold',
  lg: 'h-12 px-6 text-base font-semibold',
}

export function Button({
  variant,
  size = 'sm',
  state = 'default',
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || state === 'loading'

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.15 }}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-colors disabled:cursor-not-allowed ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className ?? ''}`}
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
