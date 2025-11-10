import { useState, useEffect } from 'react'
import { BrandFinancesService } from '@/services/brand-finances'
import type {
  BrandFinanceItem,
  BrandFinancesMeta,
  GetBrandFinancesRequest,
} from '@/services/types/brand-finances.types'

interface UseBrandFinancesReturn {
  data: BrandFinanceItem[]
  loading: boolean
  error: string | null
  retry: () => void
  refetch: () => void
  meta?: BrandFinancesMeta
  period?: string
  brandPeriods?: Record<string, string>
  totalSales?: string
  totalAffiliatesSales?: string
  commissions?: string
  daysToBill?: number
  invoice?: {
    period: string
    method: string
    endpoint: string
  }
}

const brandFinancesService = new BrandFinancesService()

// Cache simples (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000
const financesCache = new Map<
  string,
  {
    data: BrandFinanceItem[]
    meta?: BrandFinancesMeta
    period?: string
    brandPeriods?: Record<string, string>
    totalSales?: string
    totalAffiliatesSales?: string
    commissions?: string
    daysToBill?: number
    invoice?: {
      period: string
      method: string
      endpoint: string
    }
    timestamp: number
  }
>()

export function useBrandFinances(
  params: GetBrandFinancesRequest
): UseBrandFinancesReturn {
  const [data, setData] = useState<BrandFinanceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<BrandFinancesMeta | undefined>()
  const [period, setPeriod] = useState<string | undefined>()
  const [brandPeriods, setBrandPeriods] = useState<
    Record<string, string> | undefined
  >()
  const [totalSales, setTotalSales] = useState<string | undefined>()
  const [totalAffiliatesSales, setTotalAffiliatesSales] = useState<
    string | undefined
  >()
  const [commissions, setCommissions] = useState<string | undefined>()
  const [daysToBill, setDaysToBill] = useState<number | undefined>()
  const [invoice, setInvoice] = useState<
    | {
        period: string
        method: string
        endpoint: string
      }
    | undefined
  >()
  const [retryKey, setRetryKey] = useState(0)

  const cacheKey = JSON.stringify(params)

  useEffect(() => {
    let isMounted = true

    const fetchFinances = async () => {
      try {
        // Verificar cache
        const cached = financesCache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          if (isMounted) {
            setData(cached.data)
            setMeta(cached.meta)
            setPeriod(cached.period)
            setBrandPeriods(cached.brandPeriods)
            setTotalSales(cached.totalSales)
            setTotalAffiliatesSales(cached.totalAffiliatesSales)
            setCommissions(cached.commissions)
            setDaysToBill(cached.daysToBill)
            setInvoice(cached.invoice)
            setLoading(false)
            setError(null)
          }
          return
        }

        setLoading(true)
        setError(null)

        const result = await brandFinancesService.getBrandFinances(params)

        if (!isMounted) return

        if (result.status === 200 && result.response?.success) {
          const financesData = result.response.data?.list || []
          const metaData = result.response.data?.meta
          const periodData = result.response.data?.period
          const brandPeriodsData = result.response.data?.brand_periods
          const totalSalesData = result.response.data?.total_sales
          const totalAffiliatesSalesData =
            result.response.data?.total_affiliates_sales
          const commissionsData = result.response.data?.commissions
          const daysToBillData = result.response.data?.days_to_bill
          const invoiceData = result.response.data?.invoice

          setData(financesData)
          setMeta(metaData)
          setPeriod(periodData)
          setBrandPeriods(brandPeriodsData)
          setTotalSales(totalSalesData)
          setTotalAffiliatesSales(totalAffiliatesSalesData)
          setCommissions(commissionsData)
          setDaysToBill(daysToBillData)
          setInvoice(invoiceData)
          setError(null)

          // Atualizar cache
          financesCache.set(cacheKey, {
            data: financesData,
            meta: metaData,
            period: periodData,
            brandPeriods: brandPeriodsData,
            totalSales: totalSalesData,
            totalAffiliatesSales: totalAffiliatesSalesData,
            commissions: commissionsData,
            daysToBill: daysToBillData,
            invoice: invoiceData,
            timestamp: Date.now(),
          })
        } else {
          setError(result.response?.message || 'Erro ao carregar finanças')
          setData([])
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Erro ao buscar finanças:', err)
          setError(err.message || 'Erro ao carregar finanças')
          setData([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchFinances()

    return () => {
      isMounted = false
    }
  }, [cacheKey, retryKey])

  const retry = () => {
    // Limpar cache para forçar nova busca
    financesCache.delete(cacheKey)
    setRetryKey((prev) => prev + 1)
  }

  const refetch = () => {
    // Limpar cache e forçar nova busca
    financesCache.delete(cacheKey)
    setRetryKey((prev) => prev + 1)
  }

  return {
    data,
    loading,
    error,
    retry,
    refetch,
    meta,
    period,
    brandPeriods,
    totalSales,
    totalAffiliatesSales,
    commissions,
    daysToBill,
    invoice,
  }
}
