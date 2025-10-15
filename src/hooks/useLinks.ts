import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LinksService } from '@/services/links'
import {
  LinksFilters,
  AffiliateLinksData,
  ProcessedLinkData,
  LinksSummary,
  LinkStatus,
} from '@/services/types/links.types'
import { formatCurrency, formatNumber } from '@/utils/currency'

const CACHE_CONFIG = {
  staleTime: 2 * 60 * 1000, // 2 minutos - links podem mudar com mais frequência
  gcTime: 10 * 60 * 1000, // 10 minutos na memória
  timeout: 30000, // TEMPORÁRIO: 30 segundos para usuários com muitos links
} as const

export const useLinkById = (linkId: number | string | undefined) => {
  const linksService = useMemo(() => new LinksService(), [])

  return useQuery({
    queryKey: ['links', 'detail', linkId],
    queryFn: () => linksService.getAffiliateLinkById(Number(linkId)),
    enabled: !!linkId && !isNaN(Number(linkId)),
    ...CACHE_CONFIG,
  })
}

export const useLinks = (initialFilters?: Partial<LinksFilters>) => {
  const linksService = useMemo(() => new LinksService(), [])

  const [filters, setFilters] = useState<LinksFilters>({
    page: 1,
    perpage: 20,
    ...initialFilters,
  })

  const activeFilters = useMemo(
    () => ({
      page: initialFilters?.page ?? filters.page,
      perpage: initialFilters?.perpage ?? filters.perpage,
      status: initialFilters?.status ?? filters.status,
      product: initialFilters?.product ?? filters.product,
      view: initialFilters?.view ?? filters.view,
    }),
    [initialFilters, filters]
  )

  const {
    data: linksData,
    isLoading: isLoadingLinks,
    error: linksError,
    refetch: refetchLinks,
  } = useQuery({
    queryKey: ['links', 'affiliate', activeFilters],
    queryFn: () => linksService.getAffiliateLinks(activeFilters),
    ...CACHE_CONFIG,
  })

  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['links', 'stats'],
    queryFn: () => linksService.getAffiliateLinksStats(),
    ...CACHE_CONFIG,
  })

  const processedData = useMemo(() => {
    if (
      !linksData?.response?.success ||
      !linksData.response.data ||
      typeof linksData.response.data !== 'object'
    ) {
      return null
    }

    const data: AffiliateLinksData = linksData.response.data

    const processedLinks: ProcessedLinkData[] = (data.list || []).map(
      (link) => {
        const clicks = link.total_views || 0
        const conversions = link.conversions || 0
        const revenue = link.revenue || 0
        const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0

        return {
          id: link.id,
          uid: link.uid,
          name: link.name,
          code: link.code,
          url: link.url,
          source_url: link.source_url,
          destination_url: link.destination_url,
          product_id: link.product_id,
          product: link.product,
          image: link.image,
          created_at: link.created_at,
          total_views: link.total_views,
          deleted_at: link.deleted_at,

          clicks,
          conversions,
          revenue,
          product_name: link.product,
          product_image: link.image,
          short_url: link.url,
          utm_url: link.destination_url,
          status: (link.deleted_at ? 'inactive' : 'active') as keyof LinkStatus,
          updated_at: link.created_at,

          revenueFormatted: formatCurrency(revenue),
          statusLabel: getStatusLabel(link.deleted_at ? 'inactive' : 'active'),
          conversion_rate: conversionRate,
          conversion_rate_formatted: `${conversionRate.toFixed(2)}%`,
        }
      }
    )

    return {
      links: processedLinks,

      meta: data.meta,
    }
  }, [linksData])

  const stats = useMemo((): LinksSummary | null => {
    if (
      !statsData?.response?.success ||
      !statsData.response.data ||
      typeof statsData.response.data !== 'object'
    ) {
      return null
    }

    const data = statsData.response.data

    return {
      total_links: data.total_links || 0,
      active_links: data.active_links || 0,
      total_clicks: data.total_clicks || 0,
      total_conversions: data.total_conversions || 0,
      total_revenue: data.total_revenue || 0,
      conversion_rate: data.conversion_rate || 0,
    }
  }, [statsData])

  const formattedStats = useMemo(() => {
    if (!stats) return null

    return {
      ...stats,
      total_revenue_formatted: formatCurrency(stats.total_revenue),
      total_clicks_formatted: formatNumber(stats.total_clicks),
      total_conversions_formatted: formatNumber(stats.total_conversions),
      conversion_rate_formatted: `${stats.conversion_rate.toFixed(2)}%`,
    }
  }, [stats])

  const updateFilters = (newFilters: Partial<LinksFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const setStatus = (status?: string) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }))
  }

  const setProduct = (product?: string) => {
    setFilters((prev) => ({ ...prev, product, page: 1 }))
  }

  const isLoading = isLoadingLinks || isLoadingStats
  const hasError = linksError || statsError

  const exportLinks = async (status?: string, dateRange?: string) => {
    try {
      const result = await LinksService.getAffiliateLinksExport({
        status,
        dateRange,
      })
      return result
    } catch (error) {
      console.error('Erro ao exportar links:', error)
      throw error
    }
  }

  const getLinkById = async (linkId: number) => {
    try {
      const result = await linksService.getAffiliateLinkById(linkId)
      return result
    } catch (error) {
      console.error('Erro ao buscar link:', error)
      throw error
    }
  }

  return {
    data: processedData,
    stats,
    formattedStats,

    isLoading,
    isLoadingLinks,
    isLoadingStats,
    hasError,
    linksError,
    statsError,

    filters: activeFilters,
    updateFilters,
    setPage,
    setStatus,
    setProduct,

    refetchLinks,
    refetchStats,
    refetch: () => {
      refetchLinks()
      refetchStats()
    },

    exportLinks,
    getLinkById,
  }
}

export const useLinksSummary = () => {
  const linksService = useMemo(() => new LinksService(), [])

  const { data, isLoading, error } = useQuery({
    queryKey: ['links', 'summary'],
    queryFn: () => linksService.getAffiliateLinksStats(),
    ...CACHE_CONFIG,
  })

  const summary = useMemo(() => {
    if (
      !data?.response?.success ||
      !data.response.data ||
      typeof data.response.data !== 'object'
    ) {
      return null
    }

    const statsData = data.response.data

    return {
      total_links: statsData.total_links || 0,
      active_links: statsData.active_links || 0,
      total_clicks: statsData.total_clicks || 0,
      total_conversions: statsData.total_conversions || 0,
      total_revenue: statsData.total_revenue || 0,
      conversion_rate: statsData.conversion_rate || 0,

      total_revenue_formatted: formatCurrency(statsData.total_revenue || 0),
      total_clicks_formatted: formatNumber(statsData.total_clicks || 0),
      total_conversions_formatted: formatNumber(
        statsData.total_conversions || 0
      ),
      conversion_rate_formatted: `${(statsData.conversion_rate || 0).toFixed(
        2
      )}%`,
    }
  }, [data])

  return {
    summary,
    isLoading,
    error,
  }
}

export const useDeleteLink = () => {
  const queryClient = useQueryClient()
  const linksService = useMemo(() => new LinksService(), [])

  return useMutation({
    mutationFn: async (linkId: number) => {
      const result = await linksService.deleteAffiliateLink(linkId)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
    },
    onError: (error) => {
      console.error('Erro ao deletar link:', error)
    },
  })
}

function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    pending: 'Pendente',
    suspended: 'Suspenso',
  }

  return statusLabels[status] || status
}
