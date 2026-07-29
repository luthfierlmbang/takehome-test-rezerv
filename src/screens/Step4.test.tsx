import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { BookingProvider } from '../context/BookingContext'
import Step4 from './Step4'

function renderStep4() {
  return render(
    <MemoryRouter initialEntries={['/step-4']}>
      <BookingProvider>
        <Step4 />
      </BookingProvider>
    </MemoryRouter>,
  )
}

test('renders duration checkboxes and generates start-time chips from the slot settings', async () => {
  renderStep4()

  await waitFor(() => expect(screen.getByRole('checkbox', { name: '1 Hour' })).toBeInTheDocument())
  await userEvent.click(screen.getByRole('checkbox', { name: '1 Hour' }))
  expect(screen.getByRole('checkbox', { name: '1 Hour' })).toBeChecked()

  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every 15 Min')
  fireEvent.change(screen.getByLabelText('Bookable from'), { target: { value: '12:15' } })
  fireEvent.change(screen.getByLabelText('Until'), { target: { value: '13:00' } })

  expect(screen.getByText('12.15pm')).toBeInTheDocument()
})

test('the time fields wait for an interval, then take its step', async () => {
  renderStep4()

  await waitFor(() => expect(screen.getByLabelText('Bookable from')).toBeDisabled())

  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every 30 Min')

  const from = screen.getByLabelText('Bookable from')
  expect(from).toBeEnabled()
  // 30 minutes expressed in seconds, so the native picker steps on the same grid.
  expect(from).toHaveAttribute('step', '1800')
})

test('changing the interval re-snaps hours that no longer sit on the grid', async () => {
  renderStep4()

  await waitFor(() => screen.getByLabelText('Slot Interval'))
  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every 15 Min')
  fireEvent.change(screen.getByLabelText('Bookable from'), { target: { value: '12:15' } })
  expect(screen.getByLabelText('Bookable from')).toHaveValue('12:15')

  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every Hour')
  expect(screen.getByLabelText('Bookable from')).toHaveValue('12:00')
})

test('clears an end time that would fall at or before a newly picked start', async () => {
  renderStep4()

  await waitFor(() => screen.getByLabelText('Slot Interval'))
  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every Hour')
  fireEvent.change(screen.getByLabelText('Bookable from'), { target: { value: '10:00' } })
  fireEvent.change(screen.getByLabelText('Until'), { target: { value: '12:00' } })
  expect(screen.getByLabelText('Until')).toHaveValue('12:00')

  fireEvent.change(screen.getByLabelText('Bookable from'), { target: { value: '13:00' } })
  expect(screen.getByLabelText('Until')).toHaveValue('')
})
