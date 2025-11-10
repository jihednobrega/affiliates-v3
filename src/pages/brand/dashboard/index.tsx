import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import { EditAffiliateProfileModal } from '@/components/Modals'
import Head from 'next/head'
import Image from 'next/image'
import {
  Box,
  Flex,
  Text,
  Grid,
  VStack,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  Divider,
  useDisclosure,
  Skeleton,
  useToast,
  IconButton,
  Portal,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react'
import { SquaresFourIcon } from '@/components/Icons'
import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  DollarSign,
  Wallet,
  ShoppingBag,
  Package,
  UserPlus,
  Link2,
  Eye,
  Users,
  Settings,
  Ellipsis,
  Star,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { BrandDashboardService } from '@/services/brand-dashboard'
import {
  BrandDashboardSummary,
  BrandDashboardStatistics,
  BrandDashboardCharts,
} from '@/services/types/brand-dashboard.types'
import { formatCurrency, formatNumber } from '@/utils/formatToCurrency'
import { periodToDateRange, customDateToRange } from '@/utils/periodUtils'
import { useAffiliatesRank } from '@/hooks/useAffiliatesRank'
import { useProducts } from '@/hooks/useProducts'
import { Avatar } from '@chakra-ui/react'
import { formatPercentage } from '@/utils/formatters'
import { ShimmerBadge } from '@/components/UI/Badges'
import { AffiliateLinksModal } from '@/components/Modals/AffiliateLinksModal'

const PERIOD_OPTIONS = [
  { label: 'Hoje', value: 'today' },
  { label: 'Últimos 7 dias', value: 'last_7_days' },
  { label: 'Últimos 30 dias', value: 'last_30_days' },
  { label: 'Últimos 90 dias', value: 'last_90_days' },
  { label: 'Mês Atual', value: 'current_month' },
  { label: 'Mês Anterior', value: 'last_month' },
  { label: 'Outros', value: 'custom' },
]

const formatDateSafe = (dateString: string) => {
  try {
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
  } catch {
    return dateString
  }
}

const mockChartData = [
  { day: 'Domingo', linksGerados: 0, cliques: 0 },
  { day: 'Segunda', linksGerados: 0, cliques: 0 },
  { day: 'Terça', linksGerados: 0, cliques: 0 },
  { day: 'Quarta', linksGerados: 0, cliques: 0 },
  { day: 'Quinta', linksGerados: 0, cliques: 0 },
  { day: 'Sexta', linksGerados: 0, cliques: 0 },
  { day: 'Sábado', linksGerados: 0, cliques: 0 },
]

const mockAffiliatesRanking = [
  {
    position: 1,
    name: 'João Silva',
    email: 'joao.silva@email.com',
    clicks: 8420,
    sales: 1247,
    revenue: 'R$ 87.450,00',
    commission: 'R$ 15.840,00',
  },
  {
    position: 2,
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    clicks: 7180,
    sales: 1089,
    revenue: 'R$ 72.380,00',
    commission: 'R$ 13.120,00',
  },
  {
    position: 3,
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    clicks: 6520,
    sales: 945,
    revenue: 'R$ 65.240,00',
    commission: 'R$ 11.840,00',
  },
  {
    position: 4,
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    clicks: 5890,
    sales: 823,
    revenue: 'R$ 58.790,00',
    commission: 'R$ 10.670,00',
  },
  {
    position: 5,
    name: 'Carlos Ferreira',
    email: 'carlos.ferreira@email.com',
    clicks: 4340,
    sales: 687,
    revenue: 'R$ 48.820,00',
    commission: 'R$ 8.850,00',
  },
]

export default function BrandDashboard() {
  const toast = useToast()
  const dashboardService = useMemo(() => new BrandDashboardService(), [])

  const [selectedPeriod, setSelectedPeriod] = useState('current_month')
  const [customDateRange, setCustomDateRange] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  })
  const [tempDateRange, setTempDateRange] = useState(customDateRange)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [rankingTab, setRankingTab] = useState<'produtos' | 'afiliados'>(
    'afiliados'
  )
  const [togglingProductId, setTogglingProductId] = useState<number | null>(
    null
  )

  const {
    isOpen: isLinksModalOpen,
    onOpen: onLinksModalOpen,
    onClose: onLinksModalClose,
  } = useDisclosure()
  const [selectedAffiliate, setSelectedAffiliate] = useState<{
    id: number
    name: string
  } | null>(null)

  const {
    isOpen: isEditProfileModalOpen,
    onOpen: onEditProfileModalOpen,
    onClose: onEditProfileModalClose,
  } = useDisclosure()
  const [selectedAffiliateForEdit, setSelectedAffiliateForEdit] = useState<{
    id: number
    name: string
    email: string
    phone?: string
    avatar?: string
    birthdate?: string
    parent_name?: string
    parent_id?: number | null
    social_network?: string
    business_name?: string
    cpf?: string
    business_cnpj?: string
    custom_commission?: string | number
    can_have_referrals?: boolean
    selected_parent?: number | null
    available_parents?: Array<{ id: number; name: string }>
  } | null>(null)

  const [dashboardData, setDashboardData] =
    useState<BrandDashboardSummary | null>(null)
  const [statisticsData, setStatisticsData] =
    useState<BrandDashboardStatistics | null>(null)
  const [chartsData, setChartsData] = useState<BrandDashboardCharts | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const periodForApi = useMemo(() => {
    if (selectedPeriod === 'custom') {
      return customDateToRange(
        customDateRange.start_date,
        customDateRange.end_date
      )
    }
    return periodToDateRange(selectedPeriod) || undefined
  }, [selectedPeriod, customDateRange])

  const { data: ranking, loading: rankingLoading } = useAffiliatesRank({
    page: 1,
    perpage: 5,
  })

  const {
    data: productsData,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useProducts({
    page: 1,
    perpage: 5,
    orderBy: 'commission:desc',
  })

  const handleViewLinks = (affiliateId: number, affiliateName: string) => {
    setSelectedAffiliate({ id: affiliateId, name: affiliateName })
    onLinksModalOpen()
  }

  const handleEditProfile = async (affiliateId: number) => {
    try {
      const affiliatesService = new (
        await import('@/services/affiliates')
      ).AffiliatesService()
      const result = await affiliatesService.getAffiliate({ id: affiliateId })

      if (result.response?.success && result.response.data) {
        const affiliateData = result.response.data
        setSelectedAffiliateForEdit({
          id: affiliateData.id,
          name: affiliateData.name,
          email: affiliateData.email,
          phone: affiliateData.phone,
          avatar: affiliateData.avatar,
          birthdate: affiliateData.birthdate,
          parent_name: affiliateData.parent_name,
          parent_id: affiliateData.parent_id,
          social_network: affiliateData.social_network,
          business_name: affiliateData.business_name,
          cpf: affiliateData.cpf,
          business_cnpj: affiliateData.business_cnpj,
          custom_commission: affiliateData.custom_commission,
          can_have_referrals: affiliateData.can_have_referrals,
          selected_parent: affiliateData.selected_parent,
          available_parents: affiliateData.available_parents || [],
        })
        onEditProfileModalOpen()
      } else {
        toast({
          title: 'Erro ao carregar dados do afiliado',
          description: 'Não foi possível carregar as informações do afiliado.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Erro ao buscar afiliado:', error)
      toast({
        title: 'Erro ao carregar dados',
        description: 'Ocorreu um erro inesperado.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    }
  }

  const handleSaveEditProfile = async (data: any) => {
    if (!selectedAffiliateForEdit) return

    try {
      const affiliatesService = new (
        await import('@/services/affiliates')
      ).AffiliatesService()

      const result = await affiliatesService.updateAffiliate({
        id: selectedAffiliateForEdit.id,
        name: data.name,
        avatar: selectedAffiliateForEdit.avatar || '',
        cpf: data.cpf,
        business_cnpj: data.cnpj,
        business_name: data.companyName,
        phone: data.phone,
        birthdate: data.birthDate,
        custom_commission: data.hasCustomCommission
          ? data.customCommission
          : null,
        can_have_referrals: data.allowReferral,
        commission_over_referred:
          data.allowReferral && data.hasCustomCommission
            ? data.customCommission
            : '0.00',
        selected_parent: data.parentAffiliate
          ? Number(data.parentAffiliate)
          : null,
      })

      if (result.response?.success) {
        toast({
          title: 'Sucesso',
          description: 'Dados do afiliado atualizados com sucesso!',
          status: 'success',
          duration: 4000,
          isClosable: true,
        })
        onEditProfileModalClose()

        fetchDashboard()
      } else {
        toast({
          title: 'Erro ao atualizar',
          description:
            result.response?.message ||
            'Não foi possível atualizar os dados do afiliado.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar afiliado:', error)
      toast({
        title: 'Erro ao atualizar',
        description: 'Ocorreu um erro inesperado.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    }
  }

  const handleToggleFeatured = async (
    productId: number,
    currentFeaturedState: boolean
  ) => {
    setTogglingProductId(productId)
    const newFeaturedState = !currentFeaturedState

    try {
      const productsService = new (
        await import('@/services/products')
      ).ProductsService()
      const result = await productsService.updateProduct({
        id: productId,
        featured: newFeaturedState,
      })

      if (result.response?.success) {
        toast({
          title: 'Produto atualizado!',
          description: `Produto ${
            newFeaturedState ? 'marcado como' : 'removido de'
          } destaque.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        await refetchProducts()
        setTogglingProductId(null)
      } else {
        setTogglingProductId(null)
        throw new Error('Falha ao atualizar produto')
      }
    } catch (error) {
      setTogglingProductId(null)
      console.error('Erro ao atualizar produto:', error)
      toast({
        title: 'Erro ao atualizar produto',
        description: 'Não foi possível atualizar o produto. Tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleViewProduct = (url: string) => {
    window.open(url, '_blank')
  }

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await dashboardService.getBrandDashboard({
        interval: periodForApi,
      })

      if (result.status === 200 && result.response?.success) {
        setDashboardData(result.response.data.summary)
        setStatisticsData(result.response.data.statistics)
        setChartsData(result.response.data.charts)
      } else {
        throw new Error(
          result.response?.message || 'Erro ao carregar dashboard'
        )
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar dashboard'
      setError(errorMessage)
      toast({
        title: 'Erro ao carregar dashboard',
        description: errorMessage,
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }, [dashboardService, periodForApi, toast])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  useEffect(() => {
    if (mockAffiliatesRanking.length === 0 && rankingTab === 'afiliados') {
      setRankingTab('produtos')
    }
  }, [rankingTab])

  const chartData = useMemo(() => {
    if (!chartsData?.links) {
      return mockChartData
    }

    const { labels, datasets } = chartsData.links

    const visualizacoesDataset = datasets.find(
      (ds) => ds.label === 'Visualizações'
    )
    const linksDataset = datasets.find((ds) => ds.label === 'Links')

    return labels.map((day, index) => ({
      day,
      cliques: visualizacoesDataset?.data[index] || 0,
      linksGerados: linksDataset?.data[index] || 0,
    }))
  }, [chartsData])

  const totalLinksGerados = useMemo(() => {
    return chartData.reduce((acc, item) => acc + item.linksGerados, 0)
  }, [chartData])

  const totalCliques = useMemo(() => {
    return chartData.reduce((acc, item) => acc + item.cliques, 0)
  }, [chartData])

  const selectedPeriodLabel = useMemo(() => {
    if (selectedPeriod === 'custom') {
      const startDate = formatDateSafe(customDateRange.start_date)
      const endDate = formatDateSafe(customDateRange.end_date)
      return `${startDate} - ${endDate}`
    }
    const option = PERIOD_OPTIONS.find((opt) => opt.value === selectedPeriod)
    return option ? option.label : 'Mês Atual'
  }, [selectedPeriod, customDateRange])

  const handlePeriodSelect = (periodKey: string) => {
    if (periodKey === 'custom') {
      setTempDateRange(customDateRange)
      onOpen()
    } else {
      setSelectedPeriod(periodKey)
    }
  }

  const handleCustomDateConfirm = () => {
    setCustomDateRange(tempDateRange)
    setSelectedPeriod('custom')
    onClose()
  }

  const handleCustomDateCancel = () => {
    setTempDateRange(customDateRange)
    onClose()
  }

  return (
    <>
      <Head>
        <title>Painel Geral | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Flex gap={2} align="center">
            <SquaresFourIcon boxSize={6} color="#131D53" />
            <Text fontSize="sm" color="#131D53">
              Painel Geral
            </Text>
          </Flex>
          <Menu>
            <MenuButton>
              <Flex
                gap={1.5}
                align="center"
                px={3}
                py={1.5}
                borderWidth={1}
                borderColor="#d1d7eb"
                borderRadius="md"
                className="container-shadow"
                cursor="pointer"
                _hover={{ bg: 'gray.50' }}
              >
                <Image
                  src="/assets/icons/calendar.svg"
                  alt="calendario"
                  width={20}
                  height={20}
                />
                <Text fontSize="xs" fontWeight="medium" color="#131d53">
                  {selectedPeriodLabel}
                </Text>
              </Flex>
            </MenuButton>
            <MenuList>
              {PERIOD_OPTIONS.map((option) => (
                <MenuItem
                  key={option.value}
                  onClick={() => handlePeriodSelect(option.value)}
                  bg={
                    selectedPeriod === option.value ? 'blue.50' : 'transparent'
                  }
                  color={
                    selectedPeriod === option.value ? 'blue.600' : 'inherit'
                  }
                  fontSize="sm"
                >
                  {option.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </PageHeader>

        <PageContent>
          <Grid
            templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
            gap={2}
          >
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <Flex
                    key={index}
                    p={3}
                    bg="white"
                    flexDirection="column"
                    gap={3}
                    border="1px solid"
                    borderColor="#dee6f2"
                    borderRadius="xl"
                    className="container-shadow"
                  >
                    <Flex align="center" gap={3}>
                      <Skeleton w={6} h={6} borderRadius="base" />
                      <Skeleton height="12px" width="100px" />
                    </Flex>
                    <Skeleton height="16px" width="80px" />
                  </Flex>
                ))
              : dashboardData
              ? [
                  {
                    label: 'Total em vendas',
                    value: formatCurrency(dashboardData.total_sales),
                    icon: DollarSign,
                  },
                  {
                    label: 'Comissões',
                    value: formatCurrency(dashboardData.commissions),
                    icon: Wallet,
                  },
                  {
                    label: 'Total de pedidos',
                    value: formatNumber(dashboardData.orders_count),
                    icon: ShoppingBag,
                  },
                  {
                    label: 'Total de produtos vendidos',
                    value: formatNumber(dashboardData.products_sold),
                    icon: Package,
                  },
                  {
                    label: 'Novos afiliados ativos',
                    value: formatNumber(dashboardData.new_affiliates),
                    icon: UserPlus,
                  },
                  {
                    label: 'Novos links gerados',
                    value: formatNumber(dashboardData.new_links),
                    icon: Link2,
                  },
                  {
                    label: 'Links visualizados',
                    value: formatNumber(dashboardData.link_views),
                    icon: Eye,
                  },
                  {
                    label: 'Total de afiliados ativos',
                    value: formatNumber(dashboardData.active_affiliates),
                    icon: Users,
                  },
                ].map((metric, index) => {
                  const MetricIcon = metric.icon

                  return (
                    <Flex
                      key={index}
                      p={3}
                      bg="white"
                      flexDirection="column"
                      gap={3}
                      border="1px solid"
                      borderColor="#dee6f2"
                      borderRadius="xl"
                      className="container-shadow"
                    >
                      <Flex align="center" gap={3}>
                        <Flex
                          bg="#dfefff"
                          w={6}
                          h={6}
                          align="center"
                          justify="center"
                          borderRadius="base"
                          p={1}
                        >
                          <MetricIcon size={20} color="#1f70f1b2" />
                        </Flex>
                        <Text fontSize="xs" color="#131d5399">
                          {metric.label}
                        </Text>
                      </Flex>
                      <Text fontSize="sm" color="#131d53" fontWeight={500}>
                        {metric.value}
                      </Text>
                    </Flex>
                  )
                })
              : null}
          </Grid>

          <Box
            display="flex"
            flexDirection="column"
            gap={3}
            p={3}
            pb={4}
            border="1px solid"
            borderColor="#DEE6F2"
            bg="white"
            borderRadius="xl"
            overflow="hidden"
            className="container-shadow"
          >
            <Text fontSize="sm" color="#131D53" px={3}>
              Estatísticas
            </Text>
            <VStack spacing={5} align="stretch">
              <VStack spacing={3} align="stretch">
                <HStack px={2} spacing={3}>
                  <HStack spacing={1.5}>
                    <Box
                      border="1px solid"
                      borderColor="#99ADFF"
                      bg="#D9E7FF"
                      borderRadius="4px"
                      w={5}
                      h={3.5}
                    />
                    <Text fontSize="xs" color="#131D5399">
                      Links Gerados
                    </Text>
                    <Text fontSize="xs" color="#131D53">
                      {totalLinksGerados.toLocaleString()}
                    </Text>
                  </HStack>

                  <HStack spacing={1.5}>
                    <Box
                      bgGradient="linear(to-b, #5898FF, #9EC3FF)"
                      borderRadius="4px"
                      w={5}
                      h={3.5}
                    />
                    <Text fontSize="xs" color="#131D5399">
                      Cliques
                    </Text>
                    <Text fontSize="xs" color="#131D53">
                      {totalCliques.toLocaleString()}
                    </Text>
                  </HStack>
                </HStack>

                <Box overflowX="auto">
                  <Box minW="774px" h="268px">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        barGap={8}
                        barCategoryGap={24}
                        margin={{ left: 0, top: 10 }}
                      >
                        <defs>
                          <linearGradient
                            id="cliquesGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="#5898FF" />
                            <stop offset="100%" stopColor="#9EC3FF" />
                          </linearGradient>
                        </defs>

                        <CartesianGrid stroke="#F0F6FF" vertical={false} />

                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 12,
                            fill: '#131d5333',
                            fontFamily: 'Geist, sans-serif',
                          }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tickCount={6}
                          tick={{
                            fontSize: 12,
                            fontFamily: 'Geist, sans-serif',
                            fontWeight: 500,
                            fill: '#131d5333',
                          }}
                        />

                        <Tooltip
                          cursor={false}
                          content={({ payload, label }) => {
                            if (!payload || payload.length === 0) return null
                            return (
                              <Box
                                bg="white"
                                shadow="md"
                                p={3}
                                borderRadius="md"
                                fontSize="xs"
                              >
                                <Text
                                  fontWeight="medium"
                                  mb={2}
                                  fontSize="sm"
                                  color="#131D53"
                                >
                                  {label}
                                </Text>
                                {payload.map((item, index) => (
                                  <Flex
                                    key={index}
                                    justify="space-between"
                                    gap={4}
                                    color="#131D53"
                                  >
                                    <Flex gap={1.5} align="center">
                                      <Box
                                        border={
                                          item.name === 'linksGerados'
                                            ? '1px solid'
                                            : 'none'
                                        }
                                        borderColor={
                                          item.name === 'linksGerados'
                                            ? '#99ADFF'
                                            : 'transparent'
                                        }
                                        bg={
                                          item.name === 'linksGerados'
                                            ? '#D9E7FF'
                                            : 'transparent'
                                        }
                                        bgGradient={
                                          item.name !== 'linksGerados'
                                            ? 'linear(to-b, #5898FF, #9EC3FF)'
                                            : undefined
                                        }
                                        borderRadius="4px"
                                        w={5}
                                        h={3.5}
                                      />
                                      <Text fontSize="xs" color="#131D5399">
                                        {item.name === 'linksGerados'
                                          ? 'Links Gerados'
                                          : 'Cliques'}
                                      </Text>
                                    </Flex>
                                    <Text color="#131D53" fontSize="xs">
                                      {typeof item.value === 'number'
                                        ? item.value.toLocaleString()
                                        : item.value}
                                    </Text>
                                  </Flex>
                                ))}
                              </Box>
                            )
                          }}
                        />

                        <Bar
                          dataKey="linksGerados"
                          fill="#D9E7FF"
                          radius={[4, 4, 2, 2]}
                          animationBegin={0}
                          animationDuration={1500}
                          animationEasing="ease-in-out"
                        />

                        <Bar
                          dataKey="cliques"
                          fill="url(#cliquesGradient)"
                          radius={[4, 4, 2, 2]}
                          animationBegin={0}
                          animationDuration={1500}
                          animationEasing="ease-in-out"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </VStack>

              <Box border="1px solid" borderColor="#dee6f2" borderRadius="md">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <Flex
                      key={index}
                      maxH="38px"
                      align="center"
                      justify="space-between"
                      py={3}
                      borderTop={index > 0 ? '1px solid' : 'none'}
                      borderTopColor="#dee6f2"
                    >
                      <Skeleton height="12px" width="120px" ml={4} />
                      <Skeleton height="14px" width="50px" mr={4} />
                    </Flex>
                  ))
                ) : statisticsData ? (
                  <>
                    <Flex
                      maxH="38px"
                      align="center"
                      justify="space-between"
                      py={3}
                    >
                      <Text fontSize="xs" color="#131d5399" pl={4}>
                        Novos pedidos
                      </Text>
                      <Text fontSize="sm" color="#131d53" pr={4}>
                        {formatNumber(statisticsData.new_orders)}
                      </Text>
                    </Flex>
                    <Flex
                      maxH="38px"
                      align="center"
                      justify="space-between"
                      py={3}
                      borderTop="1px solid"
                      borderTopColor="#dee6f2"
                    >
                      <Text fontSize="xs" color="#131d5399" pl={4}>
                        Aguardando pagamento
                      </Text>
                      <Text fontSize="sm" color="#131d53" pr={4}>
                        {formatNumber(statisticsData.orders_awaiting)}
                      </Text>
                    </Flex>
                    <Flex
                      maxH="38px"
                      align="center"
                      justify="space-between"
                      py={3}
                      borderTop="1px solid"
                      borderTopColor="#dee6f2"
                    >
                      <Text fontSize="xs" color="#131d5399" pl={4}>
                        Pagamentos aprovados
                      </Text>
                      <Text fontSize="sm" color="#131d53" pr={4}>
                        {formatNumber(statisticsData.orders_approved)}
                      </Text>
                    </Flex>
                    <Flex
                      maxH="38px"
                      align="center"
                      justify="space-between"
                      py={3}
                      borderTop="1px solid"
                      borderTopColor="#dee6f2"
                    >
                      <Text fontSize="xs" color="#131d5399" pl={4}>
                        Em processamento
                      </Text>
                      <Text fontSize="sm" color="#131d53" pr={4}>
                        {formatNumber(statisticsData.orders_in_progress)}
                      </Text>
                    </Flex>
                    <Flex
                      maxH="38px"
                      align="center"
                      justify="space-between"
                      py={3}
                      borderTop="1px solid"
                      borderTopColor="#dee6f2"
                    >
                      <Text fontSize="xs" color="#131d5399" pl={4}>
                        Pedidos concluídos
                      </Text>
                      <Text fontSize="sm" color="#131d53" pr={4}>
                        {formatNumber(statisticsData.orders_completed)}
                      </Text>
                    </Flex>
                    <Flex
                      maxH="38px"
                      align="center"
                      justify="space-between"
                      py={3}
                      borderTop="1px solid"
                      borderTopColor="#dee6f2"
                    >
                      <Text fontSize="xs" color="#131d5399" pl={4}>
                        Pedidos cancelados
                      </Text>
                      <Text fontSize="sm" color="#131d53" pr={4}>
                        {formatNumber(statisticsData.orders_canceled)}
                      </Text>
                    </Flex>
                  </>
                ) : null}
              </Box>
            </VStack>
          </Box>

          <Flex
            flexDirection="column"
            gap={3}
            p={3}
            pb={4}
            border="1px solid"
            borderColor="#dee6f2"
            bg="white"
            borderRadius="xl"
            overflow="hidden"
            className="container-shadow"
          >
            <Flex justify="space-between" align="center" px={3}>
              <Text fontSize="sm" color="#131d53">
                Rankings
              </Text>

              <Box w="auto" h="32px">
                <Flex
                  bg="#F7FAFC"
                  borderRadius={6}
                  border="1px solid #DEE6F2"
                  overflow="hidden"
                >
                  <Button
                    h="32px"
                    px={3}
                    py="6px"
                    borderRadius={6}
                    border="none"
                    fontSize="sm"
                    fontWeight={400}
                    lineHeight="120%"
                    fontFamily="Geist"
                    bg={rankingTab === 'afiliados' ? 'white' : 'transparent'}
                    color={rankingTab === 'afiliados' ? '#131D53' : '#131D5399'}
                    bgGradient={
                      rankingTab === 'afiliados'
                        ? 'linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)'
                        : undefined
                    }
                    shadow={
                      rankingTab === 'afiliados'
                        ? '0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset'
                        : 'none'
                    }
                    _hover={{
                      bg: rankingTab === 'afiliados' ? undefined : '#EDF2F7',
                      bgGradient:
                        rankingTab === 'afiliados'
                          ? 'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)'
                          : undefined,
                      shadow:
                        rankingTab === 'afiliados'
                          ? '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset'
                          : undefined,
                    }}
                    onClick={() => setRankingTab('afiliados')}
                  >
                    Afiliados
                  </Button>

                  <Button
                    h="32px"
                    px={3}
                    py="6px"
                    borderRadius={6}
                    border="none"
                    fontSize="sm"
                    fontWeight={400}
                    lineHeight="120%"
                    fontFamily="Geist"
                    bg={rankingTab === 'produtos' ? 'white' : 'transparent'}
                    color={rankingTab === 'produtos' ? '#131D53' : '#131D5399'}
                    bgGradient={
                      rankingTab === 'produtos'
                        ? 'linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)'
                        : undefined
                    }
                    shadow={
                      rankingTab === 'produtos'
                        ? '0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset'
                        : 'none'
                    }
                    _hover={{
                      bg: rankingTab === 'produtos' ? undefined : '#EDF2F7',
                      bgGradient:
                        rankingTab === 'produtos'
                          ? 'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)'
                          : undefined,
                      shadow:
                        rankingTab === 'produtos'
                          ? '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset'
                          : undefined,
                    }}
                    onClick={() => setRankingTab('produtos')}
                  >
                    Produtos
                  </Button>
                </Flex>
              </Box>
            </Flex>
            <Box
              position="relative"
              border="1px solid"
              borderColor="#DEE6F2"
              borderRadius="md"
            >
              <Box>
                <Box overflowX="auto">
                  <Box minW="700px">
                    {rankingTab === 'produtos' ? (
                      <TableContainer>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th
                                px={4}
                                color="#131d53"
                                fontSize="xs"
                                textTransform="none"
                                fontWeight="normal"
                              >
                                Pos.
                              </Th>
                              <Th
                                px={4}
                                color="#131d53"
                                fontSize="xs"
                                textTransform="none"
                                fontWeight="normal"
                              >
                                Produto
                              </Th>
                              <Th
                                px={4}
                                color="#131d53"
                                fontSize="xs"
                                textTransform="none"
                                fontWeight="normal"
                              >
                                Categoria
                              </Th>
                              <Th
                                px={4}
                                color="#131d53"
                                fontSize="xs"
                                textTransform="none"
                                fontWeight="normal"
                                textAlign="center"
                              >
                                Comissão
                              </Th>
                              <Th
                                px={4}
                                color="#131d53"
                                fontSize="xs"
                                textTransform="none"
                                fontWeight="normal"
                              >
                                Preço
                              </Th>
                              <Th px={8} w={{ base: '86px', md: 'auto' }} />
                            </Tr>
                          </Thead>
                          <Tbody>
                            {productsLoading ? (
                              Array.from({ length: 5 }).map((_, index) => (
                                <Tr key={index}>
                                  <Td px={4}>
                                    <Skeleton width="24px" height="24px" />
                                  </Td>
                                  <Td px={4}>
                                    <HStack gap={3}>
                                      <Skeleton
                                        width="40px"
                                        height="40px"
                                        borderRadius="4px"
                                      />
                                      <Skeleton height="14px" width="200px" />
                                    </HStack>
                                  </Td>
                                  <Td px={4}>
                                    <Skeleton height="14px" width="100px" />
                                  </Td>
                                  <Td px={4}>
                                    <Skeleton
                                      height="14px"
                                      width="60px"
                                      mx="auto"
                                    />
                                  </Td>
                                  <Td px={4}>
                                    <Skeleton
                                      height="14px"
                                      width="80px"
                                      ml="auto"
                                    />
                                  </Td>
                                  <Td px={4}>
                                    <Skeleton
                                      height="32px"
                                      width="200px"
                                      display={{ base: 'none', md: 'block' }}
                                    />
                                  </Td>
                                </Tr>
                              ))
                            ) : productsData?.products &&
                              productsData.products.length > 0 ? (
                              productsData.products.map((product, index) => {
                                const position = index + 1
                                return (
                                  <Tr
                                    key={product.id}
                                    _hover={{ bg: '#F3F6FA' }}
                                    borderTop="1px solid #DEE6F2"
                                    _first={{ borderTop: 'none' }}
                                  >
                                    <Td px={4}>
                                      <Text
                                        fontSize="sm"
                                        color="#131D53"
                                        fontWeight="600"
                                      >
                                        {position}º
                                      </Text>
                                    </Td>
                                    <Td px={4}>
                                      <HStack gap={3}>
                                        <Box
                                          w="40px"
                                          h="40px"
                                          border="1px solid #E6E6E6"
                                          borderRadius="4px"
                                          overflow="hidden"
                                          bg="white"
                                          display="flex"
                                          alignItems="center"
                                          justifyContent="center"
                                          flexShrink={0}
                                        >
                                          <Image
                                            src={product.image}
                                            alt={product.name}
                                            width={40}
                                            height={40}
                                            style={{ objectFit: 'contain' }}
                                          />
                                        </Box>
                                        <Text
                                          fontSize="sm"
                                          color="#131D53"
                                          noOfLines={2}
                                          maxW="250px"
                                        >
                                          {product.name}
                                        </Text>
                                      </HStack>
                                    </Td>
                                    <Td px={4}>
                                      <Text
                                        fontSize="sm"
                                        color="#131D5399"
                                        noOfLines={1}
                                        maxW="250px"
                                      >
                                        {product.category || 'Sem categoria'}
                                      </Text>
                                    </Td>
                                    <Td px={4} textAlign="center">
                                      <Flex justify="center">
                                        <ShimmerBadge
                                          icon="/assets/icons/extra-commission.svg"
                                          percentage={formatPercentage(
                                            product.commission
                                          )}
                                        />
                                      </Flex>
                                    </Td>
                                    <Td px={4}>
                                      <Text fontSize="sm" color="#131D53">
                                        {formatCurrency(
                                          typeof product.price === 'string'
                                            ? parseFloat(product.price)
                                            : product.price
                                        )}
                                      </Text>
                                    </Td>
                                    <Td px={4}>
                                      <Flex
                                        align="center"
                                        justify="end"
                                        display={{ base: 'none', md: 'flex' }}
                                      >
                                        <Button
                                          onClick={() =>
                                            handleToggleFeatured(
                                              product.id,
                                              product.featured || false
                                            )
                                          }
                                          isDisabled={
                                            togglingProductId === product.id
                                          }
                                          size="sm"
                                          fontSize="14px"
                                          fontWeight="500"
                                          h="32px"
                                          px="12px"
                                          py="6px"
                                          borderRadius="6px 0 0 6px"
                                          color={
                                            product.featured
                                              ? '#fff'
                                              : '#131D53'
                                          }
                                          bgGradient={
                                            product.featured
                                              ? 'linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)'
                                              : 'linear-gradient(180deg, #fff 47.86%, #fff 123.81%)'
                                          }
                                          shadow={
                                            product.featured
                                              ? '0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset'
                                              : '0px 0px 0px 1px #DEE6F2 inset, 0px 0px 0px 2px #fff inset'
                                          }
                                          _hover={{
                                            bgGradient: product.featured
                                              ? 'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)'
                                              : 'linear-gradient(180deg, #fbfbfb 47.86%, #fbfbfb 123.81%)',
                                            shadow: product.featured
                                              ? '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset'
                                              : '0px 0px 0px 1px #DEE6F2 inset, 0px 0px 0px 2px #fff inset',
                                          }}
                                          transition="all 0.2s ease"
                                          rightIcon={
                                            product.featured ? (
                                              <Star size={14} fill="#fff" />
                                            ) : (
                                              <Star size={14} />
                                            )
                                          }
                                        >
                                          {product.featured
                                            ? 'Destacado'
                                            : 'Destacar'}
                                        </Button>
                                        <Button
                                          onClick={() =>
                                            handleViewProduct(product.url)
                                          }
                                          bg="white"
                                          color="#131D53"
                                          fontSize="14px"
                                          fontWeight="500"
                                          h="32px"
                                          px="12px"
                                          py="6px"
                                          borderTop="1px solid #DEE6F2"
                                          borderRight="1px solid #DEE6F2"
                                          borderBottom="1px solid #DEE6F2"
                                          borderLeft="1px solid transparent"
                                          borderRadius="0 6px 6px 0"
                                          _hover={{ bg: 'gray.50' }}
                                          rightIcon={<Eye size={14} />}
                                          iconSpacing="6px"
                                        >
                                          Ver produto
                                        </Button>
                                      </Flex>

                                      <Box
                                        className="absolute w-[86px] h-15 right-0 bg-button-white-gradient flex items-center justify-end -translate-y-1/2 "
                                        display={{ base: 'flex', md: 'none' }}
                                      >
                                        <Menu placement="auto" strategy="fixed">
                                          <MenuButton
                                            as={IconButton}
                                            w={9}
                                            h={7}
                                            mr={3}
                                            aria-label="Options"
                                            icon={<Ellipsis size={18} />}
                                            className="flex items-center justify-center bg-button-gradient"
                                            rounded="md"
                                            color="#131D53"
                                            _hover={{
                                              bg: 'linear-gradient(to-r, #61abc9, #1f39c4)',
                                            }}
                                          />
                                          <Portal>
                                            <MenuList
                                              bg="white"
                                              border="1px solid"
                                              borderColor="gray.200"
                                              borderRadius="md"
                                              boxShadow="xl"
                                              minW="150px"
                                            >
                                              <MenuItem
                                                icon={
                                                  product.featured ? (
                                                    <Star
                                                      size={16}
                                                      fill="#131D53"
                                                    />
                                                  ) : (
                                                    <Star size={16} />
                                                  )
                                                }
                                                onClick={() =>
                                                  handleToggleFeatured(
                                                    product.id,
                                                    product.featured || false
                                                  )
                                                }
                                                isDisabled={
                                                  togglingProductId ===
                                                  product.id
                                                }
                                                fontSize="sm"
                                                _hover={{ bg: 'gray.100' }}
                                              >
                                                {product.featured
                                                  ? 'Remover destaque'
                                                  : 'Destacar produto'}
                                              </MenuItem>
                                              <MenuItem
                                                icon={<Eye size={16} />}
                                                onClick={() =>
                                                  handleViewProduct(product.url)
                                                }
                                                fontSize="sm"
                                                _hover={{ bg: 'gray.100' }}
                                              >
                                                Ver produto
                                              </MenuItem>
                                            </MenuList>
                                          </Portal>
                                        </Menu>
                                      </Box>
                                    </Td>
                                  </Tr>
                                )
                              })
                            ) : (
                              <Tr>
                                <Td colSpan={6}>
                                  <Flex py={8} justify="center">
                                    <Text color="#131D5399" fontSize="sm">
                                      Nenhum produto encontrado
                                    </Text>
                                  </Flex>
                                </Td>
                              </Tr>
                            )}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <TableContainer>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th
                                px={4}
                                color="#131d53"
                                fontSize="xs"
                                textTransform="none"
                                fontWeight="normal"
                              >
                                Pos.
                              </Th>
                              <Th
                                px={4}
                                color="#131d53"
                                fontSize="xs"
                                textTransform="none"
                                fontWeight="normal"
                              >
                                Afiliado
                              </Th>
                              <Th
                                px={4}
                                color="#131d53"
                                fontSize="xs"
                                textTransform="none"
                                fontWeight="normal"
                              >
                                Cidade
                              </Th>
                              <Th
                                px={4}
                                color="#131d53"
                                fontSize="xs"
                                textTransform="none"
                                fontWeight="normal"
                                textAlign="center"
                              >
                                Vendas
                              </Th>
                              <Th
                                px={4}
                                color="#131d53"
                                fontSize="xs"
                                textTransform="none"
                                fontWeight="normal"
                                isNumeric
                              >
                                Comissão
                              </Th>
                              <Th px={8} w={{ base: '86px', md: 'auto' }} />
                            </Tr>
                          </Thead>
                          <Tbody>
                            {rankingLoading ? (
                              Array.from({ length: 5 }).map((_, index) => (
                                <Tr key={index}>
                                  <Td px={4}>
                                    <Skeleton
                                      width="24px"
                                      height="24px"
                                      borderRadius="full"
                                    />
                                  </Td>
                                  <Td px={4}>
                                    <HStack gap={3}>
                                      <Skeleton
                                        width="32px"
                                        height="32px"
                                        borderRadius="full"
                                      />
                                      <Skeleton height="14px" width="150px" />
                                    </HStack>
                                  </Td>
                                  <Td px={4}>
                                    <Skeleton height="14px" width="80px" />
                                  </Td>
                                  <Td px={4}>
                                    <Skeleton
                                      height="14px"
                                      width="40px"
                                      mx="auto"
                                    />
                                  </Td>
                                  <Td px={4}>
                                    <Skeleton
                                      height="14px"
                                      width="100px"
                                      ml="auto"
                                    />
                                  </Td>
                                  <Td px={4}>
                                    <Skeleton
                                      height="32px"
                                      width="180px"
                                      display={{ base: 'none', md: 'block' }}
                                    />
                                  </Td>
                                </Tr>
                              ))
                            ) : ranking.length > 0 ? (
                              ranking.map((affiliate, index) => {
                                const position = index + 1
                                return (
                                  <Tr
                                    key={affiliate.id}
                                    _hover={{ bg: '#F3F6FA' }}
                                    borderTop="1px solid #DEE6F2"
                                    _first={{ borderTop: 'none' }}
                                  >
                                    <Td px={4}>
                                      <Flex
                                        align="center"
                                        justify="center"
                                        w="24px"
                                        h="24px"
                                        borderRadius="full"
                                        bg={
                                          position === 1
                                            ? '#FFD700'
                                            : position === 2
                                            ? '#C0C0C0'
                                            : position === 3
                                            ? '#CD7F32'
                                            : 'transparent'
                                        }
                                        color={
                                          position <= 3 ? 'white' : '#131D53'
                                        }
                                        fontWeight={
                                          position <= 3 ? '600' : '400'
                                        }
                                        fontSize="sm"
                                      >
                                        {position}º
                                      </Flex>
                                    </Td>
                                    <Td px={4}>
                                      <HStack gap={3}>
                                        <Avatar
                                          size="sm"
                                          name={affiliate.name}
                                          src={affiliate.avatar || undefined}
                                        />
                                        <Text
                                          fontSize="sm"
                                          color="#131D53"
                                          noOfLines={1}
                                        >
                                          {affiliate.name}
                                        </Text>
                                      </HStack>
                                    </Td>
                                    <Td px={4}>
                                      <Text
                                        fontSize="sm"
                                        color="#131D5399"
                                        noOfLines={1}
                                      >
                                        {affiliate.city || 'N/A'}
                                      </Text>
                                    </Td>
                                    <Td px={4} textAlign="center">
                                      <Text fontSize="sm" color="#131D53">
                                        {affiliate.total_sales}
                                      </Text>
                                    </Td>
                                    <Td px={4} isNumeric>
                                      <Text fontSize="sm" color="#131D53">
                                        {formatCurrency(
                                          parseFloat(affiliate.total_amount)
                                        )}
                                      </Text>
                                    </Td>
                                    <Td px={4}>
                                      <Flex
                                        align="center"
                                        justify="end"
                                        display={{ base: 'none', md: 'flex' }}
                                      >
                                        <Button
                                          onClick={() =>
                                            handleViewLinks(
                                              affiliate.id,
                                              affiliate.name
                                            )
                                          }
                                          bg="white"
                                          color="#131D53"
                                          fontSize="14px"
                                          fontWeight="500"
                                          h="32px"
                                          px="12px"
                                          py="6px"
                                          border="1px solid #DEE6F2"
                                          borderRadius="6px 0 0 6px"
                                          _hover={{ bg: 'gray.50' }}
                                          rightIcon={<Link2 size={14} />}
                                          iconSpacing="6px"
                                        >
                                          Ver links
                                        </Button>
                                        <Button
                                          onClick={() =>
                                            handleEditProfile(affiliate.id)
                                          }
                                          bg="white"
                                          color="#131D53"
                                          fontSize="14px"
                                          fontWeight="500"
                                          h="32px"
                                          px="12px"
                                          py="6px"
                                          borderTop="1px solid #DEE6F2"
                                          borderRight="1px solid #DEE6F2"
                                          borderBottom="1px solid #DEE6F2"
                                          borderLeft="1px solid transparent"
                                          borderRadius="0 6px 6px 0"
                                          _hover={{ bg: 'gray.50' }}
                                          rightIcon={<Settings size={14} />}
                                          iconSpacing="6px"
                                        >
                                          Editar perfil
                                        </Button>
                                      </Flex>

                                      <Box
                                        className="absolute w-[86px] h-15 right-0 bg-button-white-gradient flex items-center justify-end -translate-y-1/2 "
                                        display={{ base: 'flex', md: 'none' }}
                                      >
                                        <Menu placement="auto" strategy="fixed">
                                          <MenuButton
                                            as={IconButton}
                                            w={9}
                                            h={7}
                                            mr={3}
                                            aria-label="Options"
                                            icon={<Ellipsis size={18} />}
                                            className="flex items-center justify-center bg-button-gradient"
                                            rounded="md"
                                            color="#131D53"
                                            _hover={{
                                              bg: 'linear-gradient(to-r, #61abc9, #1f39c4)',
                                            }}
                                          />
                                          <Portal>
                                            <MenuList
                                              bg="white"
                                              border="1px solid"
                                              borderColor="gray.200"
                                              borderRadius="md"
                                              boxShadow="xl"
                                              minW="150px"
                                            >
                                              <MenuItem
                                                icon={<Link2 size={16} />}
                                                onClick={() =>
                                                  handleViewLinks(
                                                    affiliate.id,
                                                    affiliate.name
                                                  )
                                                }
                                                fontSize="sm"
                                                _hover={{ bg: 'gray.100' }}
                                              >
                                                Ver links
                                              </MenuItem>
                                              <MenuItem
                                                icon={<Settings size={16} />}
                                                onClick={() =>
                                                  handleEditProfile(
                                                    affiliate.id
                                                  )
                                                }
                                                fontSize="sm"
                                                _hover={{ bg: 'gray.100' }}
                                              >
                                                Editar perfil
                                              </MenuItem>
                                            </MenuList>
                                          </Portal>
                                        </Menu>
                                      </Box>
                                    </Td>
                                  </Tr>
                                )
                              })
                            ) : (
                              <Tr>
                                <Td colSpan={6}>
                                  <Flex py={8} justify="center">
                                    <Text color="#131D5399" fontSize="sm">
                                      Nenhum afiliado encontrado
                                    </Text>
                                  </Flex>
                                </Td>
                              </Tr>
                            )}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Flex>
        </PageContent>

        <Modal isOpen={isOpen} onClose={handleCustomDateCancel} size="xs">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Selecionar Período Personalizado</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    mb={2}
                    color="gray.700"
                  >
                    Data de Início
                  </Text>
                  <Input
                    type="date"
                    value={tempDateRange.start_date}
                    onChange={(e) =>
                      setTempDateRange((prev) => ({
                        ...prev,
                        start_date: e.target.value,
                      }))
                    }
                    max={tempDateRange.end_date}
                  />
                </Box>
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    mb={2}
                    color="gray.700"
                  >
                    Data de Fim
                  </Text>
                  <Input
                    type="date"
                    value={tempDateRange.end_date}
                    onChange={(e) =>
                      setTempDateRange((prev) => ({
                        ...prev,
                        end_date: e.target.value,
                      }))
                    }
                    min={tempDateRange.start_date}
                  />
                </Box>
                <Divider />
                <Box bg="blue.50" p={3} borderRadius="md">
                  <Text fontSize="xs" color="blue.700">
                    <strong>Período selecionado:</strong>{' '}
                    {formatDateSafe(tempDateRange.start_date)} até{' '}
                    {formatDateSafe(tempDateRange.end_date)}
                  </Text>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={handleCustomDateCancel}>
                  Cancelar
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleCustomDateConfirm}
                  disabled={
                    !tempDateRange.start_date || !tempDateRange.end_date
                  }
                >
                  Aplicar Filtro
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {selectedAffiliate && (
          <AffiliateLinksModal
            isOpen={isLinksModalOpen}
            onClose={onLinksModalClose}
            affiliateId={selectedAffiliate.id}
            affiliateName={selectedAffiliate.name}
          />
        )}

        {selectedAffiliateForEdit && (
          <EditAffiliateProfileModal
            isOpen={isEditProfileModalOpen}
            onClose={onEditProfileModalClose}
            affiliateId={selectedAffiliateForEdit.id}
            affiliateName={selectedAffiliateForEdit.name}
            affiliateEmail={selectedAffiliateForEdit.email}
            affiliatePhone={selectedAffiliateForEdit.phone}
            affiliateAvatar={selectedAffiliateForEdit.avatar}
            affiliateBirthdate={selectedAffiliateForEdit.birthdate}
            affiliateParentName={selectedAffiliateForEdit.parent_name}
            affiliateParentId={selectedAffiliateForEdit.parent_id}
            affiliateSocialNetwork={selectedAffiliateForEdit.social_network}
            affiliateBusinessName={selectedAffiliateForEdit.business_name}
            affiliateCpf={selectedAffiliateForEdit.cpf}
            affiliateBusinessCnpj={selectedAffiliateForEdit.business_cnpj}
            affiliateCustomCommission={
              selectedAffiliateForEdit.custom_commission
            }
            affiliateCanHaveReferrals={
              selectedAffiliateForEdit.can_have_referrals
            }
            availableParents={selectedAffiliateForEdit.available_parents}
            onSave={handleSaveEditProfile}
          />
        )}
      </AppLayout>
    </>
  )
}
