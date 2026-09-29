import { useCallback, useState } from 'react'

/**
 * Hook untuk mengirim data form ke PHP backend (api/calculate.php)
 * dan menerima hasil kalkulasi ongkir + margin.
 *
 * Alur: React form -> POST /api/calculate.php -> JSON response
 * Public API (autocomplete) tetap berjalan terpisah di useLocationData.
 */

const API_URL = '/api/calculate.php'

export function useShippingCalculation() {
  const [shippingResult, setShippingResult] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calcError, setCalcError] = useState('')

  const calculateShipping = useCallback(async (payload) => {
    setIsCalculating(true)
    setCalcError('')
    setShippingResult(null)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Server error (${response.status})`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Kalkulasi gagal')
      }

      setShippingResult(data)
      return data
    } catch (error) {
      const message = error.message || 'Tidak dapat terhubung ke server.'
      setCalcError(message)
      return null
    } finally {
      setIsCalculating(false)
    }
  }, [])

  const clearResult = useCallback(() => {
    setShippingResult(null)
    setCalcError('')
  }, [])

  return {
    shippingResult,
    isCalculating,
    calcError,
    calculateShipping,
    clearResult,
  }
}
