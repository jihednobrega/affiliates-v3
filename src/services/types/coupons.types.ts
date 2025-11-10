import { DefaultResponse, ErrorResponse } from './default.types'

export interface GetCouponsRequest {
  page?: number
  perpage?: number
  coupon?: string
  affiliate?: string
}

export interface CreateCouponRequest {
  user_id: number
  coupon: string
}

export interface UpdateCouponRequest {
  id: number
  user_id?: number
  coupon?: string
  status?: 'active' | 'inactive'
}

export interface DeleteCouponRequest {
  id: number
}

export interface GetCouponsResponse extends DefaultResponse, ErrorResponse {
  data: CouponsData
}

export interface CreateCouponResponse extends DefaultResponse, ErrorResponse {
  data?: CouponData
}

export interface UpdateCouponResponse extends DefaultResponse, ErrorResponse {
  data?: CouponData
}

export interface DeleteCouponResponse extends DefaultResponse, ErrorResponse {
  data?: any
}

export interface CouponsData {
  list: CouponData[]
  meta: CouponMeta
}

export interface CouponData {
  id: number
  user_id: number
  coupon: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  brand_id: number
  user_name: string
  brand_name: string
}

export interface CouponMeta {
  current_page: number
  last_page: number
  total_items: number
  pagesize: number
}
