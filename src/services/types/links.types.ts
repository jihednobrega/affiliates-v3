import { DefaultResponse, ErrorResponse } from './default.types'

export interface GetAffiliateLinksRequest {
  page: number
  perpage: number
  product?: string
  view?: string
}

export interface GetAffiliateLinksResponse
  extends DefaultResponse,
    ErrorResponse {
  data: AffiliateLinksData
}

export interface AffiliateLinksData {
  list: AffiliateLinkItem[]
  meta: AffiliateMeta
}

export interface AffiliateLinkItem {
  id: number
  uid: number
  name: string
  code: string
  url: string
  source_url: string
  destination_url: string
  product_id: number
  product: string
  image: string
  deleted_at: string | null
  created_at: string
  total_views: number

  clicks?: number
  conversions?: number
  revenue?: number
  updated_at?: string
  status?: keyof LinkStatus
  product_name?: string
  product_image?: string
  tags?: string[]
  short_url?: string | null
  utm_url?: string | null
}

export interface AffiliateMeta {
  current_page: number
  last_page: number
  total_items: number
  pagesize: number
}

export interface LinkStatus {
  active: string
  inactive: string
  pending: string
  suspended: string
}

export interface LinksFilters {
  status?: string
  page: number
  perpage: number
  product?: string
  view?: string
}

export interface LinksSummary {
  total_links: number
  active_links: number
  total_clicks: number
  total_conversions: number
  total_revenue: number
  conversion_rate: number
}

export interface ProcessedLinkData {
  id: number
  uid: number
  name: string
  code: string
  url: string
  source_url: string
  destination_url: string
  product_id: number
  product: string
  image: string
  created_at: string
  total_views: number
  deleted_at: string | null

  clicks: number
  conversions: number
  revenue: number
  revenueFormatted: string
  updated_at: string
  status: keyof LinkStatus
  statusLabel: string
  product_name: string
  product_image: string
  short_url: string | null
  utm_url: string | null
  tags?: string[]
  conversion_rate: number
  conversion_rate_formatted: string
}
