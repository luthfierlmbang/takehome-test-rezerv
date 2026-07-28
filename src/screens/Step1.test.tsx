import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { BookingProvider } from '../context/BookingContext'
import Step1 from './Step1'

test('renders intro content and advances on Next click', async () => {
  render(
    <MemoryRouter initialEntries={['/step-1']}>
      <BookingProvider>
        <Step1 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => expect(screen.getByText(/create your first service/i)).toBeInTheDocument())
  await userEvent.click(screen.getByRole('button', { name: 'Get started' }))
})
