import { api } from '@/utils/api'
import {
  GetAccountantBillingsRequest,
  GetAccountantBillingsResponse,
  CreateBillingRequest,
  CreateBillingResponse,
  UpdateBillingStatusResponse,
  CreateInvoiceRequest,
  CreateInvoiceResponse,
} from './types/accountant-billing.types'

class AccountantBillingService {
  /**
   * Busca faturas e resumos financeiros do contador
   */
  public async getBillings({
    page = 1,
    perpage = 10,
    brand_id,
    month,
    period,
  }: GetAccountantBillingsRequest = {}) {
    const controller = new AbortController()

    const params: Record<string, any> = { page, perpage }

    if (brand_id) {
      params.brand_id = brand_id
    }

    if (month) {
      params.month = month
    }

    if (period) {
      params.period = period
    }

    const { data: response, status } = await api<GetAccountantBillingsResponse>(
      {
        url: '/accountant/billings',
        method: 'GET',
        params,
        signal: controller.signal,
      }
    )

    return { response, status, controller }
  }

  /**
   * Cria uma nova fatura (mensalidade, take rate, etc.)
   */
  public async createBilling(data: CreateBillingRequest) {
    const controller = new AbortController()

    const { data: response, status } = await api<CreateBillingResponse>({
      url: '/accountant/billings',
      method: 'POST',
      data,
      signal: controller.signal,
    })

    return { response, status, controller }
  }

  /**
   * Atualiza o status de uma fatura (confirmar pagamento)
   */
  public async updateBillingStatus(id: number, statusValue: 'payed') {
    const controller = new AbortController()

    const { data: response, status } = await api<UpdateBillingStatusResponse>({
      url: `/accountant/billings/${id}`,
      method: 'PATCH',
      data: { status: statusValue },
      signal: controller.signal,
    })

    return { response, status, controller }
  }

  /**
   * Cria uma fatura para um período específico
   */
  public async createInvoice(data: CreateInvoiceRequest) {
    const controller = new AbortController()

    const { data: response, status } = await api<CreateInvoiceResponse>({
      url: '/accountant/invoices',
      method: 'POST',
      data,
      signal: controller.signal,
    })

    return { response, status, controller }
  }
}

export { AccountantBillingService }
