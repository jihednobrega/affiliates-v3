import { DefaultResponse } from './default.types'

export interface GetAccountantBillingsRequest {
  page?: number
  perpage?: number
  brand_id?: number
  month?: string
  period?: string
}

export interface CreateBillingRequest {
  brand_id: number
  type: 'monthly_fee' | 'commissioning' | 'take_rate'
  month: string
  due_date: string
  total_amount: number
}

export interface UpdateBillingStatusRequest {
  id: number
  status: 'payed'
}

export interface CreateInvoiceRequest {
  brand_id: number
  period: string
}

export type BillingStatus =
  | 'created'
  | 'pending'
  | 'payed'
  | 'overdue'
  | 'expired'

export type BillingType = 'monthly_fee' | 'commissioning' | 'take_rate'

export interface AccountantListBrand {
  id: number
  brand_name: string
  type: BillingType
  reference: string
  due_date: string
  total_amount: string
  total_payed: string
  payment_url: string
  status: BillingStatus
  created_at: string
}

export interface AccountantListMonthlyFee {
  settings: string[]
  active_affiliates: number
  fee_amount: string
  invoice: {
    invoice_id: string
    status: string
    payment_url: string
  } | null
}

export interface AccountantListTakeRate {
  settings: string[]
  revenue: string
  take_rate_amount: string
  metric_type: 'orders_count' | 'revenue'
  orders_count: number
  invoice: {
    invoice_id: string
    status: string
    payment_url: string
  } | null
}

export interface BillingsMeta {
  current_page: number
  last_page: number
  total_items: number
  per_page?: number
}

export interface GetAccountantBillingsData {
  list: AccountantListBrand[]
  meta: BillingsMeta
  monthly_fee: AccountantListMonthlyFee
  take_rate: AccountantListTakeRate

  total_sales?: string
  total_affiliates_sales?: string
  commissions?: string
  days_to_bill?: number
}

export interface InvoiceData {
  invoice_id: string
  total: string
  payment_url: string
  status: string
}

export interface GetAccountantBillingsResponse extends DefaultResponse {
  data: GetAccountantBillingsData
}

export interface CreateBillingResponse extends DefaultResponse {
  data: InvoiceData
}

export interface UpdateBillingStatusResponse extends DefaultResponse {
  data: {
    message: string
  }
}

export interface CreateInvoiceResponse extends DefaultResponse {
  data: InvoiceData
}
