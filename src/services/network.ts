import { api } from '@/utils/api'
import {
  GetNetworkRequest,
  GetNetworkResponse,
  NetworkAffiliate,
  NetworkAffiliateFormatted,
} from './types/network.types'

class NetworkService {
  public async getNetworkAffiliates({
    page,
    perpage,
    status,
    search,
  }: GetNetworkRequest) {
    const controller = new AbortController()
    const URL = `/affiliates/network`
    const params: Record<string, any> = {}

    if (page) params.page = page
    if (perpage) params.perpage = perpage
    if (status) params.status = status
    if (search) params.name = search

    const { data: response, status: statusResponse } =
      await api<GetNetworkResponse>({
        url: URL,
        method: 'GET',
        signal: controller.signal,
        params: Object.keys(params).length > 0 ? params : undefined,
      })

    return { response, status: statusResponse, controller }
  }

  public transform(affiliate: NetworkAffiliate): NetworkAffiliateFormatted {
    return {
      id: affiliate.child_id,
      affiliateName: affiliate.name,
      email: affiliate.email,
      avatar: affiliate.avatar || '',
      totalSales: this.formatCurrency(affiliate.total_sales),
      totalCommissions: this.formatCurrency(affiliate.total_commissions),
      status: this.mapStatus(affiliate.status),
    }
  }

  private mapStatus(
    status: 'enabled' | 'disabled' | 'new' | 'blocked'
  ): 'Ativo' | 'Inativo' | 'Novo' | 'Bloqueado' {
    const statusMap = {
      enabled: 'Ativo' as const,
      disabled: 'Inativo' as const,
      new: 'Novo' as const,
      blocked: 'Bloqueado' as const,
    }
    return statusMap[status] || 'Inativo'
  }

  private formatCurrency(value: string): string {
    const numValue = parseFloat(value)
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue)
  }
}

export { NetworkService }
