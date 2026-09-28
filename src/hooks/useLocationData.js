import { useEffect, useState } from 'react'

const LOCATION_API_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api'

export function useLocationData() {
  const [provinces, setProvinces] = useState([])
  const [cities, setCities] = useState([])
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchLocationData = async () => {
      setIsLoading(true)
      setIsError(false)
      setErrorMessage('')

      try {
        const provincesResponse = await fetch(`${LOCATION_API_URL}/provinces.json`, {
          signal: controller.signal,
        })

        if (!provincesResponse.ok) {
          throw new Error('Gagal mengambil data provinsi')
        }

        const provincePayload = await provincesResponse.json()

        if (!isMounted) return

        setProvinces(provincePayload)

        const cityResponses = await Promise.all(
          provincePayload.map(async (province) => {
            const response = await fetch(`${LOCATION_API_URL}/regencies/${province.id}.json`, {
              signal: controller.signal,
            })

            if (!response.ok) {
              return []
            }

            const payload = await response.json()
            return payload.map((city) => ({
              ...city,
              province: province.name,
            }))
          }),
        )

        if (isMounted) {
          setCities(cityResponses.flat())
        }
      } catch (error) {
        if (controller.signal.aborted) return
        if (isMounted) {
          setIsError(true)
          setErrorMessage(error.message || 'Data lokasi tidak tersedia saat ini.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchLocationData()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  return {
    provinces,
    cities,
    selectedProvinceId,
    setSelectedProvinceId,
    isLoading,
    isError,
    errorMessage,
  }
}
