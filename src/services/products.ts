import { api } from '@/utils/api'
import {
  GetProductsRequest,
  GetProductsResponse,
  GetProductByIdResponse,
} from './types/products.types'

class ProductsService {
  public async getProducts({ page, perpage }: GetProductsRequest) {
    const controller = new AbortController()

    const URL = `/products`
    const params: Record<string, any> = {}

    if (page) params.page = page
    if (perpage) params.perpage = perpage

    try {
      const { data: response, status: statusResponse } =
        await api<GetProductsResponse>({
          url: URL,
          method: 'GET',
          signal: controller.signal,
          params: Object.keys(params).length > 0 ? params : undefined,
        })

      return { response, status: statusResponse, controller }
    } catch (error) {
      console.error('❌ Erro na requisição /products:', error)
      throw error
    }
  }

  /**
   * Busca produto específico por ID
   */
  public async getProductById(productId: number) {
    const controller = new AbortController()
    const URL = `/products/${productId}`

    const { data: response, status: statusResponse } =
      await api<GetProductByIdResponse>({
        url: URL,
        method: 'GET',
        signal: controller.signal,
      })

    return { response, status: statusResponse, controller }
  }

  /**
   * Busca múltiplos produtos por IDs
   */
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
