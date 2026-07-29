import { render, screen } from '@testing-library/react'
import { Stepper } from './Stepper'

const steps = ['Overview', 'Basic details', 'Locations', 'Durations', 'Pricing', 'Review']

test('marks steps before currentIndex as completed and the current one as current', () => {
  render(<Stepper steps={steps} currentIndex={2} />)
  expect(screen.getByTestId('step-0')).toHaveAttribute('data-state', 'completed')
  expect(screen.getByTestId('step-1')).toHaveAttribute('data-state', 'completed')
  expect(screen.getByTestId('step-2')).toHaveAttribute('data-state', 'current')
  expect(screen.getByTestId('step-3')).toHaveAttribute('data-state', 'upcoming')
})

test('exposes a labeled list and marks the current step with aria-current', () => {
  render(<Stepper steps={steps} currentIndex={2} />)
  expect(screen.getByRole('list', { name: 'Steps' })).toBeInTheDocument()
  expect(screen.getByTestId('step-2')).toHaveAttribute('aria-current', 'step')
  expect(screen.getByTestId('step-1')).not.toHaveAttribute('aria-current')
})
