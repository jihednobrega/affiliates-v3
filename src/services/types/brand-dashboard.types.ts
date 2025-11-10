export interface GetBrandDashboardRequest {
  interval?: string
}

export interface BrandDashboardSummary {
  total_sales: number
  commissions: number
  orders_count: number
  products_sold: number
  new_affiliates: number
  new_links: number
  link_views: number
  active_affiliates: number
}

export interface BrandDashboardStatistics {
  new_orders: number
  orders_awaiting: number
  orders_approved: number
  orders_in_progress: number
  orders_completed: number
  orders_canceled: number
}

export interface ChartDataset {
  label: string
  data: number[]
}

export interface BrandDashboardCharts {
  links: {
    labels: string[]
    datasets: ChartDataset[]
  }
}

export interface GetBrandDashboardResponse {
  success: boolean
  message: string
  data: {
    interval: string
    summary: BrandDashboardSummary
    statistics: BrandDashboardStatistics
    charts: BrandDashboardCharts
  }
}
