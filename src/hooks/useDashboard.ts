import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DashboardService } from '@/services/dashboard'
import { DateRange } from '@/types/dashboard.types'
import { formatCurrency } from '@/utils/currency'
import { dateRangeToApiParams } from '@/utils/dashboardUtils'
import { processMetrics } from '@/utils/metrics'
import { RankingProduct } from '@/services/types/dashboard.types'
import { useFinances } from '@/hooks/useFinances'
import { useLinks } from '@/hooks/useLinks'

const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // Se navegar para outra tela e voltar em 4 minutos, não faz nova requisição
  gcTime: 10 * 60 * 1000, // Cache removido da memória só depois de 10min sem uso
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
    enabled: !!apiParams, // Só executa quando tem parâmetros
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
    perPage: 100, // Pegar mais comissões para análise completa
  })

  const { data: linksData, isLoading: isLoadingLinks } = useLinks({
    page: 1,
    perpage: 100,
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

    const linksMap = new Map()
    if (linksData?.links) {
      linksData.links.forEach((link: any) => {
        if (link.product_id) {
          linksMap.set(link.product_id.toString(), link)
        }
      })
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
          commission_value: parseFloat(commission.commission) || 0, // Valor real da comissão
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

        linkData: linksMap.get(productData.id.toString()) || null,
        url: linksMap.get(productData.id.toString())?.url || undefined,
        short_url: linksMap.get(productData.id.toString())?.url || undefined,
        destination_url:
          linksMap.get(productData.id.toString())?.destination_url || undefined,
        clicks: linksMap.get(productData.id.toString())?.total_views || 0,
        sales: productData.count,
        revenue: productData.totalRevenue,
        totalCommissions: productData.totalCommissions,
        commissionValue: productData.commission_value,
      })
    )

    return productsArray.sort((a, b) => {
      if (b.sales !== a.sales) {
        return (b.sales || 0) - (a.sales || 0)
      }
      return (b.totalCommissions || 0) - (a.totalCommissions || 0)
    })
  }, [financesData, linksData])

  const isLoadingAny = useMemo(
    () =>
      isLoadingMetrics ||
      isLoadingOrders ||
      isLoadingMonthlyMetrics ||
      isLoadingAllTimeMetrics ||
      isLoadingProducts ||
      isLoadingLinks,
    [
      isLoadingMetrics,
      isLoadingOrders,
      isLoadingMonthlyMetrics,
      isLoadingAllTimeMetrics,
      isLoadingProducts,
      isLoadingLinks,
    ]
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
