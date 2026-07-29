import '@testing-library/jest-dom'

// jsdom doesn't implement window.matchMedia. framer-motion's <MotionConfig reducedMotion="user">
// calls it to detect the OS prefers-reduced-motion setting, so without a stub it throws and
// AnimatePresence exit transitions never resolve (tests hang waiting for the old page to unmount).
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
