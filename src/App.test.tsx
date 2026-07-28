import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

test('renders the app shell', () => {
  render(<App />)
  expect(screen.getByTestId('app-shell')).toBeInTheDocument()
})

test('walks the full booking flow from step 1 to a published confirmation', async () => {
  render(<App />)

  await waitFor(() => screen.getByRole('button', { name: 'Get started' }))
  await userEvent.click(screen.getByRole('button', { name: 'Get started' }))

  await waitFor(() => screen.getByLabelText('Service name'))
  await userEvent.type(screen.getByLabelText('Service name'), 'Personal Training')
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))

  await waitFor(() => screen.getByRole('button', { name: 'Next' }))
  await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 3 -> 4

  await waitFor(() => screen.getByLabelText('Location'))
  await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 4 -> 5

  await waitFor(() => screen.getByLabelText('Duration (minutes)'))
  await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 5 -> 6

  await waitFor(() => screen.getByLabelText('Base price'))
  await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 6 -> 7

  await waitFor(() => screen.getByRole('button', { name: 'Publish' }))
  await userEvent.click(screen.getByRole('button', { name: 'Publish' }))

  await waitFor(() => expect(screen.getByText(/service published/i)).toBeInTheDocument())
})
