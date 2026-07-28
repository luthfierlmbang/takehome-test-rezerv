import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BookingProvider } from './context/BookingContext'
import Step1 from './screens/Step1'

export default function App() {
  return (
    <div data-testid="app-shell">
      <BrowserRouter>
        <BookingProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/step-1" replace />} />
            <Route path="/step-1" element={<Step1 />} />
            {/* Step routes are added one-by-one in Tasks 10-16 */}
          </Routes>
        </BookingProvider>
      </BrowserRouter>
    </div>
  )
}
