import { useState, useEffect, useCallback } from 'react'

interface UseMockDataReturn<T> {
  data: T[]
  loading: boolean
  error: string | null
  retry: () => void
}

export const useMockData = <T>(url: string): UseMockDataReturn<T> => {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const retry = () => {
    fetchData()
  }

  return { data, loading, error, retry }
}

export const useApiData = <T>(
  apiCall: () => Promise<T[]>,
  dependencies: any[] = [],
): UseMockDataReturn<T> => {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiCall()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na API'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const retry = () => {
    fetchData()
  }

  return { data, loading, error, retry }
}
