import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionButtons } from './ActionButtons'

test('fires onBack and onNext, disables Back when backDisabled', async () => {
  const onBack = vi.fn()
  const onNext = vi.fn()
  render(<ActionButtons onBack={onBack} onNext={onNext} backDisabled />)
  expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
  expect(onNext).toHaveBeenCalled()
})

test('shows loading state on Next when nextState is loading', () => {
  render(<ActionButtons onNext={() => {}} nextState="loading" />)
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
})
