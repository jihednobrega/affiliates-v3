import { useState, useEffect, useCallback, useMemo } from 'react'
import { useToast } from '@chakra-ui/react'
import { CouponsService } from '@/services/coupons'
import {
  CouponData,
  CouponMeta,
  GetCouponsRequest,
  CreateCouponRequest,
  UpdateCouponRequest,
  DeleteCouponRequest,
} from '@/services/types/coupons.types'

interface UseCouponsReturn {
  data: CouponData[]
  loading: boolean
  error: string | null
  retry: () => void
  refetch: () => void
  meta?: CouponMeta
  createCoupon: (request: CreateCouponRequest) => Promise<void>
  updateCoupon: (request: UpdateCouponRequest) => Promise<void>
  deleteCoupon: (request: DeleteCouponRequest) => Promise<void>
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
}

interface UseCouponsOptions extends GetCouponsRequest {
  /**
   * Se deve fazer cache dos resultados
   * @default true
   */
  enableCache?: boolean
}

// Cache simples para evitar múltiplas requisições
const couponsCache = new Map<
  string,
  {
    data: CouponData[]
    meta?: CouponMeta
    timestamp: number
  }
>()

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

/**
 * Hook para gerenciar cupons da marca
 */
export const useCoupons = (
  options: UseCouponsOptions = {}
): UseCouponsReturn => {
  const {
    page = 1,
    perpage = 15,
    coupon,
    affiliate,
    enableCache = true,
  } = options

  const toast = useToast()

  // Estados do hook
  const [data, setData] = useState<CouponData[]>([])
  const [meta, setMeta] = useState<CouponMeta | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados de mutations
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Serviço
  const couponsService = useMemo(() => new CouponsService(), [])

  // Chave do cache baseada nas opções
  const cacheKey = useMemo(() => {
    return `coupons-${page}-${perpage}-${coupon || 'all'}-${affiliate || 'all'}`
  }, [page, perpage, coupon, affiliate])

  /**
   * Busca dados dos cupons da API
   */
  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Buscando cupons da API...')

      // Verificar cache primeiro
      if (enableCache && couponsCache.has(cacheKey)) {
        const cached = couponsCache.get(cacheKey)!
        const isExpired = Date.now() - cached.timestamp > CACHE_DURATION

        if (!isExpired) {
          console.log('✅ Usando dados do cache')
          setData(cached.data)
          setMeta(cached.meta)
          setLoading(false)
          return
        }
      }

      // Buscar cupons na API
      const result = await couponsService.getCoupons({
        page,
        perpage,
        coupon,
        affiliate,
      })

      if (!result.response?.success) {
        throw new Error(result.response?.message || 'Erro ao buscar cupons')
      }

      const couponsData = result.response.data?.list || []
      const metaData = result.response.data?.meta

      console.log(`✅ ${couponsData.length} cupons encontrados`)

      // Salvar no cache
      if (enableCache) {
        couponsCache.set(cacheKey, {
          data: couponsData,
          meta: metaData,
          timestamp: Date.now(),
        })
      }

      setData(couponsData)
      setMeta(metaData)
    } catch (err: any) {
      console.error('❌ Erro ao buscar cupons:', err)

      const errorMessage =
        err.response?.data?.message ||
        err.response?.statusText ||
        err.message ||
        'Erro desconhecido ao buscar cupons'

      setError(errorMessage)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [couponsService, page, perpage, coupon, affiliate, enableCache, cacheKey])

  /**
   * Criar cupom
   */
  const createCoupon = useCallback(
    async (request: CreateCouponRequest) => {
      setIsCreating(true)

      try {
        console.log('➕ Criando cupom...', request)

        const result = await couponsService.createCoupon(request)

        if (!result.response?.success) {
          throw new Error(result.response?.message || 'Erro ao criar cupom')
        }

        console.log('✅ Cupom criado com sucesso')

        toast({
          title: 'Cupom criado!',
          description: `O cupom ${request.coupon} foi criado com sucesso.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        // Limpar cache e recarregar
        couponsCache.clear()
        await fetchCoupons()
      } catch (err: any) {
        console.error('❌ Erro ao criar cupom:', err)

        const errorMessage =
          err.response?.data?.message || err.message || 'Erro ao criar cupom'

        toast({
          title: 'Erro ao criar cupom',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })

        throw err
      } finally {
        setIsCreating(false)
      }
    },
    [couponsService, fetchCoupons, toast]
  )

  /**
   * Atualizar cupom
   */
  const updateCoupon = useCallback(
    async (request: UpdateCouponRequest) => {
      setIsUpdating(true)

      try {
        console.log('✏️ Atualizando cupom...', request)

        const result = await couponsService.updateCoupon(request)

        if (!result.response?.success) {
          throw new Error(result.response?.message || 'Erro ao atualizar cupom')
        }

        console.log('✅ Cupom atualizado com sucesso')

        toast({
          title: 'Cupom atualizado!',
          description: 'O cupom foi atualizado com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        // Limpar cache e recarregar
        couponsCache.clear()
        await fetchCoupons()
      } catch (err: any) {
        console.error('❌ Erro ao atualizar cupom:', err)

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Erro ao atualizar cupom'

        toast({
          title: 'Erro ao atualizar cupom',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })

        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [couponsService, fetchCoupons, toast]
  )

  /**
   * Deletar cupom
   */
  const deleteCoupon = useCallback(
    async (request: DeleteCouponRequest) => {
      setIsDeleting(true)

      try {
        console.log('🗑️ Deletando cupom...', request)

        const result = await couponsService.deleteCoupon(request)

        if (!result.response?.success) {
          throw new Error(result.response?.message || 'Erro ao deletar cupom')
        }

        console.log('✅ Cupom deletado com sucesso')

        toast({
          title: 'Cupom deletado!',
          description: 'O cupom foi deletado com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        // Limpar cache e recarregar
        couponsCache.clear()
        await fetchCoupons()
      } catch (err: any) {
        console.error('❌ Erro ao deletar cupom:', err)

        const errorMessage =
          err.response?.data?.message || err.message || 'Erro ao deletar cupom'

        toast({
          title: 'Erro ao deletar cupom',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })

        throw err
      } finally {
        setIsDeleting(false)
      }
    },
    [couponsService, fetchCoupons, toast]
  )

  /**
   * Função para retry (mesmo que refetch, mas mantém compatibilidade)
   */
  const retry = useCallback(() => {
    fetchCoupons()
  }, [fetchCoupons])

  /**
   * Limpa cache e recarrega dados
   */
  const refetch = useCallback(() => {
    if (enableCache) {
      couponsCache.delete(cacheKey)
    }
    fetchCoupons()
  }, [enableCache, cacheKey, fetchCoupons])

  // Executar busca inicial
  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  return {
    data,
    loading,
    error,
    retry,
    refetch,
    meta,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    isCreating,
    isUpdating,
    isDeleting,
  }
}
