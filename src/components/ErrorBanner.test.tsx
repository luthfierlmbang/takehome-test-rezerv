import { render, screen } from '@testing-library/react'
import { ErrorBanner } from './ErrorBanner'

test('renders the error message with role alert', () => {
  render(<ErrorBanner message="Something went wrong" />)
  expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
})
