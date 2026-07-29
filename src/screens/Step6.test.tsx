import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { BookingProvider } from '../context/BookingContext'
import Step6 from './Step6'

test('renders base price and payment method checkboxes', async () => {
  render(
    <MemoryRouter initialEntries={['/step-6']}>
      <BookingProvider>
        <Step6 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => expect(screen.getByLabelText('Base price')).toBeInTheDocument())

  const dropIn = screen.getByRole('checkbox', { name: 'Drop In' })
  expect(dropIn).not.toBeChecked()
  await userEvent.click(dropIn)
  expect(dropIn).toBeChecked()
})
