import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { BookingProvider } from '../context/BookingContext'
import Step5 from './Step5'

test('renders duration checkboxes and generates start-time chips from the slot settings', async () => {
  render(
    <MemoryRouter initialEntries={['/step-5']}>
      <BookingProvider>
        <Step5 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => expect(screen.getByRole('checkbox', { name: '1 Hour' })).toBeInTheDocument())
  await userEvent.click(screen.getByRole('checkbox', { name: '1 Hour' }))
  expect(screen.getByRole('checkbox', { name: '1 Hour' })).toBeChecked()

  fireEvent.change(screen.getByLabelText('Bookable from'), { target: { value: '12:15' } })
  fireEvent.change(screen.getByLabelText('Until'), { target: { value: '13:00' } })
  await userEvent.selectOptions(screen.getByLabelText('Slot interval'), 'Every 15 Min')

  expect(screen.getByText('12.15pm')).toBeInTheDocument()
})
