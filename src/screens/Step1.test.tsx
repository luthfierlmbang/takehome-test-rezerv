import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { BookingProvider, useBooking } from '../context/BookingContext'
import Step1 from './Step1'
import type { ReactNode } from 'react'

/** Publishes the seeded draft on mount so Step1 renders its filled state. */
function PublishOnMount({ children }: { children: ReactNode }) {
  const { publishedServices, publishService } = useBooking()
  if (publishedServices.length === 0) publishService()
  return <>{children}</>
}

test('renders the empty state and navigates to the wizard on Create Service', async () => {
  render(
    <MemoryRouter initialEntries={['/step-1']}>
      <BookingProvider>
        <Step1 />
      </BookingProvider>
    </MemoryRouter>,
  )

  expect(await screen.findByText(/create your first service/i)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /Create Service/ }))
})

test('renders the filled state listing published services once one exists', async () => {
  render(
    <MemoryRouter initialEntries={['/step-1']}>
      <BookingProvider initialData={{ serviceName: 'Private Padel Coaching', basePrice: '20' }}>
        <PublishOnMount>
          <Step1 />
        </PublishOnMount>
      </BookingProvider>
    </MemoryRouter>,
  )

  expect(await screen.findByText('Private Padel Coaching')).toBeInTheDocument()
  expect(screen.getByText('1 service')).toBeInTheDocument()
  expect(screen.getByText('Live')).toBeInTheDocument()
  expect(screen.getByText(/\$20 per session/)).toBeInTheDocument()
  // The empty-state prompt must not linger once a service exists.
  expect(screen.queryByText(/create your first service/i)).not.toBeInTheDocument()
})
