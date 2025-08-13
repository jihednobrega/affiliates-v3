import { DefaultResponse, ErrorResponse } from './default.types'

export interface GetDashboardResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface AffiliateDashboardData {
  commissions: Commissions
  training: Training
  statistics: AffiliateDashboardStatistics
}

interface AffiliateDashboardStatistics {
  new_orders: number
  orders_in_progress: number
  orders_completed: number
  orders_canceled: number
}

export interface GetMainMetricsRequest {
  /**
   * Format: `Y-m-d:Y-m-d`
   */
  interval: string
  /**
   * Format: `Y-m-d:Y-m-d`
   */
  previous: string
}

export interface GetMainMetricsResponse extends DefaultResponse, ErrorResponse {
  data: {
    period: string
    clicks: PeriodData
    orders: PeriodData
    sales: PeriodData
    estimated_commissions: PeriodData
    approved_commissions: PeriodData
  }
}

export interface GetOrderEvolutionResponse
  extends DefaultResponse,
    ErrorResponse {
  data: {
    pending: number
    approved: number
    processing: number
    invoiced: number
    canceled: number
  }
}

export interface GetMonthlyMetricsResponse
  extends DefaultResponse,
    ErrorResponse {
  data: MonthlyMetric[]
}

export interface MonthlyMetric {
  month: string
  month_name: string
  clicks: number
  orders: number
}

type PeriodData = {
  current_period: number
  previous_period: number
}

interface Commissions {
  total_commissions: number
  sales_number: number
  to_receive: number
}

interface Training {
  id: number
  brand_id: number
  brand_name: string
  name: string
  description: string
  content_url: string
  category: string
  average_rating: string
  position: number
  created_at: string
  progress: string
  views_count: number
}

export interface HeaderResult {
  response: {
    data: {
      brand: {
        vendor: string
      }
    }
  }
  status: number
  controller: AbortController
  vendor: string
}

export interface BransDashboardData {
  interval: string
  brand_periods: Record<string, string>
  summary: Summary
  statistics: BransDashboardStatistics
  vendor: string
  brand: any[]
}
interface BransDashboardStatistics {
  orders_in_progress: number
  orders_completed: number
  orders_canceled: number
}
interface Salesvsearnings {
  sales: number
  earnings: number
  chart: any[]
}
interface Summary {
  total_sales: number
  orders_count: number
  products_sold: number
  new_affiliates: number
}

export type ProductType = {
  id: number
  brand_id: number
  vendor_id: string
  name: string
  category: string
  image: string
  url: string
  sku: string
  price: number
  commission: number
  short_url: string | null
  utm_url: string | null
}

export type ProductResponse = {
  success: boolean
  message: string
  data: {
    list: ProductType[]
    meta: {
      current_page: number
      last_page: number
      total_items: number
      pagesize: number
    }
  }
}

export type ProductCard = {
  url: string
  utm_url: string
  short_url: string
  id: number
  name: string
  price: string
  commission: string
  image: string
}

export type RankingProduct = {
  id: number
  name: string
  image: string
  price: number
  commission: number
  url?: string | null
  short_url?: string | null

  sales?: number
  clicks?: number
  revenue?: number

  commissionValue?: number
  totalCommissions?: number

  totalCommissionEarned?: number
  totalCommissionEarnedFormatted?: string
  averageCommissionPerOrder?: number
  uniqueCustomersCount?: number
  averageOrderValue?: number
  averageOrderValueFormatted?: string
  performanceScore?: number
  conversionRate?: number
  isPopular?: boolean
  isHighValue?: boolean
  hasRecurrency?: boolean
  hasRealData?: boolean
  matchedCommissions?: number
  productKey?: string
  relatedCommissions?: any[]
}

export interface ProcessedMetric {
  label: string
  value: number | string
  displayText: string
  growth: number
  trend: 'up' | 'down' | 'neutral'
  info: string
}

export interface MainMetricsData {
  clicks: PeriodData
  orders: PeriodData
  sales: PeriodData
  estimated_commissions: PeriodData
  approved_commissions: PeriodData
}
