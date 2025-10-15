import { api } from '@/utils/api'
import {
  GetProductsRequest,
  GetProductsResponse,
  GetProductByIdResponse,
} from './types/products.types'

class ProductsService {
  public async getProducts({
    page,
    perpage,
    product,
    featured,
    orderBy,
  }: GetProductsRequest) {
    const controller = new AbortController()

    const URL = `/products`
    const params: Record<string, any> = {}

    if (page) params.page = page
    if (perpage) params.perpage = perpage
    if (product) params.product = product
    if (featured) params.featured = featured
    if (orderBy) params.orderBy = orderBy

    console.log('🔍 Fazendo requisição para /products com parâmetros:', params)

    try {
      const { data: response, status: statusResponse } =
        await api<GetProductsResponse>({
          url: URL,
          method: 'GET',
          signal: controller.signal,
          timeout: 45000,
          params: Object.keys(params).length > 0 ? params : undefined,
        })

      console.log('✅ Resposta /products:', {
        status: statusResponse,
        hasData: !!response,
      })
      return { response, status: statusResponse, controller }
    } catch (error) {
      console.error('❌ Erro na requisição /products:', error)
      throw error
    }
  }

  public async getProductById(productId: number) {
    const controller = new AbortController()
    const URL = `/products/${productId}`

    const { data: response, status: statusResponse } =
      await api<GetProductByIdResponse>({
        url: URL,
        method: 'GET',
        signal: controller.signal,
        timeout: 30000, // 30 segundos para produto específico
      })

    return { response, status: statusResponse, controller }
  }

  public async getProductsByIds(productIds: number[]) {
    const controller = new AbortController()

    const promises = productIds.map((id) =>
      this.getProductById(id).catch((error) => ({
        response: null,
        status: 0,
        controller,
        error,
        productId: id,
      }))
    )

    const results = await Promise.all(promises)

    return results.filter((result) => result.response?.success)
  }
}

export { ProductsService }
