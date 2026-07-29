import { motion } from 'framer-motion'

export function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {message}
    </motion.div>
  )
}
