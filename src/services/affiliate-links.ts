import { api } from '@/utils/api'
import type {
  AffiliateLinksFilters,
  GetAffiliateLinksResponse,
} from './types/affiliate-links.types'

export class AffiliateLinksService {
  /**
   * Busca links de um afiliado específico
   * GET /affiliates/links
   */
  public async getAffiliateLinks(filters: AffiliateLinksFilters): Promise<{
    response: GetAffiliateLinksResponse | null
    status: number
    controller: AbortController
  }> {
    try {
      const controller = new AbortController()

      // Construir query params
      const params: Record<string, any> = {
        page: filters.page || 1,
        perpage: filters.perpage || 5,
      }

      // Adicionar filtro de usuário (obrigatório)
      if (filters.user) {
        params.user = filters.user
      }

      // Adicionar filtro de produto (opcional)
      if (filters.product) {
        params.product = filters.product
      }

      const { data, status: statusCode } = await api<GetAffiliateLinksResponse>(
        {
          url: '/affiliates/links',
          method: 'GET',
          params,
          signal: controller.signal,
        }
      )

      return {
        response: data,
        status: statusCode,
        controller,
      }
    } catch (error: any) {
      console.error('Erro ao buscar links do afiliado:', error)
      return {
        response: error.response?.data || null,
        status: error.response?.status || 500,
        controller: new AbortController(),
      }
    }
  }

  /**
   * Exclui um link específico
   * DELETE /affiliates/links/:id
   */
  public async deleteAffiliateLink(linkId: number): Promise<{
    response: { success: boolean; message: string } | null
    status: number
  }> {
    try {
      const { data, status: statusCode } = await api<{
        success: boolean
        message: string
      }>({
        url: `/affiliates/links/${linkId}`,
        method: 'DELETE',
      })

      return {
        response: data,
        status: statusCode,
      }
    } catch (error: any) {
      console.error('Erro ao excluir link:', error)
      return {
        response: error.response?.data || null,
        status: error.response?.status || 500,
      }
    }
  }
}
