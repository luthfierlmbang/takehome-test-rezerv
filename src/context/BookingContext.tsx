import { createContext, useContext, useState, type ReactNode } from 'react'

export type BookingData = {
  serviceName: string
  serviceDescription: string
  location: string
  coach: string
  duration: string
  price: string
  paymentMethod: string
}

const INITIAL_DATA: BookingData = {
  serviceName: '',
  serviceDescription: '',
  location: '',
  coach: '',
  duration: '',
  price: '',
  paymentMethod: '',
}

type BookingContextValue = {
  data: BookingData
  updateField: (key: keyof BookingData, value: string) => void
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

  function updateField(key: keyof BookingData, value: string) {
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
