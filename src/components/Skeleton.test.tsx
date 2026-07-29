import { render, screen } from '@testing-library/react'
import { Skeleton, FormSkeleton, SectionSkeleton } from './Skeleton'

test('renders a placeholder block with a shimmer sweep', () => {
  const { container } = render(<Skeleton />)
  expect(screen.getByTestId('skeleton')).toHaveClass('bg-brand-surfaceMuted')
  expect(container.querySelector('.animate-\\[shimmer_1\\.4s_infinite\\]')).toBeInTheDocument()
})

test('form and section skeletons mirror their screens with multiple blocks', () => {
  const { unmount } = render(<FormSkeleton />)
  expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(5)
  unmount()

  render(<SectionSkeleton />)
  expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(3)
})
