import { DefaultResponse, ErrorResponse } from './default.types'

export interface GetProductsRequest {
  page: number
  perpage: number
  product?: string
  featured?: string
  orderBy?: string
}

export interface GetProductsResponse extends DefaultResponse, ErrorResponse {
  data: ProductsData
}

export interface GetProductByIdResponse extends DefaultResponse, ErrorResponse {
  data: ProductItem
}

export interface ProductsData {
  list: ProductItem[]
  meta: ProductMeta
}

export interface ProductItem {
  id: number
  brand_id: number
  vendor_id: string
  name: string
  category: string
  image: string
  url: string
  sku: string
  price: number
  commission: number
  short_url: string | null
  utm_url: string | null
  created_at?: string
  updated_at?: string
}

export interface ProductMeta {
  current_page: number
  last_page: number
  total_items: number
  pagesize: number
}

export interface ProductsFilters {
  page: number
  perpage: number
  category?: string
  search?: string
  product?: string
  featured?: string
  orderBy?: string
}
