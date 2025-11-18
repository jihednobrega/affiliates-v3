import { api } from '@/utils/api'
import {
  GetWithdrawRequestsRequest,
  GetWithdrawRequestsResponse,
  UpdateWithdrawStatusResponse,
} from './types/accountant-withdraw.types'

class AccountantWithdrawService {
  /**
   * Busca solicitações de saque de afiliados
   */
  public async getWithdrawRequests({
    page = 1,
    perpage = 10,
    brand_id,
  }: GetWithdrawRequestsRequest = {}) {
    const controller = new AbortController()

    const params: Record<string, any> = { page, perpage }

    if (brand_id) {
      params.brand_id = brand_id
    }

    const { data: response, status } = await api<GetWithdrawRequestsResponse>({
      url: '/accountant/withdraw_requests',
      method: 'GET',
      params,
      signal: controller.signal,
    })

    return { response, status, controller }
  }

  /**
   * Atualiza o status de uma solicitação de saque (aprovar ou recusar)
   */
  public async updateWithdrawStatus(
    id: number,
    statusValue: 'done' | 'refused'
  ) {
    const controller = new AbortController()

    const { data: response, status } = await api<UpdateWithdrawStatusResponse>({
      url: `/accountant/withdraw_requests/${id}`,
      method: 'PATCH',
      data: { status: statusValue },
      signal: controller.signal,
    })

    return { response, status, controller }
  }
}

export { AccountantWithdrawService }
