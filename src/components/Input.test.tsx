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

test('marks the field aria-invalid and describes it by the error when error is set', () => {
  render(<Input label="Service name" value="" onChange={() => {}} error="Required" />)
  const input = screen.getByLabelText('Service name')
  expect(input).toHaveAttribute('aria-invalid', 'true')
  expect(input).toHaveAttribute('aria-describedby', screen.getByText('Required').id)
})

test('does not mark the field invalid when there is no error', () => {
  render(<Input label="Service name" value="" onChange={() => {}} />)
  const input = screen.getByLabelText('Service name')
  expect(input).toHaveAttribute('aria-invalid', 'false')
  expect(input).not.toHaveAttribute('aria-describedby')
})

test('disables the field when disabled', () => {
  render(<Input label="Service name" value="" onChange={() => {}} disabled />)
  expect(screen.getByLabelText('Service name')).toBeDisabled()
})
