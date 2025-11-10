import { useState, useEffect } from 'react'
import { AffiliatesService } from '@/services/affiliates'
import type {
  AffiliateRankItem,
  AffiliateMeta,
  GetAffiliatesRankRequest,
} from '@/services/types/affiliates.types'

interface UseAffiliatesRankReturn {
  data: AffiliateRankItem[]
  loading: boolean
  error: string | null
  retry: () => void
  refetch: () => void
  meta?: AffiliateMeta
}

const affiliatesService = new AffiliatesService()

// Cache simples (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000
const rankingCache = new Map<
  string,
  {
    data: AffiliateRankItem[]
    meta?: AffiliateMeta
    timestamp: number
  }
>()

export function useAffiliatesRank(
  params: GetAffiliatesRankRequest
): UseAffiliatesRankReturn {
  const [data, setData] = useState<AffiliateRankItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<AffiliateMeta | undefined>()
  const [retryKey, setRetryKey] = useState(0)

  const cacheKey = JSON.stringify(params)

  useEffect(() => {
    let isMounted = true

    const fetchRanking = async () => {
      try {
        // Verificar cache
        const cached = rankingCache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          if (isMounted) {
            setData(cached.data)
            setMeta(cached.meta)
            setLoading(false)
            setError(null)
          }
          return
        }

        setLoading(true)
        setError(null)

        const result = await affiliatesService.getAffiliatesRank(params)

        if (!isMounted) return

        if (result.status === 200 && result.response?.success) {
          const rankingData = result.response.data?.list || []
          const metaData = result.response.data?.meta

          setData(rankingData)
          setMeta(metaData)
          setError(null)

          // Atualizar cache
          rankingCache.set(cacheKey, {
            data: rankingData,
            meta: metaData,
            timestamp: Date.now(),
          })
        } else {
          setError(result.response?.message || 'Erro ao carregar ranking')
          setData([])
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Erro ao buscar ranking:', err)
          setError(err.message || 'Erro ao carregar ranking')
          setData([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchRanking()

    return () => {
      isMounted = false
    }
  }, [cacheKey, retryKey])

  const retry = () => {
    // Limpar cache para forçar nova busca
    rankingCache.delete(cacheKey)
    setRetryKey((prev) => prev + 1)
  }

  const refetch = () => {
    // Limpar cache e forçar nova busca
    rankingCache.delete(cacheKey)
    setRetryKey((prev) => prev + 1)
  }

  return {
    data,
    loading,
    error,
    retry,
    refetch,
    meta,
  }
}
