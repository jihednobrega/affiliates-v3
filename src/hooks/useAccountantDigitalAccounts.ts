import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AccountantDigitalAccountService } from '@/services/accountant-digital-account'
import { DigitalAccountStatus } from '@/services/types/accountant-digital-account.types'

const CACHE_CONFIG = {
  staleTime: 2 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
} as const

interface DigitalAccountFilters {
  page: number
  per_page: number
  brand_id?: number
  status?: DigitalAccountStatus
}

export const useAccountantDigitalAccounts = (
  initialFilters?: Partial<DigitalAccountFilters>
) => {
  const accountService = useMemo(
    () => new AccountantDigitalAccountService(),
    []
  )
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<DigitalAccountFilters>({
    page: 1,
    per_page: 15,
    ...initialFilters,
  })

  const {
    data: accountsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['accountant', 'digital-accounts', filters],
    queryFn: () => accountService.getDigitalAccounts(filters),
    ...CACHE_CONFIG,
  })

  const processedData = useMemo(() => {
    if (!accountsData?.response?.success || !accountsData.response.data) {
      return null
    }

    const data = accountsData.response.data

    return {
      list: data.list || [],
      meta: data.meta,
    }
  }, [accountsData])

  const approveMutation = useMutation({
    mutationFn: (id: number) =>
      accountService.updateAccountStatus(id, 'verified'),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accountant', 'digital-accounts'],
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) =>
      accountService.updateAccountStatus(id, 'rejected'),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accountant', 'digital-accounts'],
      })
    },
  })

  const updateFilters = (newFilters: Partial<DigitalAccountFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const setBrand = (brand_id?: number) => {
    setFilters((prev) => ({ ...prev, brand_id, page: 1 }))
  }

  const setStatus = (status?: DigitalAccountStatus) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }))
  }

  const approve = async (id: number) => {
    return approveMutation.mutateAsync(id)
  }

  const reject = async (id: number) => {
    return rejectMutation.mutateAsync(id)
  }

  return {
    data: processedData,

    isLoading,
    error,

    filters,
    updateFilters,
    setPage,
    setBrand,
    setStatus,

    refetch,

    approve,
    reject,

    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  }
}
