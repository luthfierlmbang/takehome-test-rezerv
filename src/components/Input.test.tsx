import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

test('renders label and empty placeholder', () => {
  render(<Input label="Service name" value="" onChange={() => {}} placeholder="e.g. Personal Training" />)
  expect(screen.getByLabelText('Service name')).toHaveAttribute('placeholder', 'e.g. Personal Training')
})

test('calls onChange with the new value when filled', async () => {
  const onChange = vi.fn()
  render(<Input label="Service name" value="" onChange={onChange} />)
  await userEvent.type(screen.getByLabelText('Service name'), 'A')
  expect(onChange).toHaveBeenCalledWith('A')
})

test('shows error message and error border class when error is set', () => {
  render(<Input label="Service name" value="" onChange={() => {}} error="Required" />)
  expect(screen.getByText('Required')).toBeInTheDocument()
  expect(screen.getByLabelText('Service name')).toHaveClass('border-red-500')
})

test('disables the field when disabled', () => {
  render(<Input label="Service name" value="" onChange={() => {}} disabled />)
  expect(screen.getByLabelText('Service name')).toBeDisabled()
})
