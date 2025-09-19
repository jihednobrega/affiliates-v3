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
  timeout: 30000, // TEMPORÁRIO: 30 segundos para usuários com muitos produtos
} as const

export const useProducts = (initialFilters?: Partial<ProductsFilters>) => {
  const productsService = useMemo(() => new ProductsService(), [])

  const [filters, setFilters] = useState<ProductsFilters>({
    page: 1,
    perpage: 48,
    ...initialFilters,
  })

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsService.getProducts(filters),
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
    setFilters((prev) => ({ ...prev, search, page: 1 }))
  }

  const getProductById = async (productId: number) => {
    return await productsService.getProductById(productId)
  }

  const getProductsByIds = async (productIds: number[]) => {
    return await productsService.getProductsByIds(productIds)
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
    queryFn: () => productsService.getProductsByIds(productIds),
    enabled: productIds.length > 0,
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
