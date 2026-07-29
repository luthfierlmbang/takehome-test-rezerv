import { render, screen } from '@testing-library/react'
import { Card } from './Card'

test('renders children inside a bordered rounded container', () => {
  render(<Card>content</Card>)
  const card = screen.getByText('content').parentElement
  expect(card).toHaveClass('border-brand-border', 'rounded-2xl')
})
