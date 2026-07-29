import { render, screen } from '@testing-library/react'
import { Breadcrumb } from './Breadcrumb'

test('renders items separated by carets', () => {
  render(<Breadcrumb items={['Services', 'New service']} />)
  expect(screen.getByText('Services')).toBeInTheDocument()
  expect(screen.getByText('New service')).toBeInTheDocument()
  expect(screen.getByTestId('breadcrumb-caret')).toBeInTheDocument()
})

test('exposes a labeled nav landmark and marks the last item as the current page', () => {
  render(<Breadcrumb items={['Services', 'New service']} />)
  expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
  expect(screen.getByText('New service')).toHaveAttribute('aria-current', 'page')
  expect(screen.getByText('Services')).not.toHaveAttribute('aria-current')
})
