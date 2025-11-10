import { useState, useEffect, useCallback, useMemo } from 'react'
import { useToast } from '@chakra-ui/react'
import { AffiliatesService } from '@/services/affiliates'
import {
  AffiliateListItem,
  AffiliateMeta,
  AffiliateStats,
  GetAffiliatesRequest,
} from '@/services/types/affiliates.types'

interface UseAffiliatesReturn {
  data: AffiliateListItem[]
  loading: boolean
  error: string | null
  retry: () => void
  refetch: () => void
  meta?: AffiliateMeta
  stats?: AffiliateStats
}

interface UseAffiliatesOptions extends GetAffiliatesRequest {
  /**
   * Se deve fazer cache dos resultados
   * @default true
   */
  enableCache?: boolean
}

// Cache simples para evitar múltiplas requisições
const affiliatesCache = new Map<
  string,
  {
    data: AffiliateListItem[]
    meta?: AffiliateMeta
    stats?: AffiliateStats
    timestamp: number
  }
>()

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

/**
 * Hook para buscar lista de afiliados
 *
 * @example
 * // Listar todos os afiliados (com paginação)
 * const { data, loading } = useAffiliates({ page: 1, perpage: 15 })
 *
 * @example
 * // Lista simplificada para autocomplete (sem stats)
 * const { data, loading } = useAffiliates({ listOnly: true, perpage: 1000 })
 *
 * @example
 * // Filtrar por nome
 * const { data, loading } = useAffiliates({ name: 'João', page: 1 })
 */
export const useAffiliates = (
  options: UseAffiliatesOptions = {}
): UseAffiliatesReturn => {
  const {
    page = 1,
    perpage = 15,
    name,
    status,
    parent_name,
    period,
    email,
    listOnly = false,
    enableCache = true,
  } = options

  const toast = useToast()

  // Estados do hook
  const [data, setData] = useState<AffiliateListItem[]>([])
  const [meta, setMeta] = useState<AffiliateMeta | undefined>()
  const [stats, setStats] = useState<AffiliateStats | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Serviço
  const affiliatesService = useMemo(() => new AffiliatesService(), [])

  // Chave do cache baseada nas opções
  const cacheKey = useMemo(() => {
    return `affiliates-${page}-${perpage}-${name || 'all'}-${status || 'all'}-${
      parent_name || 'all'
    }-${listOnly}`
  }, [page, perpage, name, status, parent_name, listOnly])

  /**
   * Busca dados dos afiliados da API
   */
  const fetchAffiliates = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Buscando afiliados da API...')

      // Verificar cache primeiro
      if (enableCache && affiliatesCache.has(cacheKey)) {
        const cached = affiliatesCache.get(cacheKey)!
        const isExpired = Date.now() - cached.timestamp > CACHE_DURATION

        if (!isExpired) {
          console.log('✅ Usando dados do cache')
          setData(cached.data)
          setMeta(cached.meta)
          setStats(cached.stats)
          setLoading(false)
          return
        }
      }

      // Buscar afiliados na API
      const result = await affiliatesService.getAffiliates({
        page,
        perpage,
        name,
        status,
        parent_name,
        period,
        email,
        listOnly,
      })

      if (!result.response?.success) {
        throw new Error(result.response?.message || 'Erro ao buscar afiliados')
      }

      const affiliatesData = result.response.data?.list || []
      const metaData = result.response.data?.meta
      const statsData = result.response.data?.stats

      console.log(`✅ ${affiliatesData.length} afiliados encontrados`)

      // Salvar no cache
      if (enableCache) {
        affiliatesCache.set(cacheKey, {
          data: affiliatesData,
          meta: metaData,
          stats: statsData,
          timestamp: Date.now(),
        })
      }

      setData(affiliatesData)
      setMeta(metaData)
      setStats(statsData)
    } catch (err: any) {
      console.error('❌ Erro ao buscar afiliados:', err)

      const errorMessage =
        err.response?.data?.message ||
        err.response?.statusText ||
        err.message ||
        'Erro desconhecido ao buscar afiliados'

      setError(errorMessage)
      setData([])

      toast({
        title: 'Erro ao buscar afiliados',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }, [
    affiliatesService,
    page,
    perpage,
    name,
    status,
    parent_name,
    period,
    email,
    listOnly,
    enableCache,
    cacheKey,
    toast,
  ])

  /**
   * Função para retry (mesmo que refetch, mas mantém compatibilidade)
   */
  const retry = useCallback(() => {
    fetchAffiliates()
  }, [fetchAffiliates])

  /**
   * Limpa cache e recarrega dados
   */
  const refetch = useCallback(() => {
    if (enableCache) {
      affiliatesCache.delete(cacheKey)
    }
    fetchAffiliates()
  }, [enableCache, cacheKey, fetchAffiliates])

  // Executar busca inicial
  useEffect(() => {
    fetchAffiliates()
  }, [fetchAffiliates])

  return {
    data,
    loading,
    error,
    retry,
    refetch,
    meta,
    stats,
  }
}
