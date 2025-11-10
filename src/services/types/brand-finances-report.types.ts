export interface GetBrandFinancesReportRequest {
  id: number
  page?: number
  perpage?: number
  product?: string
  period?: string
  status?: string
}

export interface BrandFinancesReportItem {
  id: number
  name: string
  sku: string
  image: string
  product_price: string
  commission: string
  commission_percentage: string
  commission_origin: string
  status: string
  vendor_order_id: string
  updated_at: string | null
}

export interface BrandFinancesReportMeta {
  current_page: number
  last_page: number
  total_items: number
  pagesize: number
}

export interface BrandFinancesReportUser {
  name: string
  avatar: string
}

export interface GetBrandFinancesReportResponse {
  success: boolean
  message: string
  data: {
    list: BrandFinancesReportItem[]
    meta: BrandFinancesReportMeta
    period: string
    brand_periods: Record<string, string>
    user: BrandFinancesReportUser
  }
}
