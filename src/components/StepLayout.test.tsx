import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StepLayout } from './StepLayout'

test('shows a skeleton then reveals content and header', async () => {
  render(
    <MemoryRouter>
      <StepLayout stepIndex={1} title="Basic details" description="Set the name" onNext={() => {}}>
        <div>step body</div>
      </StepLayout>
    </MemoryRouter>,
  )

  expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
  expect(screen.getByRole('main')).toBeInTheDocument()
  expect(screen.getByTestId('step-content-region')).toHaveAttribute('aria-busy', 'true')
  await waitFor(() => expect(screen.getByText('step body')).toBeInTheDocument())
  expect(screen.getByRole('heading', { name: 'Basic details' })).toBeInTheDocument()
  expect(screen.getByTestId('step-content-region')).toHaveAttribute('aria-busy', 'false')
})
