export function simulateAsyncLoad(delayMs = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs))
}
