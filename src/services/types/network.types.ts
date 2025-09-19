export interface NetworkAffiliate {
  child_id: number
  name: string
  email: string
  avatar?: string | null
  total_sales: string
  total_commissions: string
  status: 'enabled' | 'disabled' | 'new' | 'blocked'
}

export interface NetworkAffiliateFormatted {
  id: number
  affiliateName: string
  email: string
  avatar: string
  totalSales: string
  totalCommissions: string
  status: 'Ativo' | 'Inativo' | 'Novo' | 'Bloqueado'
}

export interface GetNetworkRequest {
  page?: number
  perpage?: number
  status?: 'enabled' | 'disabled' | 'new' | 'blocked'
  search?: string
}

export interface GetNetworkResponse {
  success: boolean
  message: string
  data: {
    list: NetworkAffiliate[]
    meta: {
      current_page: number
      last_page: number
      total_items: number
      pagesize: number
    }
  }
}
