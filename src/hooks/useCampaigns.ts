import { useState, useEffect, useCallback, useMemo } from 'react'
import { CampaignsService } from '@/services/campaigns'
import {
  CampaignForUI,
  CampaignItem,
  CampaignMeta,
} from '@/services/types/campaigns.types'

interface UseCampaignsReturn {
  data: CampaignForUI[]
  loading: boolean
  error: string | null
  retry: () => void
  refetch: () => void
  meta?: CampaignMeta
}

interface UseCampaignsOptions {
  /**
   * Se deve enriquecer automaticamente com dados de produtos
   * @default true
   */
  enrichWithProducts?: boolean

  /**
   * Se deve fazer cache dos resultados
   * @default true
   */
  enableCache?: boolean

  /**
   * Filtro de status das campanhas
   * @default undefined (todas)
   */
  status?: 'active' | 'inactive' | 'ended'

  /**
   * Página atual
   * @default 1
   */
  page?: number

  /**
   * Itens por página
   * @default 12
   */
  perpage?: number

  name?: string
}

const campaignsCache = new Map<
  string,
  {
    data: CampaignForUI[]
    meta?: CampaignMeta
    timestamp: number
  }
>()

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export const useCampaigns = (
  options: UseCampaignsOptions = {}
): UseCampaignsReturn => {
  const {
    enrichWithProducts = true,
    enableCache = true,
    status,
    page = 1,
    perpage = 12,
    name,
  } = options

  const [data, setData] = useState<CampaignForUI[]>([])
  const [meta, setMeta] = useState<UseCampaignsReturn['meta']>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const campaignsService = useMemo(() => new CampaignsService(), [])

  const cacheKey = useMemo(() => {
    return `campaigns-${status || 'all'}-${
      enrichWithProducts ? 'enriched' : 'basic'
    }-${page}-${perpage}-${name || 'no-search'}`
  }, [status, enrichWithProducts, page, perpage, name])

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Buscando campanhas da API...')

      if (enableCache && campaignsCache.has(cacheKey)) {
        const cached = campaignsCache.get(cacheKey)!
        const isExpired = Date.now() - cached.timestamp > CACHE_DURATION

        if (!isExpired) {
          console.log('✅ Usando dados do cache')
          setData(cached.data)
          setMeta(cached.meta)
          setLoading(false)
          return
        }
      }

      const campaignsResult = await campaignsService.getCampaigns({
        page,
        perpage,
        status,
        name,
      })

      if (!campaignsResult.response?.success) {
        throw new Error(
          campaignsResult.response?.message || 'Erro ao buscar campanhas'
        )
      }

      let campaignsData: CampaignItem[] = []
      let metaData: CampaignMeta | undefined

      if (Array.isArray(campaignsResult.response.data)) {
        campaignsData = campaignsResult.response.data
      } else if (campaignsResult.response.data?.list) {
        campaignsData = campaignsResult.response.data.list

        if (campaignsResult.response.data.meta) {
          metaData = campaignsResult.response.data.meta
        }
      }

      console.log(`✅ ${campaignsData.length} campanhas encontradas`)

      let finalData: CampaignForUI[] = []

      if (enrichWithProducts && campaignsData.length > 0) {
        console.log('🔄 Enriquecendo campanhas com dados de produtos...')

        finalData = await campaignsService.enrichCampaigns(campaignsData)

        console.log(`✅ Campanhas enriquecidas com sucesso`)
      } else {
        console.log(
          '⚠️ Transformação básica: sem dados de comissão individual dos produtos'
        )

        finalData = campaignsData.map((campaign) => ({
          id: campaign.id,
          title: campaign.name,
          description: campaign.description,
          periodStart: formatDate(campaign.start_date),
          periodEnd: formatDate(campaign.end_date),
          imageUrl: campaign.banner,
          status: 'active',

          maxCommission: 0,
          products: campaign.items.map((item) => ({
            id: item.id,
            name: item.name,
            image: item.image,
            price: 0,

            commissionPercentage: 0,
            link: item.link || '',
          })),
          creatives: [],
        }))
      }

      if (enableCache) {
        campaignsCache.set(cacheKey, {
          data: finalData,
          meta: metaData,
          timestamp: Date.now(),
        })
      }

      setData(finalData)
      setMeta(metaData)
    } catch (err: any) {
      console.error('❌ Erro ao buscar campanhas:', err)

      const errorMessage =
        err.response?.data?.message ||
        err.response?.statusText ||
        err.message ||
        'Erro desconhecido ao buscar campanhas'

      setError(errorMessage)
      setData([]) // Limpar dados em caso de erro
    } finally {
      setLoading(false)
    }
  }, [campaignsService, status, enrichWithProducts, enableCache, cacheKey])

  const retry = useCallback(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const refetch = useCallback(() => {
    if (enableCache) {
      campaignsCache.delete(cacheKey)
    }
    fetchCampaigns()
  }, [enableCache, cacheKey, fetchCampaigns])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  return {
    data,
    loading,
    error,
    retry,
    refetch,
    meta,
  }
}

export const useActiveCampaigns = () => {
  return useCampaigns({ status: 'active' })
}

export const useCampaignsBasic = (status?: 'active' | 'inactive' | 'ended') => {
  return useCampaigns({
    enrichWithProducts: false,
    status,
  })
}

export function useCampaignById(campaignId: number | string | undefined) {
  const [campaign, setCampaign] = useState<CampaignForUI | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const retry = useCallback(async () => {
    if (!campaignId) return

    setLoading(true)
    setError(null)

    try {
      const campaignService = new CampaignsService()

      console.log(`🔍 Buscando campanha ID: ${campaignId}`)

      const result = await campaignService.getCampaignById(Number(campaignId))

      if (!result.response?.success || !result.response.data) {
        throw new Error(result.response?.message || 'Campanha não encontrada')
      }

      const enrichedCampaign = await campaignService.enrichCampaign(
        result.response.data
      )

      console.log(
        `✅ Campanha "${enrichedCampaign.title}" carregada com ${enrichedCampaign.products.length} produtos`
      )

      setCampaign(enrichedCampaign)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro desconhecido ao carregar campanha'
      console.error(`❌ Erro ao carregar campanha ${campaignId}:`, err)
      setError(errorMessage)
      setCampaign(null)
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    if (campaignId) {
      retry()
    } else {
      setLoading(false)
      setCampaign(null)
      setError(null)
    }
  }, [campaignId, retry])

  return { data: campaign, loading, error, retry }
}

const formatDate = (dateStr: string): string => {
  try {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  } catch {
    return dateStr
  }
}
