import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BookingProvider } from '../context/BookingContext'
import Step5 from './Step5'

test('renders duration field', async () => {
  render(
    <MemoryRouter initialEntries={['/step-5']}>
      <BookingProvider>
        <Step5 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => expect(screen.getByLabelText('Duration (minutes)')).toBeInTheDocument())
})
