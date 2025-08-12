import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FinancesService } from '@/services/finances'
import {
  FinancesFilters,
  AffiliateFinancesData,
} from '@/services/types/finances.types'
import { formatCurrency } from '@/utils/currency'

const CACHE_CONFIG = {
  staleTime: 3 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
} as const

export const useFinances = (initialFilters?: Partial<FinancesFilters>) => {
  const financesService = useMemo(() => new FinancesService(), [])

  const [filters, setFilters] = useState<FinancesFilters>({
    page: 1,
    perPage: 20,
    ...initialFilters,
  })

  const {
    data: financesData,
    isLoading: isLoadingFinances,
    error: financesError,
    refetch: refetchFinances,
  } = useQuery({
    queryKey: ['finances', 'affiliate', filters],
    queryFn: () => financesService.getAffiliateFinances(filters),
    ...CACHE_CONFIG,
  })

  const {
    data: extractData,
    isLoading: isLoadingExtract,
    error: extractError,
    refetch: refetchExtract,
  } = useQuery({
    queryKey: ['finances', 'extract', filters.page, filters.perPage],
    queryFn: () =>
      financesService.getAffiliateExtract({
        page: filters.page,
        perpage: filters.perPage,
      }),
    ...CACHE_CONFIG,
  })

  const processedData = useMemo(() => {
    if (!financesData?.response?.success || !financesData.response.data) {
      return null
    }

    const data: AffiliateFinancesData = financesData.response.data

    return {
      summary: {
        availableCommissions: data.available_commissions,
        minimumWithdrawAmount: data.minimum_withdraw_amount,
        totalSales: data.total_sales,
        futureCommissions: parseFloat(data.future_commissions || '0'),
        nextPayDate: data.next_pay_date,

        availableCommissionsFormatted: formatCurrency(
          data.available_commissions,
        ),
        minimumWithdrawAmountFormatted: formatCurrency(
          data.minimum_withdraw_amount,
        ),
        totalSalesFormatted: formatCurrency(data.total_sales),
        futureCommissionsFormatted: formatCurrency(
          parseFloat(data.future_commissions || '0'),
        ),
      },

      commissions: data.list || [],

      meta: data.meta,
    }
  }, [financesData])

  const extractList = useMemo(() => {
    if (!extractData?.response || !('data' in extractData.response)) {
      return []
    }
    return extractData.response.data.list || []
  }, [extractData])

  const updateFilters = (newFilters: Partial<FinancesFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const setStatus = (status?: string) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }))
  }

  const setProduct = (product?: string) => {
    setFilters((prev) => ({ ...prev, product, page: 1 }))
  }

  const isLoading = isLoadingFinances || isLoadingExtract
  const hasError = financesError || extractError

  const exportFinances = async (period?: string, fields?: string) => {
    const result = await FinancesService.getAffiliateFinancesExport({
      period,
      fields,
    })
    return result
  }

  const exportExtract = async (month?: string) => {
    const result = await financesService.getAffiliateExtract({
      month,
      exportFile: true,
    })
    return result
  }

  return {
    data: processedData,
    extractList,

    isLoading,
    isLoadingFinances,
    isLoadingExtract,
    hasError,
    financesError,
    extractError,

    filters,
    updateFilters,
    setPage,
    setStatus,
    setProduct,

    refetchFinances,
    refetchExtract,
    refetch: () => {
      refetchFinances()
      refetchExtract()
    },

    exportFinances,
    exportExtract,
  }
}

export const useFinancesSummary = () => {
  const financesService = useMemo(() => new FinancesService(), [])

  const { data, isLoading, error } = useQuery({
    queryKey: ['finances', 'summary'],
    queryFn: () =>
      financesService.getAffiliateFinances({
        page: 1,
        perPage: 1,
        listOnly: true,
      }),
    ...CACHE_CONFIG,
  })

  const summary = useMemo(() => {
    if (!data?.response?.success || !data.response.data) {
      return null
    }

    const financesData = data.response.data

    return {
      availableCommissions: financesData.available_commissions,
      minimumWithdrawAmount: financesData.minimum_withdraw_amount,
      totalSales: financesData.total_sales,
      futureCommissions: parseFloat(financesData.future_commissions || '0'),
      nextPayDate: financesData.next_pay_date,

      availableCommissionsFormatted: formatCurrency(
        financesData.available_commissions,
      ),
      minimumWithdrawAmountFormatted: formatCurrency(
        financesData.minimum_withdraw_amount,
      ),
      totalSalesFormatted: formatCurrency(financesData.total_sales),
      futureCommissionsFormatted: formatCurrency(
        parseFloat(financesData.future_commissions || '0'),
      ),
    }
  }, [data])

  return {
    summary,
    isLoading,
    error,
  }
}
