import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BookingProvider } from '../context/BookingContext'
import Step4 from './Step4'

test('renders locations and coaches fields', async () => {
  render(
    <MemoryRouter initialEntries={['/step-4']}>
      <BookingProvider>
        <Step4 />
      </BookingProvider>
    </MemoryRouter>,
  )

  await waitFor(() => expect(screen.getByLabelText('Location')).toBeInTheDocument())
  expect(screen.getByLabelText('Coach')).toBeInTheDocument()
})
