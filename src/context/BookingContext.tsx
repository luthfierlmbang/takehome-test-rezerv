import { createContext, useContext, useState, type ReactNode } from 'react'

/** One time-based price rule. Later rules win where windows overlap. */
export type PriceRule = {
  id: string
  appliesOn: string
  from: string
  to: string
  price: string
}

export type BookingData = {
  serviceType: string
  serviceName: string
  bookingCategory: string
  serviceDescription: string
  hasImage: boolean
  offerAtLocation: boolean
  selectedCoaches: string[]
  selectedDurations: string[]
  availableDays: string[]
  /** When true, each available day carries its own hours in `dayHours`. */
  perDayHours: boolean
  dayHours: Record<string, { from: string; until: string }>
  bookableFrom: string
  bookableUntil: string
  slotInterval: string
  basePrice: string
  priceRules: PriceRule[]
  paymentDropIn: boolean
  paymentClassPack: boolean
}

/** Ids only need to be unique within a draft, and must not depend on Date/Math.random. */
let ruleSequence = 0
export function createPriceRule(): PriceRule {
  ruleSequence += 1
  return { id: `rule-${ruleSequence}`, appliesOn: 'Weekdays', from: '', to: '', price: '' }
}

const INITIAL_DATA: BookingData = {
  serviceType: '',
  serviceName: '',
  bookingCategory: '',
  serviceDescription: '',
  hasImage: false,
  offerAtLocation: true,
  selectedCoaches: [],
  selectedDurations: [],
  // Figma shows the schedule starting on the working week, with the weekend off.
  availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  // Off by default, so the screen at rest is the single shared row Figma shows.
  perDayHours: false,
  dayHours: {},
  bookableFrom: '',
  bookableUntil: '',
  slotInterval: '',
  // Pricing arrives pre-filled, matching the values the Figma Pricing screen shows.
  basePrice: '20',
  priceRules: [{ id: 'rule-0', appliesOn: 'Weekdays', from: '13:00', to: '14:00', price: '14.00' }],
  paymentDropIn: false,
  paymentClassPack: false,
}

type BookingContextValue = {
  data: BookingData
  updateField: <K extends keyof BookingData>(key: K, value: BookingData[K]) => void
  addPriceRule: () => void
  updatePriceRule: <K extends keyof PriceRule>(id: string, key: K, value: PriceRule[K]) => void
  removePriceRule: (id: string) => void
  currentStepIndex: number
  goToStep: (index: number) => void
  /** Services that have been published — drives the Service screen's filled state. */
  publishedServices: BookingData[]
  /** Commits the in-progress draft to the published list and clears the draft. */
  publishService: () => void
}

export const STEP_ROUTE = (n: number) => `/step-${n}`

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({
  children,
  initialData,
}: {
  children: ReactNode
  /** Overrides applied on top of the default empty booking data — primarily useful for tests. */
  initialData?: Partial<BookingData>
}) {
  const [data, setData] = useState<BookingData>({ ...INITIAL_DATA, ...initialData })
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [publishedServices, setPublishedServices] = useState<BookingData[]>([])

  function updateField<K extends keyof BookingData>(key: K, value: BookingData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function addPriceRule() {
    setData((prev) => ({ ...prev, priceRules: [...prev.priceRules, createPriceRule()] }))
  }

  function updatePriceRule<K extends keyof PriceRule>(id: string, key: K, value: PriceRule[K]) {
    setData((prev) => ({
      ...prev,
      priceRules: prev.priceRules.map((rule) => (rule.id === id ? { ...rule, [key]: value } : rule)),
    }))
  }

  function removePriceRule(id: string) {
    setData((prev) => ({ ...prev, priceRules: prev.priceRules.filter((rule) => rule.id !== id) }))
  }

  function goToStep(index: number) {
    setCurrentStepIndex(index)
  }

  function publishService() {
    setPublishedServices((prev) => [...prev, data])
    setData({ ...INITIAL_DATA, ...initialData })
  }

  return (
    <BookingContext.Provider
      value={{
        data,
        updateField,
        addPriceRule,
        updatePriceRule,
        removePriceRule,
        currentStepIndex,
        goToStep,
        publishedServices,
        publishService,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within a BookingProvider')
  return ctx
}
