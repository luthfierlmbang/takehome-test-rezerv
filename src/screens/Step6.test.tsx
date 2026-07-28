import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BookingProvider } from '../context/BookingContext'
import Step6 from './Step6'

test('renders price and payment method fields', async () => {
  render(
    <MemoryRouter initialEntries={['/step-6']}>
      <BookingProvider>
        <Step6 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => expect(screen.getByLabelText('Base price')).toBeInTheDocument())
  expect(screen.getByLabelText('Payment method')).toBeInTheDocument()
})
