import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

test('renders the app shell', () => {
  render(<App />)
  expect(screen.getByTestId('app-shell')).toBeInTheDocument()
})

// Each route change now runs a page-transition exit/enter (AnimatePresence) on top of
// StepLayout's own skeleton-loading delay, so allow more time than the default 1s and let
// the transition settle before the next interaction (avoids racing the outgoing/incoming
// AnimatePresence children, which briefly overlap during the handoff).
const TRANSITION_TIMEOUT = 3000

async function waitAndSettle<T>(query: () => T): Promise<T> {
  const result = await waitFor(query, { timeout: TRANSITION_TIMEOUT })
  await new Promise((resolve) => setTimeout(resolve, 300))
  return result
}

test(
  'walks the full booking flow from step 1 to a published confirmation',
  async () => {
    render(<App />)

    await waitAndSettle(() => screen.getByRole('button', { name: 'Get started' }))
    await userEvent.click(screen.getByRole('button', { name: 'Get started' }))

    await waitAndSettle(() => screen.getByLabelText('Service name'))
    await userEvent.type(screen.getByLabelText('Service name'), 'Personal Training')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await waitAndSettle(() => screen.getByRole('button', { name: 'Next' }))
    await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 3 -> 4

    await waitAndSettle(() => screen.getByLabelText('Location'))
    await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 4 -> 5

    await waitAndSettle(() => screen.getByLabelText('Duration (minutes)'))
    await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 5 -> 6

    await waitAndSettle(() => screen.getByLabelText('Base price'))
    await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 6 -> 7

    await waitAndSettle(() => screen.getByTestId('review-details'))
    // Confirms context data survives the full Step1 -> Step7 chain (the review row).
    expect(screen.getByText('Personal Training')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }))

    await waitAndSettle(() => expect(screen.getByText(/service published/i)).toBeInTheDocument())
    // Confirms the success panel also interpolates the persisted service name.
    expect(screen.getByText(/Personal Training/)).toBeInTheDocument()
  },
  15000,
)
