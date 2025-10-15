import { useState, useMemo, useCallback } from 'react'

interface UseSearchOptions<T> {
  data: T[]
  searchFields: (keyof T)[] // campos onde buscar
  initialTerm?: string
}

interface UseSearchReturn<T> {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredData: T[]
  clearSearch: () => void
  hasActiveSearch: boolean
}

export const useSearch = <T>({
  data,
  searchFields,
  initialTerm = '',
}: UseSearchOptions<T>): UseSearchReturn<T> => {
  const [searchTerm, setSearchTerm] = useState(initialTerm)

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data
    }

    const lowercaseSearchTerm = searchTerm.toLowerCase()

    return data.filter((item) => {
      return searchFields.some((field) => {
        const fieldValue = item[field]
        if (fieldValue == null) return false

        return String(fieldValue).toLowerCase().includes(lowercaseSearchTerm)
      })
    })
  }, [data, searchTerm, searchFields])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
  }, [])

  const hasActiveSearch = searchTerm.trim().length > 0

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    clearSearch,
    hasActiveSearch,
  }
}

interface UseAdvancedSearchOptions<T> extends UseSearchOptions<T> {
  filters?: Record<string, any>
}

export const useAdvancedSearch = <T>({
  data,
  searchFields,
  initialTerm = '',
  filters = {},
}: UseAdvancedSearchOptions<T>) => {
  const [searchTerm, setSearchTerm] = useState(initialTerm)

  const filteredData = useMemo(() => {
    let result = data

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value != null) {
        result = result.filter((item) => {
          const itemValue = (item as any)[key]
          return itemValue === value
        })
      }
    })

    if (searchTerm.trim()) {
      const lowercaseSearchTerm = searchTerm.toLowerCase()
      result = result.filter((item) => {
        return searchFields.some((field) => {
          const fieldValue = item[field]
          if (fieldValue == null) return false

          return String(fieldValue).toLowerCase().includes(lowercaseSearchTerm)
        })
      })
    }

    return result
  }, [data, searchTerm, searchFields, filters])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
  }, [])

  const hasActiveSearch = searchTerm.trim().length > 0

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    clearSearch,
    hasActiveSearch,
  }
}
