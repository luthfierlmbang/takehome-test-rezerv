import { motion } from 'framer-motion'
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
    <motion.label
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      animate={{
        borderColor: checked ? '#083035' : '#E4E4E7',
        backgroundColor: checked ? 'rgba(8,48,53,0.04)' : 'rgba(255,255,255,0)',
      }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded accent-brand-primary"
      />
      {icon}
      <span className="text-black">{label}</span>
    </motion.label>
  )
}
