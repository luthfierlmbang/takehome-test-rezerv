import { createContext, useContext, useState, type ReactNode } from 'react'

export type BookingData = {
  serviceType: string
  serviceName: string
  bookingCategory: string
  serviceDescription: string
  hasImage: boolean
  offerAtLocation: boolean
  selectedCoaches: string[]
  selectedDurations: string[]
  bookableFrom: string
  bookableUntil: string
  slotInterval: string
  basePrice: string
  ruleAppliesOn: string
  ruleFrom: string
  ruleTo: string
  rulePrice: string
  paymentDropIn: boolean
  paymentClassPack: boolean
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
  bookableFrom: '',
  bookableUntil: '',
  slotInterval: '',
  basePrice: '',
  ruleAppliesOn: '',
  ruleFrom: '',
  ruleTo: '',
  rulePrice: '',
  paymentDropIn: false,
  paymentClassPack: false,
}

type BookingContextValue = {
  data: BookingData
  updateField: <K extends keyof BookingData>(key: K, value: BookingData[K]) => void
  currentStepIndex: number
  goToStep: (index: number) => void
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

  function updateField<K extends keyof BookingData>(key: K, value: BookingData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function goToStep(index: number) {
    setCurrentStepIndex(index)
  }

  return (
    <BookingContext.Provider value={{ data, updateField, currentStepIndex, goToStep }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within a BookingProvider')
  return ctx
}
