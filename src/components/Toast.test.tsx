import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import { Toast } from './Toast'

test('shows the message then removes itself after its duration', async () => {
  render(<Toast message="Service published" duration={200} />)

  expect(screen.getByRole('status')).toHaveTextContent('Service published')
  await waitForElementToBeRemoved(() => screen.queryByRole('status'))
})
