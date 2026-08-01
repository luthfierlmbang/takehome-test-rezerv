import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { BookingProvider, type BookingData } from '../context/BookingContext'
import Step5 from './Step5'

function renderStep5(initialData?: Partial<BookingData>) {
  return render(
    <MemoryRouter initialEntries={['/step-5']}>
      <BookingProvider initialData={initialData}>
        <Step5 />
      </BookingProvider>
    </MemoryRouter>,
  )
}

test('renders base price and payment method checkboxes', async () => {
  renderStep5()

  await waitFor(() => expect(screen.getByLabelText(/Base price applies/)).toBeInTheDocument())

  const dropIn = screen.getByRole('checkbox', { name: 'Drop In' })
  expect(dropIn).not.toBeChecked()
  await userEvent.click(dropIn)
  expect(dropIn).toBeChecked()
})

test('the preview prices each slot, and the button hides it again', async () => {
  renderStep5({
    slotInterval: 'Every Hour',
    bookableFrom: '12:00',
    bookableUntil: '15:00',
    basePrice: '20',
    priceRules: [{ id: 'r1', appliesOn: 'Weekdays', from: '13:00', to: '14:00', price: '14.00' }],
  })

  // Figma shows the preview expanded, so it is on screen without being asked for.
  const panel = await waitFor(() => screen.getByText(/Price on Every Weekdays/).parentElement as HTMLElement)
  expect(screen.getByRole('button', { name: /Hide preview/ })).toHaveAttribute('aria-expanded', 'true')

  // 1pm falls inside the rule window, so it carries the rule price rather than the base.
  expect(within(panel).getByText(/1\.00pm price/)).toHaveTextContent('$14.00')
  // The two slots outside the window keep the base price.
  expect(within(panel).getAllByText('$20')).toHaveLength(2)

  await userEvent.click(screen.getByRole('button', { name: /Hide preview/ }))
  expect(screen.queryByText(/Price on Every Weekdays/)).not.toBeInTheDocument()
})

test('the preview explains what is missing when the schedule has no hours yet', async () => {
  renderStep5({ slotInterval: '', bookableFrom: '', bookableUntil: '' })

  expect(await waitFor(() => screen.getByText(/Set the bookable hours on the Schedule step/))).toBeInTheDocument()
})

test('the rule window waits for a schedule and then rides its interval', async () => {
  const { unmount } = renderStep5({ slotInterval: '', bookableFrom: '', bookableUntil: '' })

  await waitFor(() => expect(screen.getByLabelText('Time book from')).toBeDisabled())
  expect(screen.getByText(/Set the slot interval and bookable hours/)).toBeInTheDocument()
  unmount()

  renderStep5({ slotInterval: 'Every Hour', bookableFrom: '09:00', bookableUntil: '17:00' })

  const from = await waitFor(() => screen.getByLabelText('Time book from'))
  expect(from).toBeEnabled()

  const options = within(from)
    .getAllByRole('option')
    .map((o) => o.textContent)
    .filter((t) => t !== '--.--')

  // Hourly grid, and never outside the bookable day.
  expect(options).not.toContain('9.30am')
  expect(options).not.toContain('8.00am')
  expect(options).not.toContain('6.00pm')
  expect(options).toContain('9.00am')
  expect(options).toContain('5.00pm')
})

test('pulls a rule window back onto the grid when the schedule narrows it', async () => {
  // 13:15 sits off an hourly grid, and 09:00-12:00 puts it outside the day entirely.
  renderStep5({
    slotInterval: 'Every Hour',
    bookableFrom: '09:00',
    bookableUntil: '12:00',
    priceRules: [{ id: 'r1', appliesOn: 'Weekdays', from: '13:15', to: '14:00', price: '14.00' }],
  })

  await waitFor(() => expect(screen.getByLabelText('Time book from')).toHaveValue('12:00'))
  // The window collapsed, so the end is cleared rather than left inverted.
  expect(screen.getByLabelText('To')).toHaveValue('')
})

test('price fields keep only digits and a single decimal point', async () => {
  renderStep5({ basePrice: '' })

  const base = await waitFor(() => screen.getByLabelText(/Base price applies/))
  await userEvent.type(base, '2a5.x9')
  expect(base).toHaveValue('25.9')
})

const SCHEDULE = { slotInterval: 'Every Hour', bookableFrom: '09:00', bookableUntil: '17:00' }

test('Add price rule appends a rule, and Remove takes it away', async () => {
  renderStep5({ ...SCHEDULE, priceRules: [] })

  await waitFor(() => expect(screen.getByText(/No price rules yet/)).toBeInTheDocument())

  await userEvent.click(screen.getByRole('button', { name: /Add price rule/ }))
  expect(screen.getByText('Rules 1')).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: /Add price rule/ }))
  expect(screen.getByText('Rules 2')).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Remove rule 1' }))
  // The survivor renumbers rather than leaving a gap.
  expect(screen.getByText('Rules 1')).toBeInTheDocument()
  expect(screen.queryByText('Rules 2')).not.toBeInTheDocument()
})

test('a second same-day rule cannot claim hours the first already owns', async () => {
  renderStep5({
    ...SCHEDULE,
    priceRules: [
      { id: 'r1', appliesOn: 'Weekdays', from: '13:00', to: '15:00', price: '30' },
      { id: 'r2', appliesOn: 'Weekdays', from: '', to: '', price: '' },
    ],
  })

  await waitFor(() => screen.getByText('Rules 2'))

  const options = within(screen.getAllByLabelText('Time book from')[1])
    .getAllByRole('option')
    .map((o) => o.textContent)

  // 13:00-15:00 belongs to rule 1, so those starts are gone from rule 2.
  expect(options).not.toContain('1.00pm')
  expect(options).not.toContain('2.00pm')
  expect(options).toContain('12.00pm')
  expect(options).toContain('3.00pm')
})

test('a rule can end exactly where the next one starts', async () => {
  renderStep5({
    ...SCHEDULE,
    priceRules: [
      { id: 'r1', appliesOn: 'Monday', from: '13:00', to: '15:00', price: '30' },
      { id: 'r2', appliesOn: 'Monday', from: '12:00', to: '', price: '' },
    ],
  })

  await waitFor(() => screen.getByText('Rules 2'))

  const options = within(screen.getAllByLabelText('To')[1])
    .getAllByRole('option')
    .map((o) => o.textContent)
    .filter((t) => t !== '--.--')

  // 12pm-1pm butts up against rule 1 without overlapping it, so it has to be offerable —
  // otherwise the rule is stranded with no valid end at all.
  expect(options).toEqual(['1.00pm'])
})

test('a rule on one day is free to use hours a rule on another day owns', async () => {
  renderStep5({
    ...SCHEDULE,
    priceRules: [
      { id: 'r1', appliesOn: 'Monday', from: '13:00', to: '15:00', price: '30' },
      { id: 'r2', appliesOn: 'Tuesday', from: '', to: '', price: '' },
    ],
  })

  await waitFor(() => screen.getByText('Rules 2'))

  const options = within(screen.getAllByLabelText('Time book from')[1])
    .getAllByRole('option')
    .map((o) => o.textContent)

  // Different days never collide, so nothing is withheld.
  expect(options).toContain('1.00pm')
  expect(options).toContain('2.00pm')
})

test('the day choices mirror the Schedule step, and a rule follows its own day', async () => {
  renderStep5({
    ...SCHEDULE,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    perDayHours: true,
    daySchedules: { Saturday: { from: '09:00', until: '12:00', interval: 'Every 30 Min' } },
    priceRules: [{ id: 'r1', appliesOn: 'Saturday', from: '', to: '', price: '' }],
  })

  await waitFor(() => screen.getByText('Rules 1'))

  // The dropdown offers exactly what the schedule offers: every day, or one of its days.
  const scopeOptions = within(screen.getByLabelText('Applies on'))
    .getAllByRole('option')
    .map((o) => o.textContent)
  expect(scopeOptions).toEqual([
    'Every day', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
  ])
  expect(scopeOptions).not.toContain('Sunday')

  // A Saturday rule lives inside Saturday's own schedule: its 9-12 hours, its 30-minute
  // grid — not the weekday 9-17 row.
  const from = within(screen.getByLabelText('Time book from'))
    .getAllByRole('option')
    .map((o) => o.textContent)
    .filter((t) => t !== '--.--')
  expect(from).toContain('9.30am')
  expect(from).not.toContain('1.00pm')
  expect(from[0]).toBe('9.00am')
  expect(from[from.length - 1]).toBe('12.00pm')
})

test('a rule for a day the schedule dropped explains itself instead of pricing nothing', async () => {
  renderStep5({
    ...SCHEDULE,
    priceRules: [{ id: 'r1', appliesOn: 'Sunday', from: '', to: '', price: '' }],
  })

  await waitFor(() => screen.getByText('Rules 1'))

  expect(screen.getByLabelText('Time book from')).toBeDisabled()
  expect(screen.getByText(/Sunday isn't picked on the Schedule step/)).toBeInTheDocument()
})
