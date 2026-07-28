export function simulateAsyncLoad(delayMs = 400, shouldFail = false): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('simulateAsyncLoad: simulated failure'))
      } else {
        resolve()
      }
    }, delayMs)
  })
}
