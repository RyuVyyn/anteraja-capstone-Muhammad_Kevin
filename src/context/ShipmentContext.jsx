import { createContext, useContext, useMemo, useState } from 'react'

const ShipmentContext = createContext(null)

export function ShipmentProvider({ children }) {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [weight, setWeight] = useState('5')
  const [dimensions, setDimensions] = useState({ panjang: '30', lebar: '20', tinggi: '20' })
  const [price, setPrice] = useState('50.000')
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedService, setSelectedService] = useState('ekonomi')
  const [toast, setToast] = useState(null)
  const [submitMessage, setSubmitMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const value = useMemo(() => ({
    origin,
    setOrigin,
    destination,
    setDestination,
    weight,
    setWeight,
    dimensions,
    setDimensions,
    price,
    setPrice,
    activeFilter,
    setActiveFilter,
    selectedService,
    setSelectedService,
    toast,
    setToast,
    submitMessage,
    setSubmitMessage,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
  }), [origin, destination, weight, dimensions, price, activeFilter, selectedService, toast, submitMessage, errors, isSubmitting])

  return <ShipmentContext.Provider value={value}>{children}</ShipmentContext.Provider>
}

export function useShipmentContext() {
  const context = useContext(ShipmentContext)

  if (!context) {
    throw new Error('useShipmentContext must be used inside ShipmentProvider')
  }

  return context
}
