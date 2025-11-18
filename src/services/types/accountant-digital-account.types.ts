import { DefaultResponse } from './default.types'

export interface GetDigitalAccountsRequest {
  page?: number
  per_page?: number
  brand_id?: number
  status?: DigitalAccountStatus
}

export interface UpdateDigitalAccountStatusRequest {
  id: number
  status: 'verified' | 'rejected'
}

export type DigitalAccountStatus = 'pending' | 'verified' | 'rejected'

export type AccountType = 'PF' | 'PJ'

export interface DigitalAccount {
  id: number
  user_id: number
  user_name: string
  user_email: string
  user_phone: string
  user_document: string
  user_account_type: string
  brand_id: number
  brand_name: string
  identification: string | null
  selfie: string | null
  address_proof: string | null
  balance_sheet: string | null
  social_contract: string | null
  user_bank_account_number: string | null
  user_bank_account_type: string | null
  user_bank_agency_number: string | null
  user_bank_name: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface DigitalAccountsMeta {
  current_page: number
  last_page: number
  total_items: number
  per_page?: number
}

export interface GetDigitalAccountsData {
  list: DigitalAccount[]
  meta: DigitalAccountsMeta
}

export interface GetDigitalAccountsResponse extends DefaultResponse {
  data: GetDigitalAccountsData
}

export interface UpdateDigitalAccountStatusResponse extends DefaultResponse {
  data: {
    message: string
  }
}
