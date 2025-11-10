import { api } from '@/utils/api'
import {
  GetProductsRequest,
  GetProductsResponse,
  GetProductByIdResponse,
  UpdateProductRequest,
  UpdateProductResponse,
} from './types/products.types'

class ProductsService {
  /**
   * Busca lista de produtos
   */
  public async getProducts({
    page,
    perpage,
    product,
    featured,
    orderBy,
  }: GetProductsRequest) {
    const controller = new AbortController()

    // Tentar primeiro sem parâmetros, como no dashboard
    const URL = `/products`
    const params: Record<string, any> = {}

    // Só adicionar parâmetros se especificados
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
          timeout: 45000, // 45 segundos específico para produtos
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
        timeout: 30000, // 30 segundos para produto específico
      })

    return { response, status: statusResponse, controller }
  }

  /**
   * Busca múltiplos produtos por IDs
   */
  public async getProductsByIds(productIds: number[]) {
    const controller = new AbortController()

    // Fazer requisições em paralelo para cada ID
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

  /**
   * Atualiza um produto (comissão, URL, destaque)
   */
  public async updateProduct({
    id,
    commission,
    url,
    featured,
  }: UpdateProductRequest) {
    const controller = new AbortController()
    const URL = `/products/${id}`

    const body: Record<string, any> = {}
    if (commission !== undefined) body.commission = commission
    if (url !== undefined) body.url = url
    if (featured !== undefined) body.featured = featured

    console.log('🔄 Atualizando produto:', { id, body })

    try {
      const { data: response, status: statusResponse } =
        await api<UpdateProductResponse>({
          url: URL,
          method: 'PATCH',
          signal: controller.signal,
          timeout: 30000,
          data: body,
        })

      console.log('✅ Produto atualizado:', {
        status: statusResponse,
        hasData: !!response,
      })
      return { response, status: statusResponse, controller }
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error)
      throw error
    }
  }
}

export { ProductsService }
