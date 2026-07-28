import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { BookingProvider } from '../context/BookingContext'
import Step2 from './Step2'

test('fills service name/description and shows an empty image placeholder', async () => {
  render(
    <MemoryRouter initialEntries={['/step-2']}>
      <BookingProvider>
        <Step2 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => expect(screen.getByLabelText('Service name')).toBeInTheDocument())
  expect(screen.getByText(/no image uploaded/i)).toBeInTheDocument()

  await userEvent.type(screen.getByLabelText('Service name'), 'Personal Training')
  expect(screen.getByLabelText('Service name')).toHaveValue('Personal Training')
})

test('shows an inline error when Next is clicked with an empty service name', async () => {
  render(
    <MemoryRouter initialEntries={['/step-2']}>
      <BookingProvider>
        <Step2 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => expect(screen.getByLabelText('Service name')).toBeInTheDocument())
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
  expect(screen.getByText('Service name is required')).toBeInTheDocument()
})
