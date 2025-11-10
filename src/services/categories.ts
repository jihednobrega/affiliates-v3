import { api } from '@/utils/api'
import {
  GetCategoryRequest,
  GetCategoryResponse,
  GetCategoriesResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
  GetCategoriesRequest,
} from './types/categories.types'

class CategoriesService {
  /**
   * Busca lista de categorias
   * @param name - Filtro opcional por nome da categoria
   */
  public async getCategories({ name }: GetCategoriesRequest) {
    const controller = new AbortController()

    const nameParam = name ? `?name=${name}` : ''
    const URL = `/brands/categories${nameParam}`

    console.log('🔍 Buscando categorias:', { name, url: URL })

    try {
      const { data: response, status } = await api<GetCategoriesResponse>({
        url: URL,
        method: 'GET',
        signal: controller.signal,
        timeout: 30000,
      })

      console.log('✅ Categorias encontradas:', response?.data?.length || 0)
      return { response, status, controller }
    } catch (error) {
      console.error('❌ Erro ao buscar categorias:', error)
      throw error
    }
  }

  /**
   * Busca categoria(s) específica(s) por ID
   * @param id - ID único da categoria
   * @param ids - Array de IDs de categorias (busca múltipla)
   */
  public async getCategory({ id, ids }: GetCategoryRequest) {
    const controller = new AbortController()

    // Busca múltiplas categorias
    if (ids) {
      console.log('🔍 Buscando múltiplas categorias:', ids)

      const URLs = ids.map((id) => `/brands/categories/${id}`)

      try {
        const responses = await Promise.all(
          URLs.map((url) =>
            api<GetCategoryResponse>({
              url: url,
              method: 'GET',
              signal: controller.signal,
              timeout: 30000,
            })
          )
        )

        const data = responses.map(({ data: response, status }) => ({
          response,
          status,
          controller,
        }))

        console.log('✅ Múltiplas categorias encontradas:', data.length)
        return data
      } catch (error) {
        console.error('❌ Erro ao buscar múltiplas categorias:', error)
        throw error
      }
    }

    // Busca categoria única
    console.log('🔍 Buscando categoria por ID:', id)
    const URL = `/brands/categories/${id}`

    try {
      const { data: response, status } = await api<GetCategoryResponse>({
        url: URL,
        method: 'GET',
        signal: controller.signal,
        timeout: 30000,
      })

      console.log('✅ Categoria encontrada:', response?.data?.name)
      return { response, status, controller }
    } catch (error) {
      console.error('❌ Erro ao buscar categoria:', error)
      throw error
    }
  }

  /**
   * Atualiza categoria (comissão e propagação)
   * @param id - ID da categoria
   * @param percentage - Porcentagem de comissão
   * @param propagate_to_category_tree - Propagar para subcategorias
   * @param propagate_to_products - Propagar para produtos da categoria
   */
  public async updateCategory({
    id,
    percentage,
    propagate_to_category_tree,
    propagate_to_products,
  }: UpdateCategoryRequest) {
    const controller = new AbortController()
    const URL = `/brands/categories/${id}`

    console.log('🔄 Atualizando categoria:', {
      id,
      percentage,
      propagate_to_category_tree,
      propagate_to_products,
    })

    try {
      const { data: response, status } = await api<UpdateCategoryResponse>({
        url: URL,
        method: 'PATCH',
        data: {
          percentage,
          propagate_to_category_tree,
          propagate_to_products,
        },
        signal: controller.signal,
        timeout: 30000,
      })

      console.log('✅ Categoria atualizada com sucesso')
      return { response, status, controller }
    } catch (error) {
      console.error('❌ Erro ao atualizar categoria:', error)
      throw error
    }
  }
}

export { CategoriesService }
