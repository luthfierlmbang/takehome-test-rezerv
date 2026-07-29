import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

test('renders the app shell', () => {
  render(<App />)
  expect(screen.getByTestId('app-shell')).toBeInTheDocument()
})

// Each route change runs a page-transition exit/enter (AnimatePresence) on top of
// WizardLayout's own skeleton-loading delay. Every wait below targets text/labels/testids
// that only exist on the screen we're navigating *to*, so a click can never land on the
// wrong screen's control.
const TRANSITION_TIMEOUT = 3000

test(
  'walks the full booking flow from the empty state to a published confirmation',
  async () => {
    render(<App />)

    await waitFor(() => screen.getByRole('button', { name: 'Create Service' }), { timeout: TRANSITION_TIMEOUT })
    await userEvent.click(screen.getByRole('button', { name: 'Create Service' }))

    // Step 2 (Details, empty image state) is the only screen with this label.
    await waitFor(() => screen.getByLabelText('Service Name'), { timeout: TRANSITION_TIMEOUT })
    await userEvent.type(screen.getByLabelText('Service Name'), 'Personal Training')
    await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 2 -> 3

    // Step 3 reuses Step2's field labels, so key off its unique "Image" section instead.
    await waitFor(() => screen.getByText('Image'), { timeout: TRANSITION_TIMEOUT })
    await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 3 -> 4

    await waitFor(() => screen.getByText('Padel Arena KLCC'), { timeout: TRANSITION_TIMEOUT })
    await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 4 -> 5

    await waitFor(() => screen.getByRole('checkbox', { name: '1 Hour' }), { timeout: TRANSITION_TIMEOUT })
    await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 5 -> 6

    await waitFor(() => screen.getByLabelText('Base price'), { timeout: TRANSITION_TIMEOUT })
    await userEvent.click(screen.getByRole('button', { name: 'Next' })) // step 6 -> 7

    await waitFor(() => screen.getByTestId('review-details'), { timeout: TRANSITION_TIMEOUT })
    // Confirms context data survives the full Step1 -> Step7 chain (the review row).
    expect(screen.getByText('Personal Training')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Publish Service' }))

    await waitFor(() => expect(screen.getByText(/service published/i)).toBeInTheDocument(), {
      timeout: TRANSITION_TIMEOUT,
    })
    // Confirms the success panel also interpolates the persisted service name.
    expect(screen.getByText(/Personal Training/)).toBeInTheDocument()
  },
  15000,
)
