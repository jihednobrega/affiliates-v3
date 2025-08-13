import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DashboardService } from '@/services/dashboard'
import { DateRange } from '@/types/dashboard.types'
import { formatCurrency } from '@/utils/currency'
import { dateRangeToApiParams } from '@/utils/dashboardUtils'
import { processMetrics } from '@/utils/metrics'
import { RankingProduct } from '@/services/types/dashboard.types'
import { useFinances } from '@/hooks/useFinances'

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
    data: financesData,
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
  } = useFinances({
    page: 1,
    perPage: 100,
  })

  const processedMetrics = useMemo(() => {
    if (!metricsData?.response?.data) {
      return []
    }

    return processMetrics(metricsData.response.data, formatCurrency)
  }, [metricsData])

  const processedProducts = useMemo(() => {
    if (!financesData?.commissions) {
      return []
    }

    const productSalesMap = new Map<
      string,
      {
        id: number
        name: string
        image: string
        price: number
        commission_percentage: number
        commission_value: number
        count: number
        totalCommissions: number
        totalRevenue: number
        commissions: typeof financesData.commissions
        uniqueCustomers: Set<string>
        firstCommission: (typeof financesData.commissions)[0]
      }
    >()

    financesData.commissions.forEach((commission) => {
      const productKey = commission.name.toLowerCase().trim()

      if (!productSalesMap.has(productKey)) {
        productSalesMap.set(productKey, {
          id: commission.id,
          name: commission.name,
          image: commission.image,
          price: parseFloat(commission.product_price) || 0,
          commission_percentage:
            parseFloat(commission.commission_percentage) || 0,
          commission_value: parseFloat(commission.commission) || 0,
          count: 0,
          totalCommissions: 0,
          totalRevenue: 0,
          commissions: [],
          uniqueCustomers: new Set(),
          firstCommission: commission,
        })
      }

      const productData = productSalesMap.get(productKey)!

      productData.count++
      productData.totalCommissions += parseFloat(commission.commission) || 0
      productData.totalRevenue += parseFloat(commission.product_price) || 0
      productData.commissions.push(commission)
      productData.uniqueCustomers.add(commission.customer || 'unknown')
    })

    const productsArray = Array.from(productSalesMap.values()).map(
      (productData): RankingProduct => ({
        id: productData.id,
        name: productData.name,
        image: productData.image,
        price: productData.price,
        commission: productData.commission_percentage,
        url: undefined,
        short_url: undefined,
        clicks: undefined,
        sales: productData.count,
        revenue: productData.totalRevenue,
        totalCommissions: productData.totalCommissions,
        commissionValue: productData.commission_value,
      }),
    )

    return productsArray.sort((a, b) => {
      if (b.sales !== a.sales) {
        return (b.sales || 0) - (a.sales || 0)
      }
      return (b.totalCommissions || 0) - (a.totalCommissions || 0)
    })
  }, [financesData])

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
    productsError: undefined,
    hasProductsData: !!financesData?.commissions,
    refetchProducts,

    loadMetrics: refetchMetrics,
    loadOrdersEvolution: refetchOrders,
    loadAllTimeMetrics: refetchAllTimeMetrics,
    loadMonthlyMetrics: refetchMonthlyMetrics,
  }
}
