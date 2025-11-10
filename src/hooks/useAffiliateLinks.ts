import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AffiliateLinksData,
  AffiliateLinksFilters,
} from '@/services/types/affiliate-links.types'
import { AffiliateLinksService } from '@/services/affiliate-links'

const CACHE_CONFIG = {
  staleTime: 2 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
} as const

export const useAffiliateLinks = (
  initialFilters?: Partial<AffiliateLinksFilters>
) => {
  const affiliateLinksService = useMemo(() => new AffiliateLinksService(), [])

  const [filters, setFilters] = useState<AffiliateLinksFilters>({
    page: 1,
    perpage: 5,
    ...initialFilters,
  })

  const activeFilters = useMemo(
    () => ({
      page: initialFilters?.page ?? filters.page,
      perpage: initialFilters?.perpage ?? filters.perpage,
      user: initialFilters?.user ?? filters.user,
      product: initialFilters?.product ?? filters.product,
    }),
    [initialFilters, filters]
  )

  const {
    data: linksData,
    isLoading: isLoadingLinks,
    error: linksError,
    refetch: refetchLinks,
  } = useQuery({
    queryKey: ['affiliate-links', activeFilters],
    queryFn: async () => {
      try {
        return await affiliateLinksService.getAffiliateLinks(activeFilters)
      } catch (error: any) {
        console.error('❌ Erro ao buscar links do afiliado:', error)

        if (error.response) {
          console.error('Status:', error.response.status)
          console.error('Data:', error.response.data)
          console.error('Headers:', error.response.headers)
        }

        if (error?.response?.status === 500) {
          console.warn(
            '🔄 Erro 500 no servidor - retornando dados vazios para continuar funcionamento'
          )
          return {
            response: {
              success: true,
              data: {
                list: [],
                meta: {
                  current_page: 1,
                  last_page: 1,
                  total_items: 0,
                  pagesize: activeFilters.perpage || 5,
                },
              },
            },
            status: 200,
            controller: new AbortController(),
          }
        }

        throw error
      }
    },
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 500) {
        return false
      }

      return failureCount < 2
    },
    ...CACHE_CONFIG,
  })

  const processedData = useMemo(() => {
    if (
      !linksData?.response?.success ||
      !linksData.response.data ||
      typeof linksData.response.data !== 'object'
    ) {
      return null
    }

    const data: AffiliateLinksData = linksData.response.data

    return {
      links: data.list || [],

      meta: data.meta,
    }
  }, [linksData])

  const updateFilters = (newFilters: Partial<AffiliateLinksFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const setProduct = (product?: string) => {
    setFilters((prev) => ({ ...prev, product, page: 1 }))
  }

  return {
    data: processedData,

    isLoading: isLoadingLinks,
    hasError: !!linksError,
    error: linksError,

    filters,
    updateFilters,
    setPage,
    setProduct,

    refetch: refetchLinks,
  }
}
