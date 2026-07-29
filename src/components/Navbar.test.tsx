import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Navbar } from './Navbar'

const items = [
  { label: 'Overview', href: '/overview', icon: 'overview' as const },
  { label: 'Service', href: '/service', icon: 'service' as const },
]

test('renders nav items, the profile card, and highlights the active item', () => {
  render(
    <MemoryRouter>
      <Navbar activeItem="Service" items={items} />
    </MemoryRouter>,
  )
  expect(screen.getByRole('link', { name: /Service/ })).toHaveClass('bg-brand-surfaceMuted')
  expect(screen.getByRole('link', { name: /Overview/ })).not.toHaveClass('bg-brand-surfaceMuted')
  expect(screen.getByText('Andrew Chapman')).toBeInTheDocument()
})
