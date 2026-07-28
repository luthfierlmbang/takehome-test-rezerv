import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { BookingProvider } from '../context/BookingContext'
import Step3 from './Step3'

test('renders and navigates back and forward', async () => {
  render(
    <MemoryRouter initialEntries={['/step-3']}>
      <BookingProvider>
        <Step3 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => screen.getByRole('button', { name: 'Back' }))
  expect(screen.getByRole('button', { name: 'Back' })).not.toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
})
