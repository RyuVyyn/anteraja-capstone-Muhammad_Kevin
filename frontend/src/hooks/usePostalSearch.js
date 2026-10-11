import { useEffect, useState } from 'react'

const POSTAL_API_URL = 'https://kodepos.vercel.app/search'

export function usePostalSearch(query) {
  const [postalResults, setPostalResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const normalizedQuery = (query || '').trim()

    if (!normalizedQuery || normalizedQuery.length < 2) {
      setPostalResults([])
      setIsLoading(false)
      setIsError(false)
      setErrorMessage('')
      return undefined
    }

    let isMounted = true
    const controller = new AbortController()

    const fetchPostalCodes = async () => {
      setIsLoading(true)
      setIsError(false)
      setErrorMessage('')

      try {
        const response = await fetch(`${POSTAL_API_URL}?q=${encodeURIComponent(normalizedQuery)}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Gagal mencari kode pos')
        }

        const payload = await response.json()
        const data = payload?.data ?? []

        if (isMounted) {
          setPostalResults(data)
        }
      } catch (error) {
        if (controller.signal.aborted) return
        if (isMounted) {
          setIsError(true)
          setErrorMessage(error.message || 'Kode pos tidak dapat ditemukan saat ini.')
          setPostalResults([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchPostalCodes()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [query])

  return {
    postalResults,
    isLoading,
    isError,
    errorMessage,
  }
}
