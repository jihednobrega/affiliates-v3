'use client'

import Head from 'next/head'
import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  VStack,
  IconButton,
  Portal,
  Avatar,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Divider,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import {
  Search,
  Download,
  Calendar,
  Wallet,
  BadgeDollarSign,
  TrendingUp,
  User,
  FileText,
  Ellipsis,
} from 'lucide-react'
import { Pagination } from '@/components/UI'
import { useBrandFinances } from '@/hooks/useBrandFinances'
import { formatCurrency } from '@/utils/formatToCurrency'
import { ExportFinancesModal } from '@/components/Modals/ExportFinancesModal'
import { AffiliateReportModal } from '@/components/Modals/AffiliateReportModal'
import { EditAffiliateProfileModal } from '@/components/Modals'
import { useDisclosure, useToast } from '@chakra-ui/react'
import {
  periodToDateRange,
  customDateToRange,
  formatDateSafe,
} from '@/utils/periodUtils'

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Desde o início' },
  { value: 'current_month', label: 'Mês atual' },
  { value: 'previous_month', label: 'Mês anterior' },
  { value: 'last_3_months', label: 'Últimos 3 meses' },
  { value: 'custom', label: 'Personalizado' },
]

function FinancesLoadingSkeleton() {
  return (
    <>
      <Box className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <Box
            key={i}
            className="p-3 bg-white flex flex-col gap-3 border border-[#dee6f2] rounded-xl container-shadow"
          >
            <HStack gap={3}>
              <Skeleton width="24px" height="24px" borderRadius="sm" />
              <Skeleton height="14px" flex={1} />
            </HStack>
            <Skeleton height="20px" width="120px" />
          </Box>
        ))}
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        gap={3}
        p={3}
        pb={4}
        border="1px solid #DEE6F2"
        bg="white"
        borderRadius="xl"
        overflow="hidden"
        className="container-shadow"
      >
        <Flex justify="space-between" align="center">
          <Skeleton height="20px" width="100px" />
          <Skeleton height="32px" width="100px" />
        </Flex>

        <Box border="1px solid #DEE6F2" borderRadius="md" overflow="hidden">
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
                    Afiliado
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
                  >
                    Comissões
                  </Th>
                  <Th px={8} />
                </Tr>
              </Thead>
              <Tbody>
                {[...Array(5)].map((_, i) => (
                  <Tr
                    key={i}
                    borderTop="1px solid #DEE6F2"
                    _first={{ borderTop: 'none' }}
                  >
                    <Td px={4}>
                      <HStack spacing={2}>
                        <Skeleton
                          width="32px"
                          height="32px"
                          borderRadius="full"
                        />
                        <Box flex={1}>
                          <Skeleton height="16px" width="150px" mb={1} />
                          <Skeleton height="14px" width="200px" />
                        </Box>
                      </HStack>
                    </Td>
                    <Td px={4} textAlign="center">
                      <Skeleton height="16px" width="80px" mx="auto" />
                    </Td>
                    <Td px={4} textAlign="right">
                      <Skeleton height="16px" width="80px" ml="auto" />
                    </Td>
                    <Td px={4}>
                      <Skeleton height="32px" width="180px" ml="auto" />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </>
  )
}

export default function BrandFinancesPage() {
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [customDateRange, setCustomDateRange] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  })
  const [tempDateRange, setTempDateRange] = useState(customDateRange)

  const {
    isOpen: isExportModalOpen,
    onOpen: onExportModalOpen,
    onClose: onExportModalClose,
  } = useDisclosure()

  const {
    isOpen: isCustomPeriodModalOpen,
    onOpen: onCustomPeriodModalOpen,
    onClose: onCustomPeriodModalClose,
  } = useDisclosure()

  const {
    isOpen: isReportModalOpen,
    onOpen: onReportModalOpen,
    onClose: onReportModalClose,
  } = useDisclosure()

  const {
    isOpen: isEditProfileModalOpen,
    onOpen: onEditProfileModalOpen,
    onClose: onEditProfileModalClose,
  } = useDisclosure()

  const [selectedAffiliate, setSelectedAffiliate] = useState<{
    id: number
    name: string
    avatar?: string
  } | null>(null)

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

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const periodForApi = useMemo(() => {
    if (selectedPeriod === 'all') {
      return undefined
    }
    if (selectedPeriod === 'custom') {
      return customDateToRange(
        customDateRange.start_date,
        customDateRange.end_date
      )
    }
    return periodToDateRange(selectedPeriod) || undefined
  }, [selectedPeriod, customDateRange])

  const {
    data: finances,
    loading,
    error,
    meta,
    brandPeriods,
    totalSales,
    totalAffiliatesSales,
    commissions,
    daysToBill,
  } = useBrandFinances({
    page: currentPage,
    perpage: itemsPerPage,
    period: periodForApi,
    name: debouncedSearchTerm || undefined,
  })

  const totalPages = meta?.last_page || 1

  const startItem = meta ? (meta.current_page - 1) * meta.pagesize + 1 : 1
  const endItem = meta
    ? Math.min(meta.current_page * meta.pagesize, meta.total_items)
    : finances.length
  const totalItems = meta?.total_items || finances.length

  const selectedPeriodLabel = useMemo(() => {
    if (selectedPeriod === 'custom') {
      const startDate = formatDateSafe(customDateRange.start_date)
      const endDate = formatDateSafe(customDateRange.end_date)
      return `${startDate} - ${endDate}`
    }
    return (
      brandPeriods?.[selectedPeriod] ||
      PERIOD_OPTIONS.find((opt) => opt.value === selectedPeriod)?.label ||
      'Desde o início'
    )
  }, [selectedPeriod, customDateRange, brandPeriods])

  const handlePeriodSelect = (periodKey: string) => {
    if (periodKey === 'custom') {
      setTempDateRange(customDateRange)
      onCustomPeriodModalOpen()
    } else {
      setSelectedPeriod(periodKey)
    }
  }

  const handleCustomDateConfirm = () => {
    setCustomDateRange(tempDateRange)
    setSelectedPeriod('custom')
    onCustomPeriodModalClose()
  }

  const handleCustomDateCancel = () => {
    setTempDateRange(customDateRange)
    onCustomPeriodModalClose()
  }

  const handleExport = () => {
    onExportModalOpen()
  }

  const handleViewProfile = async (affiliateId: number) => {
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

  const handleViewReport = (affiliate: any) => {
    setSelectedAffiliate({
      id: affiliate.id,
      name: affiliate.name,
      avatar: affiliate.avatar,
    })
    onReportModalOpen()
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

  return (
    <>
      <Head>
        <title>Financeiro | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Box w="full">
            <VStack spacing={3} align="stretch">
              <Flex gap={2} align="center">
                <BadgeDollarSign size={24} color="#131D53" />
                <Text fontSize="sm" color="#131D53">
                  Financeiro
                </Text>
              </Flex>

              <HStack spacing={2} w="full">
                <HStack
                  flex={1}
                  h={{ base: '40px', md: '34px' }}
                  borderWidth={1}
                  borderColor="#DEE6F2"
                  borderRadius="md"
                  px={3}
                  bg="white"
                  _focusWithin={{
                    borderColor: '#1F70F1',
                    boxShadow: '0 0 0 1px #1F70F1',
                  }}
                >
                  <Search size={16} color="#131D5399" />
                  <Input
                    placeholder="Pesquisar por afiliado"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    border="none"
                    px={0}
                    h="full"
                    fontSize="sm"
                    _focus={{ boxShadow: 'none' }}
                    _placeholder={{ color: '#131D5399' }}
                  />
                </HStack>

                <Menu>
                  <MenuButton
                    as={Button}
                    size="sm"
                    fontSize="xs"
                    fontWeight={500}
                    h={{ base: '40px', md: '34px' }}
                    px={3}
                    leftIcon={<Calendar size={14} />}
                    bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                    shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                    color="#131D53"
                    _hover={{
                      bgGradient:
                        'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                      shadow:
                        '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                    }}
                    transition="all 0.2s ease"
                  >
                    {selectedPeriodLabel}
                  </MenuButton>
                  <MenuList>
                    {PERIOD_OPTIONS.map((option) => (
                      <MenuItem
                        key={option.value}
                        onClick={() => handlePeriodSelect(option.value)}
                        bg={
                          selectedPeriod === option.value
                            ? 'blue.50'
                            : 'transparent'
                        }
                        color={
                          selectedPeriod === option.value
                            ? 'blue.600'
                            : 'inherit'
                        }
                        fontSize="sm"
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </HStack>
            </VStack>
          </Box>
        </PageHeader>

        <PageContent>
          {loading ? (
            <FinancesLoadingSkeleton />
          ) : error ? (
            <Box textAlign="center" py={8} color="red.500">
              <Text>Erro ao carregar finanças: {error}</Text>
            </Box>
          ) : (
            <>
              <Box className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Box className="p-3 bg-white flex flex-col gap-3 border border-[#dee6f2] rounded-xl container-shadow">
                  <HStack gap={3}>
                    <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm">
                      <Wallet size={16} color="#1F70F1" />
                    </Box>
                    <Text className="text-xs text-[#131d5399]">
                      Total Faturado com a Affiliates
                    </Text>
                  </HStack>
                  <Text className="text-sm text-[#131d53]">
                    {totalSales
                      ? formatCurrency(parseFloat(totalSales))
                      : 'R$ 0,00'}
                  </Text>
                </Box>

                <Box className="p-3 bg-white flex flex-col gap-3 border border-[#dee6f2] rounded-xl container-shadow">
                  <HStack gap={3}>
                    <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm">
                      <TrendingUp size={16} color="#1F70F1" />
                    </Box>
                    <Text className="text-xs text-[#131d5399]">
                      Vendas Faturadas no período
                    </Text>
                  </HStack>
                  <Text className="text-sm text-[#131d53]">
                    {totalAffiliatesSales
                      ? formatCurrency(parseFloat(totalAffiliatesSales))
                      : 'R$ 0,00'}
                  </Text>
                </Box>

                <Box className="p-3 bg-white flex flex-col gap-3 border border-[#dee6f2] rounded-xl container-shadow">
                  <HStack gap={3}>
                    <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm">
                      <BadgeDollarSign size={16} color="#1F70F1" />
                    </Box>
                    <Text className="text-xs text-[#131d5399]">
                      Comissões Faturadas
                    </Text>
                  </HStack>
                  <Text className="text-sm text-[#131d53]">
                    {commissions
                      ? formatCurrency(parseFloat(commissions))
                      : 'R$ 0,00'}
                  </Text>
                </Box>

                <Box className="p-3 bg-white flex flex-col gap-3 border border-[#dee6f2] rounded-xl container-shadow">
                  <HStack gap={3}>
                    <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm">
                      <Calendar size={16} color="#1F70F1" />
                    </Box>
                    <Text className="text-xs text-[#131d5399]">
                      Próxima Fatura
                    </Text>
                  </HStack>
                  <Text className="text-sm text-[#131d53]">
                    {daysToBill !== undefined ? `${daysToBill} dias` : 'N/A'}
                  </Text>
                </Box>
              </Box>

              <Box
                display="flex"
                flexDirection="column"
                gap={3}
                p={3}
                pb={4}
                border="1px solid #DEE6F2"
                bg="white"
                borderRadius="xl"
                overflow="hidden"
                className="container-shadow"
              >
                <Flex justify="space-between" align="center">
                  <Text fontSize="sm" color="#131d53" pl={3}>
                    Comissões
                  </Text>
                  <HStack spacing={2} pl={3}>
                    <Button
                      size="sm"
                      fontSize="xs"
                      fontWeight={500}
                      px={3}
                      py={1.5}
                      leftIcon={<Download size={16} />}
                      bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                      shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                      color="#131D53"
                      onClick={handleExport}
                      isDisabled={!finances.length}
                      opacity={!finances.length ? 0.5 : 1}
                      cursor={!finances.length ? 'not-allowed' : 'pointer'}
                      _hover={{
                        bgGradient:
                          'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                        shadow:
                          '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                      }}
                    >
                      Exportar
                    </Button>
                  </HStack>
                </Flex>

                {finances.length > 0 ? (
                  <>
                    <Box
                      border="1px solid #DEE6F2"
                      borderRadius="md"
                      overflow="auto"
                      position="relative"
                    >
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
                                Afiliado
                              </Th>
                              <Th
                                px={4}
                                color="#131d53"
                                fontSize="xs"
                                textTransform="none"
                                fontWeight="normal"
                              >
                                Vendas
                              </Th>
                              <Th
                                px={4}
                                color="#131d53"
                                fontSize="xs"
                                textTransform="none"
                                fontWeight="normal"
                              >
                                Comissões
                              </Th>
                              <Th px={8} />
                            </Tr>
                          </Thead>
                          <Tbody>
                            {finances.map((affiliate) => (
                              <Tr
                                key={affiliate.id}
                                _hover={{ bg: '#F3F6FA' }}
                                borderTop="1px solid #DEE6F2"
                                _first={{ borderTop: 'none' }}
                              >
                                <Td px={4}>
                                  <HStack spacing={2}>
                                    <Avatar
                                      size="sm"
                                      name={affiliate.name}
                                      src={affiliate.avatar || undefined}
                                    />
                                    <VStack align="start" spacing={0}>
                                      <Text
                                        fontSize="sm"
                                        color="#131D53"
                                        noOfLines={1}
                                      >
                                        {affiliate.name}
                                      </Text>
                                      <Text
                                        fontSize="xs"
                                        color="#131D5399"
                                        noOfLines={1}
                                      >
                                        {affiliate.email}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                </Td>
                                <Td px={4}>
                                  <Text fontSize="sm" color="#131D53">
                                    {formatCurrency(
                                      parseFloat(affiliate.total_sales) || 0
                                    )}
                                  </Text>
                                </Td>
                                <Td px={4}>
                                  <Text fontSize="sm" color="#131D53">
                                    {formatCurrency(
                                      parseFloat(affiliate.to_receive) || 0
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
                                        handleViewProfile(affiliate.id)
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
                                      rightIcon={<User size={14} />}
                                      iconSpacing="6px"
                                    >
                                      Ver Perfil
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleViewReport(affiliate)
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
                                      rightIcon={<FileText size={14} />}
                                      iconSpacing="6px"
                                    >
                                      Ver Relatório
                                    </Button>
                                  </Flex>

                                  <Box display={{ base: 'flex', md: 'none' }}>
                                    <Menu placement="auto" strategy="fixed">
                                      <MenuButton
                                        as={IconButton}
                                        w={9}
                                        h={7}
                                        aria-label="Options"
                                        icon={<Ellipsis size={18} />}
                                        bg="white"
                                        border="1px solid #DEE6F2"
                                        borderRadius="md"
                                        color="#131D53"
                                        _hover={{ bg: 'gray.50' }}
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
                                            icon={<User size={16} />}
                                            onClick={() =>
                                              handleViewProfile(affiliate.id)
                                            }
                                            fontSize="sm"
                                            _hover={{ bg: 'gray.100' }}
                                          >
                                            Ver Perfil
                                          </MenuItem>
                                          <MenuItem
                                            icon={<FileText size={16} />}
                                            onClick={() =>
                                              handleViewReport(affiliate)
                                            }
                                            fontSize="sm"
                                            _hover={{ bg: 'gray.100' }}
                                          >
                                            Ver Relatório
                                          </MenuItem>
                                        </MenuList>
                                      </Portal>
                                    </Menu>
                                  </Box>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </Box>

                    <>
                      <Flex
                        justify="flex-end"
                        px={3}
                        pt={2}
                        display={{ base: 'flex', md: 'none' }}
                      >
                        <Text fontSize="xs" color="#131D5399">
                          Mostrando {startItem}-{endItem} de {totalItems}{' '}
                          afiliados
                        </Text>
                      </Flex>

                      <Flex
                        justify="space-between"
                        align="center"
                        px={3}
                        pt={2}
                        display={{ base: 'none', md: 'flex' }}
                      >
                        <Text fontSize="sm" color="#131D5399">
                          Mostrando {startItem}-{endItem} de {totalItems}{' '}
                          afiliados
                        </Text>

                        {totalPages > 1 && (
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                          />
                        )}
                      </Flex>

                      {totalPages > 1 && (
                        <Box pt={2} display={{ base: 'block', md: 'none' }}>
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                          />
                        </Box>
                      )}
                    </>
                  </>
                ) : (
                  <Box textAlign="center" py={8} color="gray.500">
                    <Text>Nenhum afiliado encontrado</Text>
                  </Box>
                )}
              </Box>
            </>
          )}
        </PageContent>

        <Modal
          isOpen={isCustomPeriodModalOpen}
          onClose={handleCustomDateCancel}
          size="xs"
        >
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

        <ExportFinancesModal
          isOpen={isExportModalOpen}
          onClose={onExportModalClose}
          currentPeriod={selectedPeriod}
          brandPeriods={brandPeriods}
          customDateRange={customDateRange}
        />

        {selectedAffiliate && (
          <AffiliateReportModal
            isOpen={isReportModalOpen}
            onClose={onReportModalClose}
            affiliateId={selectedAffiliate.id}
            affiliateName={selectedAffiliate.name}
            affiliateAvatar={selectedAffiliate.avatar}
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
