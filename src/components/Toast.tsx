import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle } from '@phosphor-icons/react'

/**
 * Transient confirmation that dismisses itself; `duration` is in milliseconds.
 *
 * Unmounts outright rather than exiting through AnimatePresence — `mode="wait"`
 * exits do not settle in this Framer Motion version, which would leave the toast
 * on screen forever.
 */
export function Toast({ message, duration = 3000 }: { message: string; duration?: number }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const id = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(id)
  }, [duration])

  if (!visible) return null

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-brand-primary px-4 py-3 text-sm font-medium text-white shadow-lg"
    >
      <CheckCircle size={18} weight="fill" />
      {message}
    </motion.div>
  )
}
