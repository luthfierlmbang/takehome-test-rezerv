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
  await userEvent.selectOptions(screen.getByLabelText('Until'), '13:30')

  // The same times also appear as <option>s now, so scope to the generated chips.
  // With "1 Hour" ticked, only starts whose session finishes by 1.30pm are shown.
  const chips = screen.getByText(/a day shows these start times/).parentElement as HTMLElement
  expect(within(chips).getByText('12.15pm')).toBeInTheDocument()
  expect(within(chips).getByText('12.30pm')).toBeInTheDocument()
  expect(within(chips).queryByText('12.45pm')).not.toBeInTheDocument()
})

test('the preview names the interval, and truncated rows show their last start', async () => {
  renderStep4()

  await waitFor(() => screen.getByLabelText('Slot Interval'))
  await userEvent.click(screen.getByRole('checkbox', { name: '1 Hour' }))
  await userEvent.click(screen.getByRole('checkbox', { name: '4 Hours' }))
  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every 15 Min')
  await userEvent.selectOptions(screen.getByLabelText('Bookable from'), '12:00')
  await userEvent.selectOptions(screen.getByLabelText('Until'), '20:00')

  // Figma's sentence, with the interval in human words.
  expect(screen.getByText(/Customers can start every/)).toHaveTextContent(
    'Customers can start every 15 minutes.',
  )

  // Twelve visible chips are identical for every duration here — the difference lives
  // in the tail, so each truncated row names the last start it can actually offer.
  const preview = screen.getByText(/a day shows these start times/).parentElement as HTMLElement
  const rowOf = (label: string) => within(preview).getByText(label).parentElement as HTMLElement
  expect(within(rowOf('1 Hour')).getByText(/last start/)).toHaveTextContent('7.00pm')
  expect(within(rowOf('4 Hours')).getByText(/last start/)).toHaveTextContent('4.00pm')
})

test('start times are filtered per duration, and a session that cannot fit says so', async () => {
  renderStep4()

  await waitFor(() => screen.getByLabelText('Slot Interval'))
  await userEvent.click(screen.getByRole('checkbox', { name: '1 Hour' }))
  await userEvent.click(screen.getByRole('checkbox', { name: '4 Hours' }))
  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every Hour')
  await userEvent.selectOptions(screen.getByLabelText('Bookable from'), '12:00')
  await userEvent.selectOptions(screen.getByLabelText('Until'), '16:00')

  const preview = screen.getByText(/a day shows these start times/).parentElement as HTMLElement
  const rowOf = (label: string) =>
    within(preview).getByText(label).parentElement as HTMLElement

  // A 1-hour session can still start at 3pm; a 4-hour one only at noon —
  // 3pm + 4 hours would end at 7pm, three hours past closing.
  expect(within(rowOf('1 Hour')).getByText('3.00pm')).toBeInTheDocument()
  expect(within(rowOf('4 Hours')).getByText('12.00pm')).toBeInTheDocument()
  expect(within(rowOf('4 Hours')).queryByText('1.00pm')).not.toBeInTheDocument()

  // Shrink the day below the longest session and it says so instead of lying.
  await userEvent.selectOptions(screen.getByLabelText('Until'), '15:00')
  expect(within(rowOf('4 Hours')).getByText(/doesn't fit/)).toBeInTheDocument()
  expect(within(rowOf('1 Hour')).getByText('2.00pm')).toBeInTheDocument()
})

test('available days default to the working week and toggle', async () => {
  renderStep4()

  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Monday' })).toBeChecked())
  expect(screen.getByRole('checkbox', { name: 'Friday' })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: 'Saturday' })).not.toBeChecked()
  expect(screen.getByRole('checkbox', { name: 'Sunday' })).not.toBeChecked()

  await userEvent.click(screen.getByRole('checkbox', { name: 'Saturday' }))
  expect(screen.getByRole('checkbox', { name: 'Saturday' })).toBeChecked()

  await userEvent.click(screen.getByRole('checkbox', { name: 'Monday' }))
  expect(screen.getByRole('checkbox', { name: 'Monday' })).not.toBeChecked()
})

test('warns when every day has been switched off', async () => {
  renderStep4()

  await waitFor(() => screen.getByRole('checkbox', { name: 'Monday' }))
  expect(screen.queryByText(/Pick at least one day/)).not.toBeInTheDocument()

  for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
    await userEvent.click(screen.getByRole('checkbox', { name: day }))
  }

  expect(screen.getByText(/Pick at least one day/)).toBeInTheDocument()
})

test('per-day hours seed from the shared row, then split the start times', async () => {
  renderStep4()

  await waitFor(() => screen.getByLabelText('Slot Interval'))
  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every Hour')
  await userEvent.selectOptions(screen.getByLabelText('Bookable from'), '12:00')
  await userEvent.selectOptions(screen.getByLabelText('Until'), '15:00')

  await userEvent.click(screen.getByRole('checkbox', { name: /different hours for each day/i }))

  // The shared row is gone, replaced by a row per available day carrying its values.
  expect(screen.queryByLabelText('Bookable from')).not.toBeInTheDocument()
  expect(screen.getByLabelText('Monday bookable from')).toHaveValue('12:00')
  expect(screen.getByLabelText('Friday until')).toHaveValue('15:00')
  expect(screen.queryByLabelText('Saturday bookable from')).not.toBeInTheDocument()

  // While every day still agrees, the preview stays a single unlabelled row.
  const preview = () => screen.getByText(/a day shows these start times/).parentElement as HTMLElement
  expect(within(preview()).queryByText('Monday, Tuesday, Wednesday, Thursday')).not.toBeInTheDocument()

  await userEvent.selectOptions(screen.getByLabelText('Friday bookable from'), '13:00')

  // Friday now runs its own hours, so the preview names both schedules and drops 12pm
  // from Friday's row.
  expect(within(preview()).getByText('Monday, Tuesday, Wednesday, Thursday')).toBeInTheDocument()
  expect(within(preview()).getByText('Friday')).toBeInTheDocument()
  expect(within(preview()).getAllByText('12.00pm')).toHaveLength(1)
  expect(within(preview()).getAllByText('1.00pm')).toHaveLength(2)
})

test('a day can run its own interval, which re-snaps that day alone', async () => {
  renderStep4()

  await waitFor(() => screen.getByLabelText('Slot Interval'))
  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every Hour')
  await userEvent.selectOptions(screen.getByLabelText('Bookable from'), '12:00')
  await userEvent.selectOptions(screen.getByLabelText('Until'), '14:00')
  await userEvent.click(screen.getByRole('checkbox', { name: /different hours for each day/i }))

  // The shared interval moves into the rows with the hours rather than staying behind.
  expect(screen.queryByLabelText('Slot Interval')).not.toBeInTheDocument()
  expect(screen.getByLabelText('Friday slot interval')).toHaveValue('Every Hour')

  await userEvent.selectOptions(screen.getByLabelText('Friday slot interval'), 'Every 30 Min')
  await userEvent.selectOptions(screen.getByLabelText('Friday bookable from'), '12:30')

  // Friday alone moved onto the half-hour grid; Monday still refuses a 12:30 start.
  expect(screen.getByLabelText('Friday bookable from')).toHaveValue('12:30')
  expect(optionsOf(screen.getByLabelText('Monday bookable from'))).not.toContain('12.30pm')

  const preview = screen.getByText(/a day shows these start times/).parentElement as HTMLElement
  expect(within(preview).getByText(/Monday, Tuesday, Wednesday, Thursday/)).toHaveTextContent('Every Hour')
  expect(within(preview).getByText(/^Friday/)).toHaveTextContent('Every 30 Min')
})

test('turning per-day hours off returns to the shared row', async () => {
  renderStep4()

  await waitFor(() => screen.getByLabelText('Slot Interval'))
  await userEvent.selectOptions(screen.getByLabelText('Slot Interval'), 'Every Hour')
  await userEvent.selectOptions(screen.getByLabelText('Bookable from'), '12:00')

  const toggle = screen.getByRole('checkbox', { name: /different hours for each day/i })
  await userEvent.click(toggle)
  expect(screen.getByLabelText('Monday bookable from')).toBeInTheDocument()

  await userEvent.click(toggle)
  expect(screen.queryByLabelText('Monday bookable from')).not.toBeInTheDocument()
  expect(screen.getByLabelText('Bookable from')).toHaveValue('12:00')
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
