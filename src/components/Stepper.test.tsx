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
