import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { BookingProvider } from '../context/BookingContext'
import Step4 from './Step4'

test('renders the location toggle and coach checkboxes, and lets a coach be selected', async () => {
  render(
    <MemoryRouter initialEntries={['/step-4']}>
      <BookingProvider>
        <Step4 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => expect(screen.getByRole('switch', { name: 'Offer at this location' })).toBeInTheDocument())
  expect(screen.getByText('Padel Arena KLCC')).toBeInTheDocument()

  const coachCheckbox = screen.getByRole('checkbox', { name: 'Janine Skuywalker' })
  expect(coachCheckbox).not.toBeChecked()
  await userEvent.click(coachCheckbox)
  expect(coachCheckbox).toBeChecked()
})
