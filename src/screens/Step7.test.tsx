import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { BookingProvider } from '../context/BookingContext'
import Step7 from './Step7'

test('renders a read-only review of booking data', async () => {
  render(
    <MemoryRouter initialEntries={['/step-7']}>
      <BookingProvider>
        <Step7 />
      </BookingProvider>
    </MemoryRouter>,
  )

  // Scoped to the review list: Stepper renders all step labels (including
  // "Payment"/"Locations"/"Durations"/"Pricing") unconditionally, which would
  // otherwise collide with the identically-worded review row labels.
  const details = await waitFor(() => screen.getByTestId('review-details'))
  expect(within(details).getByText('Service')).toBeInTheDocument()
  expect(within(details).getByText('Payment')).toBeInTheDocument()
})

test('publishing shows a loading state then a success confirmation', async () => {
  render(
    <MemoryRouter initialEntries={['/step-7']}>
      <BookingProvider>
        <Step7 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => screen.getByRole('button', { name: 'Publish Service' }))
  await userEvent.click(screen.getByRole('button', { name: 'Publish Service' }))
  expect(screen.getByRole('button', { name: 'Publish Service' })).toBeDisabled()

  await waitFor(() => expect(screen.getByText(/service published/i)).toBeInTheDocument())
})

test('publishing failure shows the error banner and a retry succeeds', async () => {
  render(
    <MemoryRouter initialEntries={['/step-7']}>
      <BookingProvider initialData={{ serviceName: 'fail' }}>
        <Step7 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => screen.getByRole('button', { name: 'Publish Service' }))
  await userEvent.click(screen.getByRole('button', { name: 'Publish Service' }))

  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/publishing failed/i))

  await userEvent.click(screen.getByRole('button', { name: 'Publish Service' }))
  await waitFor(() => expect(screen.getByText(/service published/i)).toBeInTheDocument())
})
