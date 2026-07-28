import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Navbar } from './Navbar'

const items = [
  { label: 'Services', href: '/services' },
  { label: 'Calendar', href: '/calendar' },
]

test('renders nav items and highlights the active one', () => {
  render(
    <MemoryRouter>
      <Navbar activeItem="Services" items={items} />
    </MemoryRouter>,
  )
  expect(screen.getByRole('link', { name: 'Services' })).toHaveClass('bg-brand-surfaceMuted')
  expect(screen.getByRole('link', { name: 'Calendar' })).not.toHaveClass('bg-brand-surfaceMuted')
})
