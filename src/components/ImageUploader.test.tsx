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

test('the bar fills in step with the reported progress', async () => {
  render(<ImageUploader hasImage={false} onChange={vi.fn()} />)

  await userEvent.click(screen.getByRole('button', { name: 'browse files' }))

  const bar = await screen.findByRole('progressbar', { name: 'Uploading image' })
  const fill = bar.firstElementChild as HTMLElement

  // The regression this guards: the fill used to render at its full laid-out width
  // straight away, so only the percentage text moved.
  expect(bar).toHaveAttribute('aria-valuenow', '0')
  expect(fill.style.width).toBe('0%')

  await waitFor(() => expect(bar).toHaveAttribute('aria-valuenow', '12'))
  expect(fill.style.width).toBe('12%')

  await waitFor(() => expect(bar).toHaveAttribute('aria-valuenow', '58'), { timeout: 3000 })
  expect(fill.style.width).toBe('58%')
}, 10000)

test('changing the image keeps the old one on screen so the card never reflows', async () => {
  render(<ImageUploader hasImage onChange={vi.fn()} />)

  await userEvent.click(screen.getByRole('button', { name: /Change image/ }))

  // Uploading, but the picture is still mounted rather than swapped for the dashed box.
  expect(await screen.findByRole('progressbar', { name: 'Uploading image' })).toBeInTheDocument()
  expect(screen.getByAltText('Service')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'browse files' })).not.toBeInTheDocument()
}, 10000)

test('remove returns the uploader to its empty state', async () => {
  const onChange = vi.fn()
  render(<ImageUploader hasImage onChange={onChange} />)

  await userEvent.click(screen.getByRole('button', { name: /Remove/ }))

  expect(await screen.findByRole('button', { name: 'browse files' })).toBeInTheDocument()
  expect(onChange).toHaveBeenCalledWith(false)
})
