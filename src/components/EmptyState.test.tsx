import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState } from './EmptyState'

test('renders label and fires the action when clicked', async () => {
  const onAction = vi.fn()
  render(<EmptyState label="No image yet" actionLabel="Upload" onAction={onAction} />)
  expect(screen.getByText('No image yet')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Upload' }))
  expect(onAction).toHaveBeenCalled()
})
