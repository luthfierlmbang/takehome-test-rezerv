import { render, screen, waitFor, within } from '@testing-library/react'
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

/** Option labels of a select, minus the empty placeholder. */
function optionsOf(select: HTMLElement) {
  return within(select)
    .getAllByRole('option')
    .map((o) => o.textContent)
    .filter((t) => t !== '--.--')
}

test('renders duration checkboxes and generates start-time chips from the slot settings', async () => {
  renderStep4()

  await waitFor(() => expect(screen.getByRole('checkbox', { name: '1 Hour' })).toBeInTheDocument())
  await userEvent.click(screen.getByRole('checkbox', { name: '1 Hour' }))
  expect(screen.getByRole('checkbox', { name: '1 Hour' })).toBeChecked()

  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every 15 Min')
  await userEvent.selectOptions(screen.getByLabelText('Bookable from'), '12:15')
  await userEvent.selectOptions(screen.getByLabelText('Until'), '13:00')

  // The same times also appear as <option>s now, so scope to the generated chips.
  const chips = screen.getByText(/a day shows these start times/).parentElement as HTMLElement
  expect(within(chips).getByText('12.15pm')).toBeInTheDocument()
  expect(within(chips).getByText('12.45pm')).toBeInTheDocument()
})

test('the time fields wait for an interval before they can be used', async () => {
  renderStep4()

  await waitFor(() => expect(screen.getByLabelText('Bookable from')).toBeDisabled())

  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every 30 Min')
  expect(screen.getByLabelText('Bookable from')).toBeEnabled()
})

test('only offers times that sit on the chosen interval', async () => {
  renderStep4()

  await waitFor(() => screen.getByLabelText('Slot Interval'))

  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every 30 Min')
  const halfHourly = optionsOf(screen.getByLabelText('Bookable from'))
  expect(halfHourly).toContain('12.30pm')
  // A 30-minute grid must never offer a quarter-past time.
  expect(halfHourly).not.toContain('12.15pm')
  expect(halfHourly).toHaveLength(48)

  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every Hour')
  const hourly = optionsOf(screen.getByLabelText('Bookable from'))
  expect(hourly).not.toContain('12.30pm')
  expect(hourly).toHaveLength(24)
})

test('changing the interval re-snaps hours that no longer sit on the grid', async () => {
  renderStep4()

  await waitFor(() => screen.getByLabelText('Slot Interval'))
  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every 15 Min')
  await userEvent.selectOptions(screen.getByLabelText('Bookable from'), '12:15')
  expect(screen.getByLabelText('Bookable from')).toHaveValue('12:15')

  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every Hour')
  expect(screen.getByLabelText('Bookable from')).toHaveValue('12:00')
})

test('Until only offers times after the chosen start', async () => {
  renderStep4()

  await waitFor(() => screen.getByLabelText('Slot Interval'))
  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every Hour')
  await userEvent.selectOptions(screen.getByLabelText('Bookable from'), '10:00')

  const until = optionsOf(screen.getByLabelText('Until'))
  expect(until).toContain('11.00am')
  expect(until).not.toContain('10.00am')
  expect(until).not.toContain('9.00am')
})

test('clears an end time that would fall at or before a newly picked start', async () => {
  renderStep4()

  await waitFor(() => screen.getByLabelText('Slot Interval'))
  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every Hour')
  await userEvent.selectOptions(screen.getByLabelText('Bookable from'), '10:00')
  await userEvent.selectOptions(screen.getByLabelText('Until'), '12:00')
  expect(screen.getByLabelText('Until')).toHaveValue('12:00')

  await userEvent.selectOptions(screen.getByLabelText('Bookable from'), '13:00')
  expect(screen.getByLabelText('Until')).toHaveValue('')
})
