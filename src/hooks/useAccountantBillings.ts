import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AccountantBillingService } from '@/services/accountant-billing'
import { CreateBillingRequest } from '@/services/types/accountant-billing.types'
import { formatCurrency } from '@/utils/currency'

const CACHE_CONFIG = {
  staleTime: 2 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
} as const

interface BillingsFilters {
  page: number
  perpage: number
  brand_id?: number
  month?: string
  period?: string
}

export const useAccountantBillings = (
  initialFilters?: Partial<BillingsFilters>
) => {
  const billingService = useMemo(() => new AccountantBillingService(), [])
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<BillingsFilters>({
    page: 1,
    perpage: 10,
    ...initialFilters,
  })

  const {
    data: billingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['accountant', 'billings', filters],
    queryFn: () => billingService.getBillings(filters),
    ...CACHE_CONFIG,
  })

  const processedData = useMemo(() => {
    if (!billingsData?.response?.success || !billingsData.response.data) {
      return null
    }

    const data = billingsData.response.data

    return {
      billings: data.list || [],

      meta: data.meta,

      monthlyFee: data.monthly_fee
        ? {
            ...data.monthly_fee,
            feeAmountFormatted: formatCurrency(data.monthly_fee.fee_amount),
          }
        : null,

      takeRate: data.take_rate
        ? {
            ...data.take_rate,
            revenueFormatted: formatCurrency(data.take_rate.revenue),
            takeRateAmountFormatted: formatCurrency(
              data.take_rate.take_rate_amount
            ),
          }
        : null,
    }
  }, [billingsData])

  const createBillingMutation = useMutation({
    mutationFn: (data: CreateBillingRequest) =>
      billingService.createBilling(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountant', 'billings'] })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'payed' }) =>
      billingService.updateBillingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountant', 'billings'] })
    },
  })

  const createInvoiceMutation = useMutation({
    mutationFn: (data: { brand_id: number; period: string }) =>
      billingService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountant', 'billings'] })
    },
  })

  const updateFilters = (newFilters: Partial<BillingsFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const setMonth = (month?: string) => {
    setFilters((prev) => ({ ...prev, month, page: 1 }))
  }

  const setBrand = (brand_id?: number) => {
    setFilters((prev) => ({ ...prev, brand_id, page: 1 }))
  }

  const setPeriod = (period?: string) => {
    setFilters((prev) => ({ ...prev, period, page: 1 }))
  }

  const createBilling = async (data: CreateBillingRequest) => {
    return createBillingMutation.mutateAsync(data)
  }

  const confirmPayment = async (id: number) => {
    return updateStatusMutation.mutateAsync({ id, status: 'payed' })
  }

  const createInvoice = async (brand_id: number, period: string) => {
    return createInvoiceMutation.mutateAsync({ brand_id, period })
  }

  return {
    data: processedData,

    isLoading,
    error,

    filters,
    updateFilters,
    setPage,
    setMonth,
    setBrand,
    setPeriod,

    refetch,

    createBilling,
    confirmPayment,
    createInvoice,

    isCreatingBilling: createBillingMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isCreatingInvoice: createInvoiceMutation.isPending,
  }
}
