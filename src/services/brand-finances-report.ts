import { api } from '@/utils/api'
import {
  GetBrandFinancesReportRequest,
  GetBrandFinancesReportResponse,
} from './types/brand-finances-report.types'

/**
 * Serviço para gerenciar relatório de finanças de afiliado específico
 */
export class BrandFinancesReportService {
  /**
   * Buscar relatório de finanças de um afiliado específico
   */
  public async getBrandFinancesReport(
    request: GetBrandFinancesReportRequest
  ): Promise<{
    response: GetBrandFinancesReportResponse | null
    status: number
  }> {
    try {
      const { id, page = 1, perpage = 10, product, period, status } = request

      // Construir query params
      const params = new URLSearchParams({
        page: page.toString(),
        perpage: perpage.toString(),
      })

      if (product) params.append('product', product)
      if (period) params.append('period', period)
      if (status) params.append('status', status)

      const { data, status: statusCode } =
        await api<GetBrandFinancesReportResponse>({
          url: `/brands/finances/report/${id}?${params.toString()}`,
          method: 'GET',
        })

      return { response: data, status: statusCode }
    } catch (error: any) {
      console.error('Erro ao buscar relatório de finanças do afiliado:', error)
      return {
        response: error.response?.data || null,
        status: error.response?.status || 500,
      }
    }
  }
}
