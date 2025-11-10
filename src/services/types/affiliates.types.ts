export interface GetAffiliatesRequest {
  page?: number
  perpage?: number
  name?: string
  status?: AffiliateStatus
  parent_name?: string
  period?: string
  listOnly?: boolean
  email?: string
}

export interface GetAffiliatesResponse {
  success: boolean
  message: string
  data: {
    list: AffiliateListItem[]
    meta: AffiliateMeta
    stats?: AffiliateStats
  }
}

export interface GetAffiliateRequest {
  id: number
}

export interface GetAffiliateResponse {
  success: boolean
  message: string
  data: AffiliateDetail
}

export interface CreateAffiliateRequest {
  name: string
  email: string
  avatar?: string
  cpf: string
  phone: string
  birthdate: string
  custom_commission?: string | null
  password?: string
  can_have_referrals?: boolean
  commission_over_referred?: string | null
  password_confirmation?: string
  selected_parent?: string | null
  status: AffiliateStatus
  profile_url?: string
}

export interface CreateAffiliateResponse {
  success: boolean
  message: string
  data: AffiliateDetail
}

export interface UpdateAffiliateRequest {
  id: number
  name?: string
  avatar?: string
  cpf?: string
  business_cnpj?: string
  business_name?: string
  phone?: string
  birthdate?: string
  custom_commission?: string | null
  commission_over_referred?: string | null
  status?: AffiliateStatus
  can_have_referrals?: boolean
  selected_parent?: number | null
}

export interface UpdateAffiliateResponse {
  success: boolean
  message: string
  data: AffiliateDetail
}

export interface GetAffiliatesRankRequest {
  page?: number
  perpage?: number
  period?: string
  name?: string
  city?: string
}

export interface GetAffiliatesRankResponse {
  success: boolean
  message: string
  data: {
    list: AffiliateRankItem[]
    meta: AffiliateMeta
    stats?: AffiliateStats
  }
}

export interface GetMastersResponse {
  success: boolean
  message: string
  data: MasterAffiliate[]
}

export interface AffiliateListItem {
  id: number
  avatar?: string
  name: string
  email: string
  status: AffiliateStatus
  created_at: string
  age: string
  locale: string
  phone: string
  parent_name: string
  total_sales: string
  code: string
  city?: string
  total_amount?: string
}

export interface AffiliateDetail {
  id: number
  avatar: string
  name: string
  email: string
  cpf: string
  birthdate: string
  code: string
  business_name: string
  business_cnpj: string
  custom_commission: string | number
  status: AffiliateStatus
  created_at: string
  updated_at: string
  phone: string
  profile_url: string
  social_network: string
  can_have_referrals: boolean
  is_parent: boolean
  commission_over_referred?: string
  available_parents?: { id: number; name: string }[]
  parent_name?: string
  selected_parent?: number | null
  parent_affiliate_id?: number
  parent_id?: number
}

export interface AffiliateRankItem {
  id: number
  name: string
  avatar?: string
  city?: string
  brand_id: number
  brand_name: string
  total_sales: number
  total_amount: string
  email?: string
  code: string
  status?: AffiliateStatus
}

export interface MasterAffiliate {
  id: number
  name: string
}

export type AffiliateStatus = 'new' | 'enabled' | 'disabled' | 'blocked'

export interface AffiliateMeta {
  current_page: number
  last_page: number
  total_items: number
  pagesize: number
  offset: number
}

export interface AffiliateStats {
  total: number
  new: number
  actives: number
  inactives: number
  blockeds: number
}
