import { api } from '@/utils/api'
import {
  GetBrandDashboardRequest,
  GetBrandDashboardResponse,
} from './types/brand-dashboard.types'

/**
 * Serviço para gerenciar dashboard de marcas
 */
export class BrandDashboardService {
  /**
   * Buscar dados do dashboard de marca
   */
  public async getBrandDashboard(
    request: GetBrandDashboardRequest = {}
  ): Promise<{ response: GetBrandDashboardResponse | null; status: number }> {
    try {
      const { interval } = request

      // Construir URL manualmente para evitar encoding de ":"
      let url = '/brands/dashboard'
      if (interval) {
        url += `?interval=${interval}`
      }

      const { data, status: statusCode } = await api<GetBrandDashboardResponse>(
        {
          url,
          method: 'GET',
        }
      )

      return { response: data, status: statusCode }
    } catch (error: any) {
      console.error('Erro ao buscar dashboard de marca:', error)
      return {
        response: error.response?.data || null,
        status: error.response?.status || 500,
      }
    }
  }
}

// Exportar instância única (singleton)
export const brandDashboardService = new BrandDashboardService()
