import { DefaultResponse } from './default.types'

export interface GetWithdrawRequestsRequest {
  page?: number
  perpage?: number
  brand_id?: number
}

export interface UpdateWithdrawStatusRequest {
  id: number
  status: 'done' | 'refused'
}

export type WithdrawStatus = 'pending' | 'done' | 'refused' | 'processing'

export interface WithdrawRequest {
  id: number
  user_name: string
  user_document: string
  amount: string
  tax_amount: string
  tax_percent: string
  final_amount: string
  brand_name: string
  user_current_balance: string
  status: WithdrawStatus
  created_at: string
  updated_at: string
}

export interface WithdrawRequestsMeta {
  current_page: number
  last_page: number
  total_items: number
  per_page?: number
}

export interface GetWithdrawRequestsData {
  list: WithdrawRequest[]
  meta: WithdrawRequestsMeta
}

export interface GetWithdrawRequestsResponse extends DefaultResponse {
  data: GetWithdrawRequestsData
}

export interface UpdateWithdrawStatusResponse extends DefaultResponse {
  data: {
    message: string
  }
}
