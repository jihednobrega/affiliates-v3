export interface GetBrandFinancesRequest {
  page?: number
  perpage?: number
  period?: string
  name?: string
  email?: string
}

export interface BrandFinanceItem {
  id: number
  name: string
  email: string
  avatar?: string
  total_sales: string
  to_receive: string
}

export interface BrandFinancesMeta {
  current_page: number
  last_page: number
  total_items: number
  pagesize: number
}

export interface BrandFinancesInvoice {
  period: string
  method: string
  endpoint: string
}

export interface GetBrandFinancesResponse {
  success: boolean
  message: string
  data: {
    list: BrandFinanceItem[]
    meta: BrandFinancesMeta
    period: string
    brand_periods: Record<string, string>
    total_sales: string
    total_affiliates_sales: string
    commissions: string
    days_to_bill: number
    invoice: BrandFinancesInvoice
  }
}

export interface ExportBrandFinancesRequest {
  period: string
  fields?: string
  brand_id?: number
}

export interface ExportBrandFinancesResponse {
  success: boolean
  message: string
  data: {
    url: string
  }
}
