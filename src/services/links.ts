import { api } from '@/utils/api'
import {
  GetAffiliateLinksRequest,
  GetAffiliateLinksResponse,
} from './types/links.types'

class LinksService {
  public async getAffiliateLinks({
    page,
    perpage,
    product,
  }: GetAffiliateLinksRequest) {
    const controller = new AbortController()

    const params = new URLSearchParams({
      page: page.toString(),
      perpage: perpage.toString(),
    })

    if (product) {
      params.append('product', product)
    }

    const URL = `/affiliates/links?${params.toString()}`

    const { data: response, status: statusResponse } =
      await api<GetAffiliateLinksResponse>({
        url: URL,
        method: 'GET',
        signal: controller.signal,
      })

    return { response, status: statusResponse, controller }
  }

  /**
   * Busca estatísticas resumidas dos links do afiliado
   */
  public async getAffiliateLinksStats() {
    const controller = new AbortController()
    const URL = `/affiliates/links`

    const { data: response, status: statusResponse } = await api<{
      success: boolean
      message: string
      data: {
        total_links: number
        active_links: number
        total_clicks: number
        total_conversions: number
        total_revenue: number
        conversion_rate: number
      }
    }>({
      url: URL,
      method: 'GET',
      signal: controller.signal,
    })

    return { response, status: statusResponse, controller }
  }

  /**
   * Busca um link específico do afiliado por ID
   */
  public async getAffiliateLinkById(linkId: number) {
    const controller = new AbortController()
    const URL = `/affiliates/links/${linkId}`

    const { data: response, status: statusResponse } = await api<{
      success: boolean
      message: string
      data: any
    }>({
      url: URL,
      method: 'GET',
      signal: controller.signal,
    })

    return { response, status: statusResponse, controller }
  }

  /**
   * Verifica se já existe um link para um produto específico
   */
  public async checkExistingLinkByProductId(productId: number) {
    const controller = new AbortController()

    try {
      const { response } = await this.getAffiliateLinks({
        page: 1,
        perpage: 100,
      })

      if (response?.success && response.data?.list) {
        const existingLink = response.data.list.find(
          (link: any) => link.product_id === productId && !link.deleted_at
        )
        return { link: existingLink || null, controller }
      }

      return { link: null, controller }
    } catch (error) {
      console.error('Erro ao verificar link existente:', error)
      return { link: null, controller }
    }
  }

  /**
   * Cria um novo link de afiliado para um produto
   */
  public async createAffiliateLink(productId: number) {
    const controller = new AbortController()
    const URL = `/affiliates/links`

    const { data: response, status: statusResponse } = await api<{
      success: boolean
      message: string
      data: any
    }>({
      url: URL,
      method: 'POST',
      data: {
        product_id: productId,
      },
      signal: controller.signal,
    })

    return { response, status: statusResponse, controller }
  }

  /**
   * Exporta relatório de links do afiliado
   */
  public static async getAffiliateLinksExport({
    status,
    dateRange,
  }: {
    status?: string
    dateRange?: string
  } = {}) {
    const controller = new AbortController()
    const URL = `/affiliates/links/export`

    try {
      const { data, status: responseStatus } = await api({
        url: URL,
        method: 'GET',
        signal: controller.signal,
        params: {
          status: status || undefined,
          date_range: dateRange || undefined,
        },
        responseType: 'blob',
      })

      return { response: data, status: responseStatus }
    } catch (error) {
      console.error('Erro na requisição de export de links:', error)
      throw error
    }
  }
}

export { LinksService }
