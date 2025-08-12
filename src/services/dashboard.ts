import { api } from '@/utils/api'
import {
  AffiliateDashboardData,
  GetMainMetricsRequest,
  GetMainMetricsResponse,
  GetDashboardResponse,
  GetOrderEvolutionResponse,
  ProductResponse,
} from './types/dashboard.types'

export class DashboardService {
  public async getAffiliatesDashboard() {
    const controller = new AbortController()
    const URL = `/affiliates/dashboard`
    const { data: response, status } = await api<
      GetDashboardResponse<AffiliateDashboardData>
    >({
      url: URL,
      method: 'GET',
      signal: controller.signal,
    })

    return { response, status, controller }
  }

  public async getMainMetrics(params: GetMainMetricsRequest) {
    const controller = new AbortController()
    const URL = `/affiliates/dashboard/main-metrics`

    const { data: response, status } = await api<GetMainMetricsResponse>({
      url: URL,
      method: 'GET',
      signal: controller.signal,
      params: {
        interval: params.interval,
        previous: params.previous,
      },
    })

    return { response, status, controller }
  }

  public async getOrdersEvolution() {
    const controller = new AbortController()
    const URL = `/affiliates/dashboard/orders-evolution`

    const { data: response, status } = await api<GetOrderEvolutionResponse>({
      url: URL,
      method: 'GET',
      signal: controller.signal,
    })

    return { response, status, controller }
  }

  public async getMonthlyMetrics() {
    const controller = new AbortController()
    const now = new Date()
    const monthlyData = []

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth()

      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      const startDate = firstDay.toISOString().split('T')[0]
      const endDate = lastDay.toISOString().split('T')[0]
      const interval = `${startDate}:${endDate}`

      const { data: response } = await api<GetMainMetricsResponse>({
        url: '/affiliates/dashboard/main-metrics',
        method: 'GET',
        signal: controller.signal,
        params: {
          interval: interval,
          previous: interval,
        },
      })

      if (response?.data) {
        monthlyData.push({
          month: `${year}-${String(month + 1).padStart(2, '0')}`,
          monthName: date.toLocaleDateString('pt-BR', { month: 'long' }),
          clicks: response.data.clicks?.current_period || 0,
          orders: response.data.orders?.current_period || 0,
          date: startDate,
        })
      }
    }

    return {
      response: { data: monthlyData },
      status: 200,
      controller,
    }
  }

  public async getProducts() {
    const controller = new AbortController()
    const URL = '/products'

    const { data: response, status } = await api<ProductResponse>({
      url: URL,
      method: 'GET',
      signal: controller.signal,
    })

    return { response, status, controller }
  }
}
