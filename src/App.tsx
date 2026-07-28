import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BookingProvider } from './context/BookingContext'

export default function App() {
  return (
    <div data-testid="app-shell">
      <BrowserRouter>
        <BookingProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/step-1" replace />} />
            {/* Step routes are added one-by-one in Tasks 10-16 */}
          </Routes>
        </BookingProvider>
      </BrowserRouter>
    </div>
  )
}
