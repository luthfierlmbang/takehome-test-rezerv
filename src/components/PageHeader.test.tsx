import { render, screen } from '@testing-library/react'
import { PageHeader } from './PageHeader'

test('renders title and description', () => {
  render(<PageHeader title="Basic details" description="Set the name and description." />)
  expect(screen.getByRole('heading', { name: 'Basic details' })).toBeInTheDocument()
  expect(screen.getByText('Set the name and description.')).toBeInTheDocument()
})
