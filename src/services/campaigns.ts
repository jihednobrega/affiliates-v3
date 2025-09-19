import { api } from '@/utils/api'
import {
  GetCampaignsRequest,
  GetCampaignsResponse,
  GetCampaignByIdResponse,
  CampaignItem,
  CampaignForUI,
} from './types/campaigns.types'
import { ProductItem } from './types/products.types'
import { ProductsService } from './products'

class CampaignsService {
  private productsService: ProductsService

  constructor() {
    this.productsService = new ProductsService()
  }

  public async getCampaigns({ page, perpage, status }: GetCampaignsRequest) {
    const controller = new AbortController()
    const URL = `/campaigns`
    const params: Record<string, any> = {}

    if (page) params.page = page
    if (perpage) params.perpage = perpage
    if (status) params.status = status

    const { data: response, status: statusResponse } =
      await api<GetCampaignsResponse>({
        url: URL,
        method: 'GET',
        signal: controller.signal,
        params: Object.keys(params).length > 0 ? params : undefined,
      })

    return { response, status: statusResponse, controller }
  }

  public async getCampaignById(campaignId: number) {
    const controller = new AbortController()
    const URL = `/campaigns/${campaignId}`

    const { data: response, status: statusResponse } =
      await api<GetCampaignByIdResponse>({
        url: URL,
        method: 'GET',
        signal: controller.signal,
      })

    return { response, status: statusResponse, controller }
  }

  public async getActiveCampaigns({
    page = 1,
    perpage = 10,
  }: { page?: number; perpage?: number } = {}) {
    return this.getCampaigns({ page, perpage, status: 'active' })
  }

  public async getCampaignsByIds(campaignIds: number[]) {
    const controller = new AbortController()

    const promises = campaignIds.map((id) =>
      this.getCampaignById(id).catch((error) => ({
        response: null,
        status: 0,
        controller,
        error,
        campaignId: id,
      }))
    )

    const results = await Promise.all(promises)

    return results.filter((result) => result.response?.success)
  }

  // ===================================================================
  // CÓDIGO TEMPORÁRIO - REMOVER QUANDO API /campaigns INCLUIR:
  // - price e commission nos items[]
  // - Dados completos dos produtos diretamente na resposta
  // ===================================================================

  /**
   * Enriquece uma campanha com dados dos produtos
   */
  public async enrichCampaign(campaign: CampaignItem): Promise<CampaignForUI> {
    try {
      const productIds = campaign.items.map((item) => item.id)
      const productDetailsResults = await this.productsService.getProductsByIds(
        productIds
      )

      const productsMap = new Map<number, ProductItem>()

      productDetailsResults.forEach((result) => {
        if (result.response?.success && result.response.data) {
          productsMap.set(result.response.data.id, result.response.data)
        }
      })

      const campaignForUI = this.formatCampaign(campaign, productsMap)

      return campaignForUI
    } catch (error) {
      return this.formatCampaign(campaign, new Map())
    }
  }

  public async enrichCampaigns(
    campaigns: CampaignItem[]
  ): Promise<CampaignForUI[]> {
    try {
      const allProductIds = Array.from(
        new Set(
          campaigns.flatMap((campaign) => campaign.items.map((item) => item.id))
        )
      )

      const productDetailsResults = await this.productsService.getProductsByIds(
        allProductIds
      )

      const globalProductsMap = new Map<number, ProductItem>()

      productDetailsResults.forEach((result) => {
        if (result.response?.success && result.response.data) {
          globalProductsMap.set(result.response.data.id, result.response.data)
        }
      })

      const enrichedCampaigns = campaigns.map((campaign) =>
        this.formatCampaign(campaign, globalProductsMap)
      )

      return enrichedCampaigns
    } catch (error) {
      return campaigns.map((campaign) =>
        this.formatCampaign(campaign, new Map())
      )
    }
  }

  public async getProduct(productId: number): Promise<ProductItem | null> {
    try {
      const result = await this.productsService.getProductById(productId)

      if (result.response?.success && result.response.data) {
        return result.response.data
      }

      return null
    } catch (error) {
      return null
    }
  }

  // ===================================================================
  // FIM DO CÓDIGO TEMPORÁRIO
  // ===================================================================

  private formatCampaign(
    campaign: CampaignItem,
    productsMap: Map<number, ProductItem>
  ): CampaignForUI {
    const formatDate = (dateStr: string): string => {
      try {
        const [year, month, day] = dateStr.split('-')
        return `${day}/${month}/${year}`
      } catch {
        return dateStr
      }
    }

    const enrichedProducts = campaign.items.map((item) => {
      const productDetail = productsMap.get(item.id)

      let validPrice = 0
      if (productDetail?.price !== undefined && productDetail?.price !== null) {
        const parsedPrice =
          typeof productDetail.price === 'string'
            ? parseFloat(productDetail.price)
            : productDetail.price
        validPrice =
          !isNaN(parsedPrice) && isFinite(parsedPrice) && parsedPrice >= 0
            ? parsedPrice
            : 0
      }

      let validCommission = 0
      if (
        productDetail?.commission !== undefined &&
        productDetail?.commission !== null
      ) {
        const parsedCommission =
          typeof productDetail.commission === 'string'
            ? parseFloat(productDetail.commission)
            : productDetail.commission
        validCommission =
          !isNaN(parsedCommission) &&
          isFinite(parsedCommission) &&
          parsedCommission >= 0
            ? parsedCommission
            : 0
      }

      return {
        id: item.id,
        name: item.name || 'Produto sem nome',
        image: item.image || '',
        price: validPrice,
        commissionPercentage: validCommission,
        link: item.link || '',
      }
    })

    const maxCommissionFromProducts =
      enrichedProducts.length > 0
        ? Math.max(
            ...enrichedProducts.map((product) => product.commissionPercentage)
          )
        : 0

    return {
      id: campaign.id,
      title: campaign.name,
      description: campaign.description,
      periodStart: formatDate(campaign.start_date),
      periodEnd: formatDate(campaign.end_date),
      imageUrl: campaign.banner,
      status: 'active',
      maxCommission: maxCommissionFromProducts,
      products: enrichedProducts,
      creatives: [],
    }
  }

  public validateCampaign(campaign: CampaignItem): boolean {
    if (!campaign.items || campaign.items.length === 0) {
      return false
    }

    const validItems = campaign.items.filter(
      (item) => item.id && item.name && item.image
    )

    return validItems.length > 0
  }
}

export { CampaignsService }
