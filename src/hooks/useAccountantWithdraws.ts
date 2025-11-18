import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AccountantWithdrawService } from '@/services/accountant-withdraw'
import { WithdrawRequest } from '@/services/types/accountant-withdraw.types'
import { formatCurrency } from '@/utils/currency'

const CACHE_CONFIG = {
  staleTime: 1 * 60 * 1000,
  gcTime: 5 * 60 * 1000,
} as const

interface WithdrawFilters {
  page: number
  perpage: number
  brand_id?: number
}

export const useAccountantWithdraws = (
  initialFilters?: Partial<WithdrawFilters>
) => {
  const withdrawService = useMemo(() => new AccountantWithdrawService(), [])
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<WithdrawFilters>({
    page: 1,
    perpage: 15,
    ...initialFilters,
  })

  const {
    data: withdrawsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['accountant', 'withdraws', filters],
    queryFn: () => withdrawService.getWithdrawRequests(filters),
    ...CACHE_CONFIG,
  })

  const processedData = useMemo(() => {
    if (!withdrawsData?.response?.success || !withdrawsData.response.data) {
      return null
    }

    const data = withdrawsData.response.data

    const processedList = (data.list || []).map(
      (withdraw: WithdrawRequest) => ({
        ...withdraw,
        amountFormatted: formatCurrency(withdraw.amount),
        taxAmountFormatted: formatCurrency(withdraw.tax_amount),
        finalAmountFormatted: formatCurrency(withdraw.final_amount),
        currentBalanceFormatted: formatCurrency(withdraw.user_current_balance),
      })
    )

    return {
      list: processedList,
      meta: data.meta,
    }
  }, [withdrawsData])

  const approveMutation = useMutation({
    mutationFn: (id: number) =>
      withdrawService.updateWithdrawStatus(id, 'done'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountant', 'withdraws'] })
    },
  })

  const refuseMutation = useMutation({
    mutationFn: (id: number) =>
      withdrawService.updateWithdrawStatus(id, 'refused'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountant', 'withdraws'] })
    },
  })

  const updateFilters = (newFilters: Partial<WithdrawFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const setBrand = (brand_id?: number) => {
    setFilters((prev) => ({ ...prev, brand_id, page: 1 }))
  }

  const approve = async (id: number) => {
    return approveMutation.mutateAsync(id)
  }

  const refuse = async (id: number) => {
    return refuseMutation.mutateAsync(id)
  }

  return {
    data: processedData,
    isLoading,
    error,
    filters,
    updateFilters,
    setPage,
    setBrand,
    refetch,
    approve,
    refuse,
    isApproving: approveMutation.isPending,
    isRefusing: refuseMutation.isPending,
  }
}
