import { render, screen } from '@testing-library/react'
import { Skeleton } from './Skeleton'

test('renders a shimmering placeholder block', () => {
  render(<Skeleton />)
  expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse')
})
