import { api } from '@/utils/api'
import {
  GetCouponsRequest,
  GetCouponsResponse,
  CreateCouponRequest,
  CreateCouponResponse,
  UpdateCouponRequest,
  UpdateCouponResponse,
  DeleteCouponRequest,
  DeleteCouponResponse,
} from './types/coupons.types'

class CouponsService {
  /**
   * Busca lista de cupons da marca
   */
  public async getCoupons({
    page = 1,
    perpage = 15,
    coupon,
    affiliate,
  }: GetCouponsRequest = {}) {
    const controller = new AbortController()
    const URL = `/brands/coupons`
    const params: Record<string, any> = { page, perpage }

    if (coupon) params.coupon = coupon
    if (affiliate) params.affiliate = affiliate

    const { data: response, status: statusResponse } =
      await api<GetCouponsResponse>({
        url: URL,
        method: 'GET',
        signal: controller.signal,
        params,
      })

    return { response, status: statusResponse, controller }
  }

  /**
   * Cria um novo cupom
   */
  public async createCoupon({ user_id, coupon }: CreateCouponRequest) {
    const controller = new AbortController()
    const URL = `/brands/coupons`

    const { data: response, status: statusResponse } =
      await api<CreateCouponResponse>({
        url: URL,
        method: 'POST',
        signal: controller.signal,
        timeout: 30000,
        data: {
          user_id,
          coupon: coupon.toUpperCase().trim(),
        },
      })

    return { response, status: statusResponse, controller }
  }

  /**
   * Atualiza um cupom existente
   */
  public async updateCoupon({
    id,
    user_id,
    coupon,
    status,
  }: UpdateCouponRequest) {
    const controller = new AbortController()
    const URL = `/brands/coupons/${id}`

    const body: Record<string, any> = {}
    if (user_id !== undefined) body.user_id = user_id
    if (coupon !== undefined) body.coupon = coupon.toUpperCase().trim()
    if (status !== undefined) body.status = status

    const { data: response, status: statusResponse } =
      await api<UpdateCouponResponse>({
        url: URL,
        method: 'PATCH',
        signal: controller.signal,
        timeout: 30000,
        data: body,
      })

    return { response, status: statusResponse, controller }
  }

  /**
   * Deleta um cupom
   */
  public async deleteCoupon({ id }: DeleteCouponRequest) {
    const controller = new AbortController()
    const URL = `/brands/coupons/${id}`

    const { data: response, status: statusResponse } =
      await api<DeleteCouponResponse>({
        url: URL,
        method: 'DELETE',
        signal: controller.signal,
        timeout: 30000,
      })

    return { response, status: statusResponse, controller }
  }
}

export { CouponsService }
