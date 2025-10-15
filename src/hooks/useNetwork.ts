import { useState, useEffect, useCallback, useMemo } from 'react'
import { NetworkService } from '@/services/network'
import {
  NetworkAffiliate,
  NetworkAffiliateFormatted,
} from '@/services/types/network.types'

interface UseNetworkReturn {
  data: NetworkAffiliateFormatted[]
  meta: {
    current_page: number
    last_page: number
    total_items: number
    pagesize: number
  } | null
  loading: boolean
  error: string | null
  errorStatus: number | null
  retry: () => void
  refetch: () => void
}

interface UseNetworkOptions {
  /**
   * Se deve fazer cache dos resultados
   * @default true
   */
  enableCache?: boolean

  /**
   * Filtro de status dos afiliados
   * @default undefined (todos)
   */
  status?: 'enabled' | 'disabled' | 'new' | 'blocked'

  /**
   * Termo de busca
   * @default undefined
   */
  search?: string

  /**
   * Página atual
   * @default 1
   */
  page?: number
}

const networkCache = new Map<
  string,
  {
    data: NetworkAffiliateFormatted[]
    meta: {
      current_page: number
      last_page: number
      total_items: number
      pagesize: number
    } | null
    timestamp: number
  }
>()

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export const useNetwork = (
  options: UseNetworkOptions = {}
): UseNetworkReturn => {
  const { enableCache = true, status, search, page = 1 } = options

  const [data, setData] = useState<NetworkAffiliateFormatted[]>([])
  const [meta, setMeta] = useState<{
    current_page: number
    last_page: number
    total_items: number
    pagesize: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorStatus, setErrorStatus] = useState<number | null>(null)

  const networkService = useMemo(() => new NetworkService(), [])

  const cacheKey = useMemo(() => {
    return `network-${status || 'all'}-${search || 'no-search'}-page-${page}`
  }, [status, search, page])

  const fetchNetwork = useCallback(async () => {
    setLoading(true)
    setError(null)
    setErrorStatus(null)

    try {
      console.log('🔍 Buscando rede de afiliados da API...')

      if (enableCache && networkCache.has(cacheKey)) {
        const cached = networkCache.get(cacheKey)!
        const isExpired = Date.now() - cached.timestamp > CACHE_DURATION

        if (!isExpired) {
          console.log('✅ Usando dados do cache')
          setData(cached.data)
          setMeta(cached.meta)
          setLoading(false)
          return
        }
      }

      const networkResult = await networkService.getNetworkAffiliates({
        page,
        perpage: 10,
        status,
        search,
      })

      if (networkResult.status === 422) {
        const errorMessage =
          networkResult.response?.message ||
          'Você não tem permissão para acessar esta funcionalidade.'
        setError(errorMessage)
        setErrorStatus(422)
        setData([])
        setMeta(null)
        setLoading(false)
        return
      }

      if (!networkResult.response?.success) {
        throw new Error(
          networkResult.response?.message || 'Erro ao buscar rede de afiliados'
        )
      }

      let affiliatesData: NetworkAffiliateFormatted[] = []
      let metaData = null

      if (networkResult.response.data?.list) {
        affiliatesData = networkResult.response.data.list.map(
          (affiliate: NetworkAffiliate) => networkService.transform(affiliate)
        )
        metaData = networkResult.response.data.meta
      }

      console.log(
        `✅ ${affiliatesData.length} afiliados encontrados de ${
          metaData?.total_items || 0
        } total`
      )

      if (enableCache) {
        networkCache.set(cacheKey, {
          data: affiliatesData,
          meta: metaData,
          timestamp: Date.now(),
        })
      }

      setData(affiliatesData)
      setMeta(metaData)
    } catch (err: any) {
      console.error('❌ Erro ao buscar rede de afiliados:', err)

      const statusCode = err.response?.status || null
      const errorMessage =
        err.response?.data?.message ||
        err.response?.statusText ||
        err.message ||
        'Erro desconhecido ao buscar rede de afiliados'

      setError(errorMessage)
      setErrorStatus(statusCode)
      setData([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }, [networkService, status, search, page, enableCache, cacheKey])

  const retry = useCallback(() => {
    fetchNetwork()
  }, [fetchNetwork])

  const refetch = useCallback(() => {
    if (enableCache) {
      networkCache.delete(cacheKey)
    }
    fetchNetwork()
  }, [enableCache, cacheKey, fetchNetwork])

  useEffect(() => {
    fetchNetwork()
  }, [fetchNetwork])

  return {
    data,
    meta,
    loading,
    error,
    errorStatus,
    retry,
    refetch,
  }
}

export const useActiveNetwork = () => {
  return useNetwork({ status: 'enabled' })
}
