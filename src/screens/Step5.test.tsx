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

test('Preview reveals the per-slot prices a customer would see, and hides again', async () => {
  renderStep5({
    slotInterval: 'Every Hour',
    bookableFrom: '12:00',
    bookableUntil: '15:00',
    basePrice: '20',
    priceRules: [{ id: 'r1', appliesOn: 'Weekdays', from: '13:00', to: '14:00', price: '14.00' }],
  })

  const preview = await waitFor(() => screen.getByRole('button', { name: /Preview/ }))
  expect(preview).toHaveAttribute('aria-expanded', 'false')

  await userEvent.click(preview)

  const panel = screen.getByText(/What a customer sees on/).closest('div') as HTMLElement
  // The summary text is split across spans, so assert on the panel's flattened text.
  expect(panel.textContent).toMatch(/1 of 3 slots use this rule/)

  // Scoped to the panel: these times also exist as <option>s in the rule's time selects.
  // 1pm falls inside the rule window, so it carries the rule price rather than the base.
  expect(within(panel).getByText('1pm')).toBeInTheDocument()
  expect(within(panel).getByText('$14.00')).toBeInTheDocument()
  // The two slots outside the window keep the base price.
  expect(within(panel).getAllByText('$20')).toHaveLength(2)

  await userEvent.click(screen.getByRole('button', { name: /Hide preview/ }))
  expect(screen.queryByText(/What a customer sees on/)).not.toBeInTheDocument()
})

test('Preview explains what is missing when the schedule has no hours yet', async () => {
  renderStep5({ slotInterval: '', bookableFrom: '', bookableUntil: '' })

  await userEvent.click(await waitFor(() => screen.getByRole('button', { name: /Preview/ })))

  expect(screen.getByText(/Set the bookable hours on the Schedule step/)).toBeInTheDocument()
})

test('the rule window waits for a schedule and then rides its interval', async () => {
  const { unmount } = renderStep5({ slotInterval: '', bookableFrom: '', bookableUntil: '' })

  await waitFor(() => expect(screen.getByLabelText('Bookable from')).toBeDisabled())
  expect(screen.getByText(/Set the slot interval and bookable hours/)).toBeInTheDocument()
  unmount()

  renderStep5({ slotInterval: 'Every Hour', bookableFrom: '09:00', bookableUntil: '17:00' })

  const from = await waitFor(() => screen.getByLabelText('Bookable from'))
  expect(from).toBeEnabled()

  const options = within(from)
    .getAllByRole('option')
    .map((o) => o.textContent)
    .filter((t) => t !== '--.--')

  // Hourly grid, and never outside the bookable day.
  expect(options).not.toContain('9.30am')
  expect(options).not.toContain('8am')
  expect(options).not.toContain('6pm')
  expect(options).toContain('9am')
  expect(options).toContain('5pm')
})

test('pulls a rule window back onto the grid when the schedule narrows it', async () => {
  // 13:15 sits off an hourly grid, and 09:00-12:00 puts it outside the day entirely.
  renderStep5({
    slotInterval: 'Every Hour',
    bookableFrom: '09:00',
    bookableUntil: '12:00',
    priceRules: [{ id: 'r1', appliesOn: 'Weekdays', from: '13:15', to: '14:00', price: '14.00' }],
  })

  await waitFor(() => expect(screen.getByLabelText('Bookable from')).toHaveValue('12:00'))
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

  const options = within(screen.getAllByLabelText('Bookable from')[1])
    .getAllByRole('option')
    .map((o) => o.textContent)

  // 13:00-15:00 belongs to rule 1, so those starts are gone from rule 2.
  expect(options).not.toContain('1pm')
  expect(options).not.toContain('2pm')
  expect(options).toContain('12pm')
  expect(options).toContain('3pm')
})

test('a weekend rule is free to use hours a weekday rule owns', async () => {
  renderStep5({
    ...SCHEDULE,
    priceRules: [
      { id: 'r1', appliesOn: 'Weekdays', from: '13:00', to: '15:00', price: '30' },
      { id: 'r2', appliesOn: 'Weekends', from: '', to: '', price: '' },
    ],
  })

  await waitFor(() => screen.getByText('Rules 2'))

  const options = within(screen.getAllByLabelText('Bookable from')[1])
    .getAllByRole('option')
    .map((o) => o.textContent)

  // Different days never collide, so nothing is withheld.
  expect(options).toContain('1pm')
  expect(options).toContain('2pm')
})
