import { useRef } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BookingProvider } from './context/BookingContext'
import Step1 from './screens/Step1'
import Step2 from './screens/Step2'
import Step3 from './screens/Step3'
import Step4 from './screens/Step4'
import Step5 from './screens/Step5'
import Step6 from './screens/Step6'
import Step7 from './screens/Step7'

/** Extracts the numeric step from a `/step-N` pathname; 0 for anything else (e.g. `/`). */
function stepNumberFor(pathname: string): number {
  const match = pathname.match(/step-(\d+)/)
  return match ? Number(match[1]) : 0
}

/**
 * Wraps the routed screen in a fade + horizontal-slide transition whose direction reflects
 * whether the user moved forward (Next) or backward (Back) through the wizard, derived by
 * comparing the numeric step of the previous and current pathname.
 */
function AnimatedRoutes() {
  const location = useLocation()
  const currentStep = stepNumberFor(location.pathname)
  const prevStepRef = useRef(currentStep)
  const directionRef = useRef(1)

  if (currentStep !== prevStepRef.current) {
    directionRef.current = currentStep > prevStepRef.current ? 1 : -1
    prevStepRef.current = currentStep
  }
  const direction = directionRef.current

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 32 * direction }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -32 * direction }}
        transition={{ duration: 0.25 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/step-1" replace />} />
          <Route path="/step-1" element={<Step1 />} />
          <Route path="/step-2" element={<Step2 />} />
          <Route path="/step-3" element={<Step3 />} />
          <Route path="/step-4" element={<Step4 />} />
          <Route path="/step-5" element={<Step5 />} />
          <Route path="/step-6" element={<Step6 />} />
          <Route path="/step-7" element={<Step7 />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <div data-testid="app-shell">
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <BookingProvider>
            <AnimatedRoutes />
          </BookingProvider>
        </BrowserRouter>
      </MotionConfig>
    </div>
  )
}
