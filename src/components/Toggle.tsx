import { motion } from 'framer-motion'

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      whileTap={{ scale: 0.94 }}
      animate={{ backgroundColor: checked ? '#083035' : '#E4E4E7' }}
      transition={{ duration: 0.2 }}
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full px-0.5"
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="h-5 w-5 rounded-full bg-white shadow-sm"
        style={{ marginLeft: checked ? 'auto' : 0 }}
      />
    </motion.button>
  )
}
