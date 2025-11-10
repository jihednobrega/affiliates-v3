import { api } from '@/utils/api'
import {
  GetAffiliatesRequest,
  GetAffiliatesResponse,
  GetAffiliateRequest,
  GetAffiliateResponse,
  CreateAffiliateRequest,
  CreateAffiliateResponse,
  UpdateAffiliateRequest,
  UpdateAffiliateResponse,
  GetAffiliatesRankRequest,
  GetAffiliatesRankResponse,
  GetMastersResponse,
} from './types/affiliates.types'

/**
 * Serviço para gerenciar afiliados da marca
 */
export class AffiliatesService {
  /**
   * Listar afiliados com filtros e paginação
   */
  public async getAffiliates(
    request: GetAffiliatesRequest
  ): Promise<{ response: GetAffiliatesResponse | null; status: number }> {
    try {
      const {
        page = 1,
        perpage = 15,
        listOnly,
        name,
        period,
        status,
        email,
        parent_name,
      } = request

      // Construir query params
      const params = new URLSearchParams({
        page: page.toString(),
        perpage: perpage.toString(),
      })

      if (listOnly) params.append('listOnly', 'true')
      if (name) params.append('name', name)
      if (period) params.append('period', period)
      if (status) params.append('status', status)
      if (email) params.append('email', email)
      if (parent_name) params.append('parent_name', parent_name)

      const { data, status: statusCode } = await api<GetAffiliatesResponse>({
        url: `/brands/affiliates?${params.toString()}`,
        method: 'GET',
      })

      return { response: data, status: statusCode }
    } catch (error: any) {
      console.error('Erro ao buscar afiliados:', error)
      return {
        response: error.response?.data || null,
        status: error.response?.status || 500,
      }
    }
  }

  /**
   * Buscar detalhes de um afiliado específico
   */
  public async getAffiliate(
    request: GetAffiliateRequest
  ): Promise<{ response: GetAffiliateResponse | null; status: number }> {
    try {
      const { id } = request

      const { data, status: statusCode } = await api<GetAffiliateResponse>({
        url: `/brands/affiliates/${id}`,
        method: 'GET',
      })

      return { response: data, status: statusCode }
    } catch (error: any) {
      console.error(`Erro ao buscar afiliado ${request.id}:`, error)
      return {
        response: error.response?.data || null,
        status: error.response?.status || 500,
      }
    }
  }

  /**
   * Criar novo afiliado
   */
  public async createAffiliate(
    request: CreateAffiliateRequest
  ): Promise<{ response: CreateAffiliateResponse | null; status: number }> {
    try {
      const { data, status: statusCode } = await api<CreateAffiliateResponse>({
        url: '/brands/affiliates',
        method: 'POST',
        data: request,
      })

      return { response: data, status: statusCode }
    } catch (error: any) {
      console.error('Erro ao criar afiliado:', error)
      return {
        response: error.response?.data || null,
        status: error.response?.status || 500,
      }
    }
  }

  /**
   * Atualizar afiliado existente
   */
  public async updateAffiliate(
    request: UpdateAffiliateRequest
  ): Promise<{ response: UpdateAffiliateResponse | null; status: number }> {
    try {
      const { id, ...body } = request

      const { data, status: statusCode } = await api<UpdateAffiliateResponse>({
        url: `/brands/affiliates/${id}`,
        method: 'PATCH',
        data: body,
        headers: { 'Content-Type': 'application/json' },
      })

      return { response: data, status: statusCode }
    } catch (error: any) {
      console.error(`Erro ao atualizar afiliado ${request.id}:`, error)
      return {
        response: error.response?.data || null,
        status: error.response?.status || 500,
      }
    }
  }

  /**
   * Buscar ranking de afiliados
   */
  public async getAffiliatesRank(
    request: GetAffiliatesRankRequest
  ): Promise<{ response: GetAffiliatesRankResponse | null; status: number }> {
    try {
      const { page = 1, perpage = 15, period, name, city } = request

      // Construir query params
      const params = new URLSearchParams({
        page: page.toString(),
        perpage: perpage.toString(),
      })

      if (period) params.append('period', period)
      if (name) params.append('name', name)
      if (city) params.append('city', city)

      const { data, status: statusCode } = await api<GetAffiliatesRankResponse>(
        {
          url: `/brands/affiliates/ranking?${params.toString()}`,
          method: 'GET',
        }
      )

      return { response: data, status: statusCode }
    } catch (error: any) {
      console.error('Erro ao buscar ranking de afiliados:', error)
      return {
        response: error.response?.data || null,
        status: error.response?.status || 500,
      }
    }
  }

  /**
   * Buscar afiliados mestres (para hierarquia)
   */
  public async getMasters(): Promise<{
    response: GetMastersResponse | null
    status: number
  }> {
    try {
      const { data, status: statusCode } = await api<GetMastersResponse>({
        url: '/brands/affiliates/masters',
        method: 'GET',
      })

      return { response: data, status: statusCode }
    } catch (error: any) {
      console.error('Erro ao buscar afiliados mestres:', error)
      return {
        response: error.response?.data || null,
        status: error.response?.status || 500,
      }
    }
  }
}

// Exportar instância única (singleton)
export const affiliatesService = new AffiliatesService()
