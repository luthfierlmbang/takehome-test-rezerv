import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BookingProvider, useBooking } from './BookingContext'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <BookingProvider>{children}</BookingProvider>
    </MemoryRouter>
  )
}

test('updateField persists a value and goToStep changes currentStepIndex', () => {
  const { result } = renderHook(() => useBooking(), { wrapper })

  act(() => result.current.updateField('serviceName', 'Personal Training'))
  expect(result.current.data.serviceName).toBe('Personal Training')

  act(() => result.current.goToStep(2))
  expect(result.current.currentStepIndex).toBe(2)
})
