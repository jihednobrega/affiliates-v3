import { DefaultResponse, ErrorResponse } from './default.types'

export interface GetCategoriesRequest {
  name?: string
}

export interface GetCategoriesResponse extends DefaultResponse, ErrorResponse {
  data: Category[]
}

export type GetCategoryRequest =
  | { id: string; ids?: never }
  | { ids: string[]; id?: never }

export interface GetCategoryResponse extends DefaultResponse, ErrorResponse {
  data: Category
}

export interface UpdateCategoryRequest {
  id: string
  percentage: string
  propagate_to_category_tree: boolean
  propagate_to_products: boolean
}

export interface UpdateCategoryResponse extends DefaultResponse, ErrorResponse {
  data: Category
}

export interface Category {
  id: number
  name: string
  percentage: string | null
  propagate_to_category_tree: boolean
  propagate_to_products: boolean
}
