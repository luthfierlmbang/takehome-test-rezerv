import { motion } from 'framer-motion'
import { Check } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

/**
 * Figma's "option" chip, used for durations, available days and payment methods alike —
 * all three share one spec: 53px tall, 16px padding, 16px gap, 8px radius, a neutral
 * #E4E4E7 border that does *not* change with the state, and a 14px Inter Medium label.
 *
 * The chip border staying neutral is deliberate: in the design only the box carries the
 * checked state, so the row reads as a set of equal chips rather than a set of buttons.
 *
 * The native input is kept for keyboard and screen-reader behaviour but visually hidden,
 * because the design's box (dark fill, blue ring, white tick) can't be had from
 * `accent-color` alone.
 */
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
    <motion.label
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="flex h-[53px] cursor-pointer items-center gap-4 rounded-lg border border-brand-border px-4 focus-within:ring-2 focus-within:ring-brand-primary/40"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <motion.span
        aria-hidden
        animate={{
          backgroundColor: checked ? '#083035' : '#E4E4E7',
          borderColor: checked ? '#4E61F6' : '#D4D4D8',
        }}
        transition={{ duration: 0.15 }}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded border"
      >
        <motion.span
          initial={false}
          animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 24 }}
          className="flex"
        >
          <Check size={12} weight="bold" color="#FFFFFF" />
        </motion.span>
      </motion.span>
      {icon}
      <span className="text-sm font-medium leading-[21px] text-black">{label}</span>
    </motion.label>
  )
}
