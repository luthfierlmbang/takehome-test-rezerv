import { render, screen } from '@testing-library/react'
import { Breadcrumb } from './Breadcrumb'

test('renders items separated by carets', () => {
  render(<Breadcrumb items={['Services', 'New service']} />)
  expect(screen.getByText('Services')).toBeInTheDocument()
  expect(screen.getByText('New service')).toBeInTheDocument()
  expect(screen.getByTestId('breadcrumb-caret')).toBeInTheDocument()
})
