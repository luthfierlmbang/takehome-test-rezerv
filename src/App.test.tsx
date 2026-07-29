import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

test('renders the app shell', () => {
  render(<App />)
  expect(screen.getByTestId('app-shell')).toBeInTheDocument()
})

// Each route change now runs a page-transition exit/enter (AnimatePresence) on top of
// StepLayout's own skeleton-loading delay. `screen.getByRole('button', { name: 'Next' })`
// is ambiguous during that handoff: the outgoing screen's footer Next button (with
// mode="wait", the incoming screen doesn't mount until the outgoing one has fully exited,
// but the assertion still must not depend on that timing) can resolve the query before the
// intended screen is actually showing. Every wait below instead targets text/labels/testids
// that only exist on the screen we're navigating *to*, so a click can never land on the
// wrong screen's control. With scoped-enough queries, no artificial settle delay is needed;
// waitFor's polling itself is the only synchronization required.
const TRANSITION_TIMEOUT = 3000

test(
  'walks the full booking flow from step 1 to a published confirmation',
  async () => {
    render(<App />)

    await waitFor(() => screen.getByRole('button', { name: 'Get started' }), { timeout: TRANSITION_TIMEOUT })
    await userEvent.click(screen.getByRole('button', { name: 'Get started' }))

    // Step 2 ("Basic details" / service name form) is the only screen with this label.
    await waitFor(() => screen.getByLabelText('Service name'), { timeout: TRANSITION_TIMEOUT })
    await userEvent.type(screen.getByLabelText('Service name'), 'Personal Training')
    await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 2 -> 3

    // Step 3 reuses Step2's field labels, so key off its unique description text instead.
    await waitFor(() => screen.getByText('Confirm the details customers will see.'), { timeout: TRANSITION_TIMEOUT })
    await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 3 -> 4

    await waitFor(() => screen.getByLabelText('Location'), { timeout: TRANSITION_TIMEOUT })
    await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 4 -> 5

    await waitFor(() => screen.getByLabelText('Duration (minutes)'), { timeout: TRANSITION_TIMEOUT })
    await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 5 -> 6

    await waitFor(() => screen.getByLabelText('Base price'), { timeout: TRANSITION_TIMEOUT })
    await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 6 -> 7

    await waitFor(() => screen.getByTestId('review-details'), { timeout: TRANSITION_TIMEOUT })
    // Confirms context data survives the full Step1 -> Step7 chain (the review row).
    expect(screen.getByText('Personal Training')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => expect(screen.getByText(/service published/i)).toBeInTheDocument(), {
      timeout: TRANSITION_TIMEOUT,
    })
    // Confirms the success panel also interpolates the persisted service name.
    expect(screen.getByText(/Personal Training/)).toBeInTheDocument()
  },
  15000,
)
