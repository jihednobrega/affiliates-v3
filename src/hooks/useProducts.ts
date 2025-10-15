import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ProductsService } from '@/services/products'
import {
  ProductsFilters,
  ProductsData,
  ProductItem,
} from '@/services/types/products.types'
import { formatCurrency } from '@/utils/currency'

const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutos - produtos mudam com menos frequência
  gcTime: 15 * 60 * 1000, // 15 minutos na memória
} as const

export const useProducts = (initialFilters?: Partial<ProductsFilters>) => {
  const productsService = useMemo(() => new ProductsService(), [])

  const [filters, setFilters] = useState<ProductsFilters>({
    page: 1,
    perpage: 100,
    ...initialFilters,
  })

  const activeFilters = useMemo(
    () => ({
      page: initialFilters?.page ?? filters.page,
      perpage: initialFilters?.perpage ?? filters.perpage,
      category: initialFilters?.category ?? filters.category,
      search: initialFilters?.search ?? filters.search,
      product: initialFilters?.product ?? filters.product,
      featured: initialFilters?.featured ?? filters.featured,
      orderBy: initialFilters?.orderBy ?? filters.orderBy,
    }),
    [initialFilters, filters]
  )

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['products', activeFilters],
    queryFn: async () => {
      try {
        return await productsService.getProducts(activeFilters)
      } catch (error: any) {
        console.error('❌ Erro ao buscar produtos:', error)

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
                  pagesize: activeFilters.perpage || 100,
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
      !productsData?.response?.success ||
      !productsData.response.data ||
      typeof productsData.response.data !== 'object'
    ) {
      return null
    }

    const data: ProductsData = productsData.response.data

    const processedProducts = (data.list || []).map((product) => ({
      ...product,
      priceFormatted: formatCurrency(product.price),
      commissionFormatted: `${product.commission}%`,
      commissionValue: (product.price * product.commission) / 100,
      commissionValueFormatted: formatCurrency(
        (product.price * product.commission) / 100
      ),
    }))

    return {
      products: processedProducts,

      meta: data.meta,
    }
  }, [productsData])

  const updateFilters = (newFilters: Partial<ProductsFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const setCategory = (category?: string) => {
    setFilters((prev) => ({ ...prev, category, page: 1 }))
  }

  const setSearch = (search?: string) => {
    setFilters((prev) => ({ ...prev, search, product: search, page: 1 }))
  }

  const getProductById = async (productId: number) => {
    try {
      const result = await productsService.getProductById(productId)
      return result
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      throw error
    }
  }

  const getProductsByIds = async (productIds: number[]) => {
    try {
      const results = await productsService.getProductsByIds(productIds)
      return results
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      throw error
    }
  }

  return {
    data: processedData,

    isLoading: isLoadingProducts,
    hasError: !!productsError,
    error: productsError,

    filters,
    updateFilters,
    setPage,
    setCategory,
    setSearch,

    refetch: refetchProducts,

    getProductById,
    getProductsByIds,
  }
}

export const useProductsByIds = (productIds: number[]) => {
  const productsService = useMemo(() => new ProductsService(), [])

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', 'by-ids', productIds.sort().join(',')],
    queryFn: async () => {
      try {
        return await productsService.getProductsByIds(productIds)
      } catch (error: any) {
        console.error('❌ Erro ao buscar produtos por IDs:', error)

        if (error?.response?.status === 500) {
          console.warn(
            '🔄 Erro 500 no servidor - retornando array vazio para produtos por IDs'
          )
          return []
        }

        throw error
      }
    },
    enabled: productIds.length > 0,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 500) {
        return false
      }
      return failureCount < 2
    },
    ...CACHE_CONFIG,
  })

  const productsMap = useMemo(() => {
    if (!data) return new Map()

    const map = new Map<number, ProductItem>()
    data.forEach((result) => {
      if (result.response?.success && result.response.data) {
        map.set(result.response.data.id, result.response.data)
      }
    })
    return map
  }, [data])

  return {
    productsMap,
    isLoading,
    error,
  }
}
