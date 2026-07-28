import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BookingProvider } from './context/BookingContext'
import Step1 from './screens/Step1'
import Step2 from './screens/Step2'
import Step3 from './screens/Step3'
import Step4 from './screens/Step4'
import Step5 from './screens/Step5'
import Step6 from './screens/Step6'
import Step7 from './screens/Step7'

export default function App() {
  return (
    <div data-testid="app-shell">
      <BrowserRouter>
        <BookingProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/step-1" replace />} />
            <Route path="/step-1" element={<Step1 />} />
            <Route path="/step-2" element={<Step2 />} />
            <Route path="/step-3" element={<Step3 />} />
            <Route path="/step-4" element={<Step4 />} />
            <Route path="/step-5" element={<Step5 />} />
            <Route path="/step-6" element={<Step6 />} />
            <Route path="/step-7" element={<Step7 />} />
          </Routes>
        </BookingProvider>
      </BrowserRouter>
    </div>
  )
}
