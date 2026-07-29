import { render, screen, waitFor } from '@testing-library/react'
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
    ruleFrom: '13:00',
    ruleTo: '14:00',
    rulePrice: '14.00',
  })

  const preview = await waitFor(() => screen.getByRole('button', { name: /Preview/ }))
  expect(preview).toHaveAttribute('aria-expanded', 'false')

  await userEvent.click(preview)

  const panel = screen.getByText(/What a customer sees on/).closest('div') as HTMLElement
  // The summary text is split across spans, so assert on the panel's flattened text.
  expect(panel.textContent).toMatch(/1 of 3 slots use the rule price/)

  // 1pm falls inside the rule window, so it carries the rule price rather than the base.
  expect(screen.getByText('1pm')).toBeInTheDocument()
  expect(screen.getByText('$14.00')).toBeInTheDocument()
  // The two slots outside the window keep the base price.
  expect(screen.getAllByText('$20')).toHaveLength(2)

  await userEvent.click(screen.getByRole('button', { name: /Hide preview/ }))
  expect(screen.queryByText(/What a customer sees on/)).not.toBeInTheDocument()
})

test('Preview explains what is missing when the schedule has no hours yet', async () => {
  renderStep5({ slotInterval: '', bookableFrom: '', bookableUntil: '' })

  await userEvent.click(await waitFor(() => screen.getByRole('button', { name: /Preview/ })))

  expect(screen.getByText(/Set the bookable hours on the Schedule step/)).toBeInTheDocument()
})
