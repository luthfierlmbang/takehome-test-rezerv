import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { BookingProvider } from '../context/BookingContext'
import Step1 from './Step1'

test('renders the empty service state and navigates to the wizard on Create Service', async () => {
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
