import { api } from '@/utils/api'
import {
  GetDigitalAccountsRequest,
  GetDigitalAccountsResponse,
  UpdateDigitalAccountStatusResponse,
} from './types/accountant-digital-account.types'

class AccountantDigitalAccountService {
  /**
   * Busca contas digitais de afiliados para verificação
   */
  public async getDigitalAccounts({
    page = 1,
    per_page = 10,
    brand_id,
    status,
  }: GetDigitalAccountsRequest = {}) {
    const controller = new AbortController()

    const params: Record<string, any> = { page, per_page }

    if (brand_id) {
      params.brand_id = brand_id
    }

    if (status) {
      params.status = status
    }

    const { data: response, status: responseStatus } =
      await api<GetDigitalAccountsResponse>({
        url: '/accountant/digital-account',
        method: 'GET',
        params,
        signal: controller.signal,
      })

    return { response, status: responseStatus, controller }
  }

  /**
   * Atualiza o status de uma conta digital (aprovar ou recusar)
   */
  public async updateAccountStatus(
    id: number,
    statusValue: 'verified' | 'rejected'
  ) {
    const controller = new AbortController()

    const { data: response, status } =
      await api<UpdateDigitalAccountStatusResponse>({
        url: `/accountant/digital-account/${id}`,
        method: 'PATCH',
        data: { status: statusValue },
        signal: controller.signal,
      })

    return { response, status, controller }
  }
}

export { AccountantDigitalAccountService }
