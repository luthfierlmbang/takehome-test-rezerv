import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { BookingProvider, type BookingData } from '../context/BookingContext'
import Step7 from './Step7'

/** Renders Step7 alongside a stand-in for the Service screen it returns to on publish. */
function renderStep7(initialData?: Partial<BookingData>) {
  return render(
    <MemoryRouter initialEntries={['/step-7']}>
      <BookingProvider initialData={initialData}>
        <Routes>
          <Route path="/step-7" element={<Step7 />} />
          <Route path="/step-1" element={<div>Service list</div>} />
        </Routes>
      </BookingProvider>
    </MemoryRouter>,
  )
}

test('renders a read-only review of booking data', async () => {
  renderStep7()

  // Scoped to the review list: Stepper renders all step labels (including
  // "Pricing"/"Review") unconditionally, which would otherwise collide with the
  // identically-worded review row labels.
  const details = await waitFor(() => screen.getByTestId('review-details'))
  expect(within(details).getByText('Service')).toBeInTheDocument()
  expect(within(details).getByText('Payment')).toBeInTheDocument()
})

test('publishing disables the button then returns to the service screen', async () => {
  renderStep7()

  await waitFor(() => screen.getByRole('button', { name: 'Publish Service' }))
  await userEvent.click(screen.getByRole('button', { name: 'Publish Service' }))
  expect(screen.getByRole('button', { name: 'Publish Service' })).toBeDisabled()

  await waitFor(() => expect(screen.getByText('Service list')).toBeInTheDocument())
})

test('publishing failure shows the error banner and a retry succeeds', async () => {
  renderStep7({ serviceName: 'fail' })

  await waitFor(() => screen.getByRole('button', { name: 'Publish Service' }))
  await userEvent.click(screen.getByRole('button', { name: 'Publish Service' }))

  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/publishing failed/i))

  await userEvent.click(screen.getByRole('button', { name: 'Publish Service' }))
  await waitFor(() => expect(screen.getByText('Service list')).toBeInTheDocument())
})
