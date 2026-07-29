import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageUploader } from './ImageUploader'

test('browse files runs a simulated upload with progress and lands on the filled state', async () => {
  const onChange = vi.fn()
  render(<ImageUploader hasImage={false} onChange={onChange} />)

  await userEvent.click(screen.getByRole('button', { name: 'browse files' }))

  // Progress surfaces immediately — no file picker involved.
  const bar = await screen.findByRole('progressbar', { name: 'Uploading image' })
  expect(bar).toBeInTheDocument()

  await waitFor(() => expect(screen.getByAltText('Service')).toBeInTheDocument(), { timeout: 5000 })
  expect(onChange).toHaveBeenCalledWith(true)
  expect(screen.getByRole('button', { name: /Remove/ })).toBeInTheDocument()
}, 10000)

test('remove returns the uploader to its empty state', async () => {
  const onChange = vi.fn()
  render(<ImageUploader hasImage onChange={onChange} />)

  await userEvent.click(screen.getByRole('button', { name: /Remove/ }))

  expect(await screen.findByRole('button', { name: 'browse files' })).toBeInTheDocument()
  expect(onChange).toHaveBeenCalledWith(false)
})
