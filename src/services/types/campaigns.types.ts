import { DefaultResponse, ErrorResponse } from './default.types'

export interface GetCampaignsRequest {
  page?: number
  perpage?: number
  status?: 'active' | 'inactive' | 'ended'
  name?: string
}

export interface GetCampaignByIdRequest {
  id: number
}

export interface GetCampaignsResponse extends DefaultResponse, ErrorResponse {
  data: CampaignsData
}

export interface GetCampaignByIdResponse
  extends DefaultResponse,
    ErrorResponse {
  data: CampaignItem
}

export interface CampaignsData {
  list: CampaignItem[]
  meta: CampaignMeta
}

export interface CampaignItem {
  id: number
  name: string
  description: string
  banner: string
  commission: string
  start_date: string
  end_date: string
  created_at: string
  items: CampaignProduct[]
}

export interface CampaignProduct {
  id: number
  name: string
  image: string
  category: string
  sku: string
  link: string
}

export interface CampaignCreative {
  id: number
  type: 'image' | 'video' | 'banner' | 'gif'
  title: string
  url: string
  thumbnail?: string
  dimensions?: {
    width: number
    height: number
  }
  format?: string
  size?: number
}

export interface CampaignMeta {
  current_page: number
  last_page: number
  total_items: number
  pagesize: number
  total_active?: number
  total_inactive?: number
  total_ended?: number
}

export interface CampaignsFilters {
  page: number
  perpage: number
  status?: 'active' | 'inactive' | 'ended'
  category?: string
  search?: string
  date_start?: string
  date_end?: string
}

export interface CampaignForUI {
  id: number
  title: string
  description: string
  periodStart: string
  periodEnd: string
  imageUrl: string
  status?: string
  products: {
    id: number
    name: string
    image: string
    price: number
    commissionPercentage: number
    link: string
  }[]
  creatives?: {
    id: number
    type: string
    title: string
    url: string
    thumbnail?: string
  }[]
  commission?: string | number
}

export const transformCampaignApiToUI = (
  apiCampaign: CampaignItem
): CampaignForUI => {
  const commissionNumber = parseFloat(apiCampaign.commission)

  const formatDate = (dateStr: string): string => {
    try {
      const [year, month, day] = dateStr.split('-')
      return `${day}/${month}/${year}`
    } catch {
      return dateStr
    }
  }

  return {
    id: apiCampaign.id,
    title: apiCampaign.name,
    description: apiCampaign.description,
    periodStart: formatDate(apiCampaign.start_date),
    periodEnd: formatDate(apiCampaign.end_date),
    imageUrl: apiCampaign.banner,
    status: 'active',
    commission: commissionNumber,

    products: apiCampaign.items.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      price: 0,
      commissionPercentage: commissionNumber,
      link: item.link || '',
    })),

    creatives: [],
  }
}

export const transformCampaignsApiToUI = (
  apiCampaigns: CampaignItem[]
): CampaignForUI[] => {
  return apiCampaigns.map(transformCampaignApiToUI)
}

export interface CreateCampaignRequest {
  name: string
  description?: string
  banner?: string
  commission: string
  start_date: string
  end_date: string
  items: CampaignItemInput[]
}

export interface CreateCampaignResponse extends DefaultResponse, ErrorResponse {
  data: {
    id: number
    name: string
    description: string
    banner: string
    commission: string
    start_date: string
    end_date: string
    brand_id: number
    updated_at: string
    created_at: string
  }
}

export interface UpdateCampaignRequest extends CreateCampaignRequest {
  id: number
}

export interface UpdateCampaignResponse extends DefaultResponse, ErrorResponse {
  data: CreateCampaignResponse['data']
}

export interface RemoveCampaignRequest {
  id: number
}

export interface RemoveCampaignResponse extends DefaultResponse, ErrorResponse {
  data: null
}

export interface CampaignItemInput {
  id: string
  type: 'product' | 'category'
}
