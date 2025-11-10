export interface AffiliateLinksFilters {
  page: number
  perpage: number
  user?: number
  product?: string
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
}

export interface AffiliateLinksMeta {
  current_page: number
  last_page: number
  total_items: number
  pagesize: number
}

export interface AffiliateLinksData {
  list: AffiliateLinkItem[]
  meta: AffiliateLinksMeta
}

export interface GetAffiliateLinksResponse {
  success: boolean
  message: string
  data: AffiliateLinksData
}
