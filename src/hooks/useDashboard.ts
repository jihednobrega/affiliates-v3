import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DashboardService } from '@/services/dashboard'
import { DateRange } from '@/types/dashboard.types'
import { formatCurrency } from '@/utils/currency'
import { dateRangeToApiParams } from '@/utils/dashboardUtils'
import { processMetrics } from '@/utils/metrics'
import { ProductType, RankingProduct } from '@/services/types/dashboard.types'

const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
} as const

export const useDashboard = (dateRange?: DateRange) => {
  const dashboardService = useMemo(() => new DashboardService(), [])

  const apiParams = useMemo(() => {
    return dateRange ? dateRangeToApiParams(dateRange) : null
  }, [dateRange])

  const {
    data: metricsData,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ['dashboard', 'metrics', apiParams],
    queryFn: () => dashboardService.getMainMetrics(apiParams!),
    enabled: !!apiParams,
    ...CACHE_CONFIG,
  })

  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['dashboard', 'orders-evolution'],
    queryFn: () => dashboardService.getOrdersEvolution(),
    ...CACHE_CONFIG,
  })

  const {
    data: monthlyMetricsData,
    isLoading: isLoadingMonthlyMetrics,
    error: monthlyMetricsError,
    refetch: refetchMonthlyMetrics,
  } = useQuery({
    queryKey: ['dashboard', 'monthly-metrics'],
    queryFn: () => dashboardService.getMonthlyMetrics(),
    ...CACHE_CONFIG,
  })

  const allTimeParams = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const allTimeRange: DateRange = {
      start_date: '2020-01-01',
      end_date: today,
    }
    return dateRangeToApiParams(allTimeRange)
  }, [])

  const {
    data: allTimeMetricsData,
    isLoading: isLoadingAllTimeMetrics,
    error: allTimeMetricsError,
    refetch: refetchAllTimeMetrics,
  } = useQuery({
    queryKey: ['dashboard', 'all-time-metrics', allTimeParams],
    queryFn: () => dashboardService.getMainMetrics(allTimeParams),
    ...CACHE_CONFIG,
  })

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['dashboard', 'products'],
    queryFn: () => dashboardService.getProducts(),
    ...CACHE_CONFIG,
  })

  const processedMetrics = useMemo(() => {
    if (!metricsData?.response?.data) {
      return []
    }

    return processMetrics(metricsData.response.data, formatCurrency)
  }, [metricsData])

  const processedProducts = useMemo(() => {
    if (!productsData?.response?.data?.list) {
      return []
    }

    const products: ProductType[] = productsData.response.data.list

    return products.map(
      (product): RankingProduct => ({
        id: product.id,
        name: product.name,
        image: product.image,
        price: Number(product.price),
        commission: Number(product.commission),
        url: product.url,
        short_url: product.short_url,

        sales: undefined,
        clicks: undefined,
        revenue:
          Math.floor(
            ((Number(product.price) * Number(product.commission)) / 100) * 100,
          ) / 100,
      }),
    )
  }, [productsData])

  const isLoadingAny = useMemo(
    () =>
      isLoadingMetrics ||
      isLoadingOrders ||
      isLoadingMonthlyMetrics ||
      isLoadingAllTimeMetrics ||
      isLoadingProducts,
    [
      isLoadingMetrics,
      isLoadingOrders,
      isLoadingMonthlyMetrics,
      isLoadingAllTimeMetrics,
      isLoadingProducts,
    ],
  )

  const refreshAll = () => {
    refetchMetrics()
    refetchOrders()
    refetchMonthlyMetrics()
    refetchAllTimeMetrics()
    refetchProducts()
  }

  return {
    processedMetrics,
    isLoadingMetrics,
    metricsError,
    hasMetricsData: !!metricsData?.response?.data,
    refetchMetrics,

    ordersEvolutionData: ordersData?.response?.data,
    isLoadingOrders,
    ordersError,
    hasOrdersData: !!ordersData?.response?.data,
    refetchOrders,

    allTimeMetricsData: allTimeMetricsData?.response?.data,
    isLoadingAllTimeMetrics,
    allTimeMetricsError,
    refetchAllTimeMetrics,

    monthlyMetricsData: monthlyMetricsData?.response?.data,
    isLoadingMonthlyMetrics,
    monthlyMetricsError,
    refetchMonthlyMetrics,
    hasMonthlyData: !!monthlyMetricsData?.response?.data,

    isLoadingAny,
    refreshAll,

    productsData: processedProducts,
    isLoadingProducts,
    productsError,
    hasProductsData: !!productsData?.response?.data?.list,
    refetchProducts,

    loadMetrics: refetchMetrics,
    loadOrdersEvolution: refetchOrders,
    loadAllTimeMetrics: refetchAllTimeMetrics,
    loadMonthlyMetrics: refetchMonthlyMetrics,
  }
}
