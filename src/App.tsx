import { MotionConfig } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BookingProvider } from './context/BookingContext'
import Step1 from './screens/Step1'
import Step2 from './screens/Step2'
import Step3 from './screens/Step3'
import Step4 from './screens/Step4'
import Step5 from './screens/Step5'
import Step6 from './screens/Step6'

export default function App() {
  return (
    <div data-testid="app-shell">
      <MotionConfig reducedMotion="user">
        {/* Vite's base is "/" locally and "/<repo>/" on GitHub Pages; the router has to
            match it or none of the /step-N paths resolve once deployed. */}
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <BookingProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/step-1" replace />} />
              <Route path="/step-1" element={<Step1 />} />
              <Route path="/step-2" element={<Step2 />} />
              <Route path="/step-3" element={<Step3 />} />
              <Route path="/step-4" element={<Step4 />} />
              <Route path="/step-5" element={<Step5 />} />
              <Route path="/step-6" element={<Step6 />} />
            </Routes>
          </BookingProvider>
        </BrowserRouter>
      </MotionConfig>
    </div>
  )
}
