export interface GetProfileResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface UpdateProfileResponse {
  success: boolean
  message: string
  data?: AffiliateProfileData
}

export interface CreateAccountResponse {
  success: boolean
  message: string
  data?: {
    account_id?: string
    status?: string
  }
}

export interface UploadDocumentsResponse {
  success: boolean
  message: string
  data?: {
    status?: string
    rejected_reason?: string
  }
}

export interface AffiliateProfileData {
  id: number
  name: string
  email: string
  avatar?: string | null
  cpf: string
  phone: string
  birthdate: string
  business_cnpj: string
  business_name?: string | null
  code: string
  custom_commission?: number | null
  status: string
  created_at: string
  bank: Bank
  address: Address
  social_network: string | null
  profile_url: string | null
}

export interface Address {
  id: number
  owner_type: string
  owner_id: number
  alias?: string | null
  zipcode: string
  address: string
  number: string
  complement?: string | null
  district: string
  city: string
  state: string
  country: string
  main: boolean
  created_at: string
  updated_at: string
}

export interface Bank {
  id: number
  user_id: number
  account_type: 'checking' | 'savings' | 'investment'
  agency_number: string
  account_number: string
  bank_name: string
  pix_key?: string | null
  pix_type?: string | null
  created_at: string
  updated_at: string
}

export interface UpdateProfileData {
  name?: string
  email?: string
  cpf?: string
  phone?: string
  birthdate?: string
  business_cnpj?: string
  business_name?: string
  social_network?: string
  profile_url?: string
  avatar?: string | null

  address?: {
    zipcode?: string
    address?: string
    number?: string
    complement?: string
    district?: string
    city?: string
    state?: string
    country?: string
  }

  bank?: {
    account_type?: 'checking' | 'savings' | 'investment'
    agency_number?: string
    account_number?: string
    bank_name?: string
    pix_key?: string
    pix_type?: string
  }
}

export type AccountType = 'checking' | 'savings' | 'investment'

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Conta Corrente',
  savings: 'Conta Poupança',
  investment: 'Conta Investimento',
}
