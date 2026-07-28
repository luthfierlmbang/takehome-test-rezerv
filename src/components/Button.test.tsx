import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

test('renders primary variant with brand background class', () => {
  render(<Button variant="primary">Save</Button>)
  expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('bg-brand-primary')
})

test('renders secondary variant with border class', () => {
  render(<Button variant="secondary">Cancel</Button>)
  expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('border-brand-border')
})

test('disables the button and blocks clicks when disabled', async () => {
  const onClick = vi.fn()
  render(<Button variant="primary" disabled onClick={onClick}>Save</Button>)
  const button = screen.getByRole('button', { name: 'Save' })
  expect(button).toBeDisabled()
  await userEvent.click(button)
  expect(onClick).not.toHaveBeenCalled()
})

test('shows a spinner and disables interaction in loading state', () => {
  render(<Button variant="primary" state="loading">Save</Button>)
  const button = screen.getByRole('button', { name: 'Save' })
  expect(button).toBeDisabled()
  expect(screen.getByTestId('button-spinner')).toBeInTheDocument()
})
