import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FinancesService } from '@/services/finances'
import {
  FinancesFilters,
  AffiliateFinancesData,
} from '@/services/types/finances.types'
import { formatCurrency } from '@/utils/currency'

const CACHE_CONFIG = {
  staleTime: 3 * 60 * 1000, // 3 minutos - dados financeiros mudam com menos frequência
  gcTime: 10 * 60 * 1000, // 10 minutos na memória
  timeout: 30000, // TEMPORÁRIO: 30 segundos para usuários com muitos dados financeiros
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

  const processedData = useMemo(() => {
    if (
      !financesData?.response?.success ||
      !financesData.response.data ||
      typeof financesData.response.data !== 'object'
    ) {
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
          data.available_commissions
        ),
        minimumWithdrawAmountFormatted: formatCurrency(
          data.minimum_withdraw_amount
        ),
        totalSalesFormatted: formatCurrency(data.total_sales),
        futureCommissionsFormatted: formatCurrency(
          parseFloat(data.future_commissions || '0')
        ),
      },

      commissions: data.list || [],

      meta: data.meta,
    }
  }, [financesData])

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
    setFilters((prev) => {
      if (prev.product !== product) {
        return { ...prev, product, page: 1 }
      }
      return prev
    })
  }

  const isLoading = isLoadingFinances
  const hasError = financesError

  const exportFinances = async (
    period?: string,
    fields?: string,
    product?: string,
    status?: string
  ) => {
    try {
      const result = await FinancesService.getAffiliateFinancesExport({
        period,
        fields,
        product,
        status,
      })
      return result
    } catch (error) {
      console.error('Erro ao exportar finanças:', error)
      throw error
    }
  }

  const exportExtract = async (month?: string) => {
    try {
      const result = await financesService.getAffiliateExtract({
        month,
        exportFile: true,
      })
      return result
    } catch (error) {
      console.error('Erro ao exportar extrato:', error)
      throw error
    }
  }

  return {
    data: processedData,

    isLoading,
    isLoadingFinances,
    hasError,
    financesError,

    filters,
    updateFilters,
    setPage,
    setStatus,
    setProduct,

    refetchFinances,
    refetch: refetchFinances,

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
        financesData.available_commissions
      ),
      minimumWithdrawAmountFormatted: formatCurrency(
        financesData.minimum_withdraw_amount
      ),
      totalSalesFormatted: formatCurrency(financesData.total_sales),
      futureCommissionsFormatted: formatCurrency(
        parseFloat(financesData.future_commissions || '0')
      ),
    }
  }, [data])

  return {
    summary,
    isLoading,
    error,
  }
}
