import { api } from '@/utils/api'
import {
  GetBrandFinancesRequest,
  GetBrandFinancesResponse,
  ExportBrandFinancesRequest,
  ExportBrandFinancesResponse,
} from './types/brand-finances.types'

/**
 * Serviço para gerenciar finanças da marca
 */
export class BrandFinancesService {
  /**
   * Buscar finanças da marca (lista de afiliados com vendas e comissões)
   */
  public async getBrandFinances(
    request: GetBrandFinancesRequest
  ): Promise<{ response: GetBrandFinancesResponse | null; status: number }> {
    try {
      const { page = 1, perpage = 10, period, name, email } = request

      // Construir query params
      const params = new URLSearchParams({
        page: page.toString(),
        perpage: perpage.toString(),
      })

      if (period) params.append('period', period)
      if (name) params.append('name', name)
      if (email) params.append('email', email)

      const { data, status: statusCode } = await api<GetBrandFinancesResponse>({
        url: `/brands/finances?${params.toString()}`,
        method: 'GET',
      })

      return { response: data, status: statusCode }
    } catch (error: any) {
      console.error('Erro ao buscar finanças da marca:', error)
      return {
        response: error.response?.data || null,
        status: error.response?.status || 500,
      }
    }
  }

  /**
   * Exportar finanças da marca
   */
  public async exportBrandFinances(
    request: ExportBrandFinancesRequest
  ): Promise<{ response: any; status: number }> {
    try {
      const { period, fields } = request

      const { data, status: statusCode } = await api({
        url: `/brands/finances/export`,
        method: 'GET',
        responseType: 'blob', // Especificar que esperamos um arquivo
        params: {
          period,
          fields: fields || undefined,
        },
      })

      return { response: data, status: statusCode }
    } catch (error: any) {
      console.error('Erro ao exportar finanças da marca:', error)
      return {
        response: error.response?.data || null,
        status: error.response?.status || 500,
      }
    }
  }
}
