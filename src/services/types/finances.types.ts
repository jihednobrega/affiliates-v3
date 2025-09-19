import { DefaultResponse, ErrorResponse } from './default.types'

export interface GetAffiliateFinancesRequest {
  page: number
  perPage: number
  listOnly?: boolean
  product?: string
  status?: string
}

export interface GetAffiliateFinancesResponse
  extends DefaultResponse,
    ErrorResponse {
  data: AffiliateFinancesData
}

export interface AffiliateFinancesData {
  available_commissions: number
  minimum_withdraw_amount: number
  total_sales: number
  future_commissions: string
  next_pay_date: any
  list: CommissionAffiliateList[]
  meta: AffiliateMeta
}

export interface CommissionAffiliateList {
  id: number
  name: string
  image: string
  sku: string
  product_price: string
  commission_percentage: string
  commission: string
  commission_origin: string
  customer: string
  vendor_order_id: string
  vendor_status: keyof VtexOrderstatus
  status: string
  coupon: string
  updated_at: string
}

export interface AffiliateMeta {
  current_page: number
  last_page: number
  total_items: number
  pagesize: number
  offset: number
}

export interface GetAffiliateExtractRequest {
  month?: string
  exportFile?: boolean
  withdrawal?: boolean
  page?: number
  perpage?: number
}

export interface GetExtractResponse extends DefaultResponse, ErrorResponse {
  data: {
    list: ExtractItem[]
    meta: AffiliateMeta
  }
}

export interface ExtractItem {
  brand_name: string
  type: keyof Transactiontype
  amount: string
  created_at: string
  withdraw_requests_amount: string
  withdraw_requests_final_amount: string
  withdraw_requests_tax_amount: string
  withdraw_requests_tax_percent: string
}

export interface VtexOrderstatus {
  ready_for_handling: string
  handling: string
  invoiced: string
  shipped: string
  delivered: string
  canceled: string
  payment_pending: string
  payment_approved: string
}

export interface Transactiontype {
  commission: string
  withdraw: string
  bonus: string
  refund: string
}

export interface FinancesFilters {
  status?: string
  product?: string
  page: number
  perPage: number
}
