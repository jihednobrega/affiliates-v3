import { api } from '@/utils/api'
import {
  GetAffiliateFinancesRequest,
  GetAffiliateFinancesResponse,
  GetAffiliateExtractRequest,
  GetExtractResponse,
  GetWithdrawalInfoResponse,
  GetSimplifiedWithdrawalInfoResponse,
  PostWithdrawalResponse,
} from './types/finances.types'

class FinancesService {
  public async getAffiliateFinances({
    page,
    perPage,
    listOnly,
    product,
    status,
  }: GetAffiliateFinancesRequest) {
    const controller = new AbortController()
    const URL = `/affiliates/finances?page=${page}&perpage=${perPage}`

    const { data: response, status: statusResponse } =
      await api<GetAffiliateFinancesResponse>({
        url: URL,
        method: 'GET',
        params: {
          product,
          status,
          listOnly,
        },
        signal: controller.signal,
      })

    return { response, status: statusResponse, controller }
  }

  public async getAffiliateExtract({
    month,
    exportFile,
    withdrawal,
    page = 1,
    perpage = 10,
  }: GetAffiliateExtractRequest = {}): Promise<{
    response: GetExtractResponse | Blob
    status: number
    controller: AbortController
  }> {
    const controller = new AbortController()

    const params: Record<string, any> = { page, perpage }

    if (month) {
      params.month = month
    }

    if (exportFile) {
      params.export = true
    }

    if (withdrawal) {
      params.withdrawal = true
    }

    const { data: response, status } = await api<GetExtractResponse | Blob>({
      url: `/affiliates/finances/extract`,
      method: 'GET',
      params,
      signal: controller.signal,
      responseType: exportFile ? 'blob' : 'json',
    })

    return { response, status, controller }
  }

  public static async getAffiliateFinancesExport({
    period,
    fields,
    product,
    status,
  }: {
    period?: string
    fields?: string
    product?: string
    status?: string
  } = {}) {
    const controller = new AbortController()
    const URL = `/affiliates/finances/export`

    try {
      const { data, status: responseStatus } = await api({
        url: URL,
        method: 'GET',
        signal: controller.signal,
        responseType: 'blob',
        params: {
          period: period || undefined,
          fields: fields || undefined,
          product: product || undefined,
          status: status || undefined,
        },
      })

      return { response: data, status: responseStatus }
    } catch (error) {
      console.error('Erro na requisição de export:', error)
      throw error
    }
  }

  public async getWithdrawalInfo(): Promise<{
    response: GetWithdrawalInfoResponse
    status: number
    controller: AbortController
  }> {
    const controller = new AbortController()
    const URL = `/affiliates/finances/withdraw`

    try {
      const { data: response, status } = await api<GetWithdrawalInfoResponse>({
        url: URL,
        method: 'GET',
        signal: controller.signal,
      })

      return { response, status, controller }
    } catch (error: any) {
      if (error.response && error.response.status) {
        return {
          response: error.response.data,
          status: error.response.status,
          controller,
        }
      }

      throw error
    }
  }

  public async getSimplifiedWithdrawalInfo(): Promise<{
    response: GetSimplifiedWithdrawalInfoResponse
    status: number
    controller: AbortController
  }> {
    const controller = new AbortController()
    const URL = `/affiliates/finances/withdraw`

    const { data: response, status } =
      await api<GetSimplifiedWithdrawalInfoResponse>({
        url: URL,
        method: 'GET',
        signal: controller.signal,
      })

    return { response, status, controller }
  }

  public async postWithdrawal(amount: string | number): Promise<{
    response: PostWithdrawalResponse
    status: number
    controller: AbortController
  }> {
    const controller = new AbortController()
    const URL = `/affiliates/finances/withdraw`

    const { data: response, status } = await api<PostWithdrawalResponse>({
      url: URL,
      method: 'POST',
      data: { amount },
      signal: controller.signal,
    })

    return { response, status, controller }
  }
}

export { FinancesService }
