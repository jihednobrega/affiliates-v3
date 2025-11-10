'use client'

import Head from 'next/head'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Box,
  Flex,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  VStack,
  Skeleton,
  Button,
  IconButton,
  Portal,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import { Trophy, Search, Link2, Settings, Ellipsis } from 'lucide-react'
import { Pagination } from '@/components/UI'
import { useAffiliatesRank } from '@/hooks/useAffiliatesRank'
import { formatCurrency } from '@/utils/formatToCurrency'
import { AffiliateLinksModal } from '@/components/Modals/AffiliateLinksModal'
import { EditAffiliateProfileModal } from '@/components/Modals'
import { useDisclosure } from '@chakra-ui/react'
import { periodToDateRange, customDateToRange } from '@/utils/periodUtils'

const PERIOD_OPTIONS = [
  { value: '', label: 'Desde Sempre' },
  { value: 'current_month', label: 'Mês Atual' },
  { value: 'last_month', label: 'Mês Anterior' },
  { value: 'last_3_months', label: 'Últimos 3 Meses' },
  { value: 'last_6_months', label: 'Últimos 6 Meses' },
  { value: 'current_year', label: 'Ano Atual' },
  { value: 'custom', label: 'Outros' },
]

function RankingLoadingSkeleton() {
  return (
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
          Top Afiliados
        </Text>
      </Flex>

      <Box
        border="1px solid #DEE6F2"
        borderRadius="md"
        overflow="hidden"
        position="relative"
      >
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th px={4} fontSize="xs">
                  <Skeleton height="12px" width="40px" />
                </Th>
                <Th px={4} fontSize="xs">
                  <Skeleton height="12px" width="60px" />
                </Th>
                <Th px={4} fontSize="xs">
                  <Skeleton height="12px" width="50px" />
                </Th>
                <Th px={4} fontSize="xs">
                  <Skeleton height="12px" width="50px" />
                </Th>
                <Th px={4} fontSize="xs">
                  <Skeleton height="12px" width="70px" />
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <Tr key={i} borderTop="1px solid #DEE6F2">
                  <Td px={4}>
                    <Skeleton height="24px" width="24px" borderRadius="full" />
                  </Td>
                  <Td px={4}>
                    <HStack gap={3}>
                      <Skeleton
                        height="32px"
                        width="32px"
                        borderRadius="full"
                      />
                      <Skeleton height="16px" width="120px" />
                    </HStack>
                  </Td>
                  <Td px={4}>
                    <Skeleton height="16px" width="140px" />
                  </Td>
                  <Td px={4}>
                    <Skeleton height="16px" width="40px" mx="auto" />
                  </Td>
                  <Td px={4}>
                    <Skeleton height="16px" width="90px" ml="auto" />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}

export default function BrandRankingPage() {
  const toast = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [searchName, setSearchName] = useState('')
  const [searchCity, setSearchCity] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [customDateRange, setCustomDateRange] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  })
  const [tempDateRange, setTempDateRange] = useState(customDateRange)

  const [debouncedSearchName, setDebouncedSearchName] = useState('')
  const [debouncedSearchCity, setDebouncedSearchCity] = useState('')

  const {
    isOpen: isCustomDateModalOpen,
    onOpen: onCustomDateModalOpen,
    onClose: onCustomDateModalClose,
  } = useDisclosure()

  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false)
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchName(searchName)
      setDebouncedSearchCity(searchCity)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchName, searchCity])

  const convertedPeriod =
    selectedPeriod === 'custom'
      ? customDateToRange(customDateRange.start_date, customDateRange.end_date)
      : selectedPeriod
      ? periodToDateRange(selectedPeriod) || undefined
      : undefined

  const {
    data: ranking,
    loading,
    error,
    meta,
    refetch,
  } = useAffiliatesRank({
    page: currentPage,
    perpage: itemsPerPage,
    period: convertedPeriod,
    name: debouncedSearchName || undefined,
    city: debouncedSearchCity || undefined,
  })

  const selectedPeriodLabel =
    selectedPeriod === 'custom'
      ? `${formatDateSafe(customDateRange.start_date)} - ${formatDateSafe(
          customDateRange.end_date
        )}`
      : PERIOD_OPTIONS.find((option) => option.value === selectedPeriod)
          ?.label || 'Desde Sempre'

  function formatDateSafe(dateString: string) {
    try {
      const [year, month, day] = dateString.split('-')
      return `${day}/${month}/${year}`
    } catch {
      return dateString
    }
  }

  const handlePeriodSelect = (period: string) => {
    if (period === 'custom') {
      onCustomDateModalOpen()
    } else {
      setSelectedPeriod(period)
      setCurrentPage(1)
    }
  }

  const handleConfirmCustomDate = () => {
    setCustomDateRange(tempDateRange)
    setSelectedPeriod('custom')
    setCurrentPage(1)
    onCustomDateModalClose()
  }

  const handleCancelCustomDate = () => {
    setTempDateRange(customDateRange)
    onCustomDateModalClose()
  }

  const totalPages = meta?.last_page || 1
  const startItem = meta ? (meta.current_page - 1) * meta.pagesize + 1 : 1
  const endItem = meta
    ? Math.min(meta.current_page * meta.pagesize, meta.total_items)
    : ranking.length

  const handleViewLinks = (affiliateId: number, affiliateName: string) => {
    setSelectedAffiliate({ id: affiliateId, name: affiliateName })
    setIsLinksModalOpen(true)
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

        refetch()
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
        <title>Ranking de Afiliados | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Box display="flex" flexDirection="column" gap={4} w="full">
            <Flex justifyContent="space-between" align="center">
              <Flex gap={2} align="center">
                <Trophy size={24} color="#131D53" />
                <Text fontSize="sm" color="#131D53">
                  Ranking de Afiliados
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
                        selectedPeriod === option.value
                          ? 'blue.50'
                          : 'transparent'
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
            </Flex>

            <VStack spacing={3} align="stretch">
              <Flex gap={3} display={{ base: 'none', md: 'flex' }}>
                <HStack
                  h={8}
                  position="relative"
                  rounded={4}
                  borderWidth={1}
                  borderColor="#DEE6F2"
                  gap={0}
                  transition="all 0.2s"
                  flex="1"
                  _focusWithin={{
                    borderColor: '#1F70F1',
                    boxShadow: '0 0 0 1px #1F70F1',
                    bg: 'white',
                  }}
                >
                  <HStack
                    justify="center"
                    p={2}
                    w="32px"
                    h="32px"
                    borderRightWidth={1}
                    borderRightColor="#dee6f2"
                  >
                    <Search color="#C5CDDC" size={16} />
                  </HStack>
                  <Input
                    p={2}
                    variant="unstyled"
                    placeholder="Buscar por nome"
                    border="none"
                    flex="1"
                    minW="fit-content"
                    fontSize="sm"
                    _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </HStack>

                <HStack
                  h={8}
                  position="relative"
                  rounded={4}
                  borderWidth={1}
                  borderColor="#DEE6F2"
                  gap={0}
                  transition="all 0.2s"
                  flex="1"
                  _focusWithin={{
                    borderColor: '#1F70F1',
                    boxShadow: '0 0 0 1px #1F70F1',
                    bg: 'white',
                  }}
                >
                  <HStack
                    justify="center"
                    p={2}
                    w="32px"
                    h="32px"
                    borderRightWidth={1}
                    borderRightColor="#dee6f2"
                  >
                    <Search color="#C5CDDC" size={16} />
                  </HStack>
                  <Input
                    p={2}
                    variant="unstyled"
                    placeholder="Buscar por cidade"
                    border="none"
                    flex="1"
                    minW="fit-content"
                    fontSize="sm"
                    _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                  />
                </HStack>
              </Flex>

              <Flex
                gap={3}
                flexDirection="column"
                display={{ base: 'flex', md: 'none' }}
              >
                <HStack
                  h={10}
                  position="relative"
                  rounded={4}
                  borderWidth={1}
                  borderColor="#DEE6F2"
                  gap={0}
                  transition="all 0.2s"
                  _focusWithin={{
                    borderColor: '#1F70F1',
                    boxShadow: '0 0 0 1px #1F70F1',
                    bg: 'white',
                  }}
                >
                  <HStack
                    justify="center"
                    p={2}
                    w="38px"
                    h="38px"
                    borderRightWidth={1}
                    borderRightColor="#dee6f2"
                  >
                    <Search color="#C5CDDC" size={20} />
                  </HStack>
                  <Input
                    p={2}
                    variant="unstyled"
                    placeholder="Buscar por nome"
                    border="none"
                    flex="1"
                    fontSize="sm"
                    _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </HStack>

                <HStack
                  h={10}
                  position="relative"
                  rounded={4}
                  borderWidth={1}
                  borderColor="#DEE6F2"
                  gap={0}
                  transition="all 0.2s"
                  _focusWithin={{
                    borderColor: '#1F70F1',
                    boxShadow: '0 0 0 1px #1F70F1',
                    bg: 'white',
                  }}
                >
                  <HStack
                    justify="center"
                    p={2}
                    w="38px"
                    h="38px"
                    borderRightWidth={1}
                    borderRightColor="#dee6f2"
                  >
                    <Search color="#C5CDDC" size={20} />
                  </HStack>
                  <Input
                    p={2}
                    variant="unstyled"
                    placeholder="Buscar por cidade"
                    border="none"
                    flex="1"
                    fontSize="sm"
                    _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                  />
                </HStack>
              </Flex>
            </VStack>
          </Box>
        </PageHeader>

        <PageContent>
          {loading ? (
            <RankingLoadingSkeleton />
          ) : error ? (
            <Box textAlign="center" py={8} color="red.500">
              <Text>Erro ao carregar ranking: {error}</Text>
            </Box>
          ) : (
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
                  Top Afiliados
                </Text>
              </Flex>

              {ranking.length > 0 ? (
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
                          {ranking.map((affiliate, index) => {
                            const position =
                              (currentPage - 1) * itemsPerPage + index + 1
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
                                    color={position <= 3 ? 'white' : '#131D53'}
                                    fontWeight={position <= 3 ? '600' : '400'}
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
                                              handleEditProfile(affiliate.id)
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
                          })}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Box>

                  <Flex
                    justify="space-between"
                    align="center"
                    px={3}
                    pt={2}
                    flexDirection={{ base: 'column', md: 'row' }}
                    gap={{ base: 2, md: 0 }}
                  >
                    <Text fontSize="sm" color="#131D5399">
                      Mostrando {startItem}-{endItem} de{' '}
                      {meta?.total_items || 0} afiliados
                    </Text>

                    {totalPages > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    )}
                  </Flex>
                </>
              ) : (
                <Box textAlign="center" py={12}>
                  <VStack spacing={4}>
                    <Box
                      w="64px"
                      h="64px"
                      bg="#F7FAFC"
                      borderRadius="50%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Trophy size={32} color="#A0AEC0" />
                    </Box>
                    <VStack spacing={2}>
                      <Text fontSize="lg" fontWeight="600" color="#131D53">
                        Nenhum afiliado no ranking
                      </Text>
                      <Text
                        fontSize="sm"
                        color="#131D5399"
                        maxW="400px"
                        textAlign="center"
                      >
                        Os afiliados com melhor desempenho aparecerão aqui.
                      </Text>
                    </VStack>
                  </VStack>
                </Box>
              )}
            </Box>
          )}
        </PageContent>
      </AppLayout>

      {selectedAffiliate && (
        <AffiliateLinksModal
          isOpen={isLinksModalOpen}
          onClose={() => setIsLinksModalOpen(false)}
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
          affiliateCustomCommission={selectedAffiliateForEdit.custom_commission}
          affiliateCanHaveReferrals={
            selectedAffiliateForEdit.can_have_referrals
          }
          availableParents={selectedAffiliateForEdit.available_parents}
          onSave={handleSaveEditProfile}
        />
      )}

      <Modal
        isOpen={isCustomDateModalOpen}
        onClose={handleCancelCustomDate}
        isCentered
      >
        <ModalOverlay />
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader
            fontSize="lg"
            fontWeight="semibold"
            color="#131D53"
            borderBottom="1px solid"
            borderColor="#dee6f2"
          >
            Selecionar Período Personalizado
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="sm" color="#131D53" mb={2} fontWeight="500">
                  Data Inicial
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
                  size="md"
                  borderColor="#DEE6F2"
                  _hover={{ borderColor: '#1F70F1' }}
                  _focus={{
                    borderColor: '#1F70F1',
                    boxShadow: '0 0 0 1px #1F70F1',
                  }}
                />
              </Box>

              <Box>
                <Text fontSize="sm" color="#131D53" mb={2} fontWeight="500">
                  Data Final
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
                  size="md"
                  borderColor="#DEE6F2"
                  _hover={{ borderColor: '#1F70F1' }}
                  _focus={{
                    borderColor: '#1F70F1',
                    boxShadow: '0 0 0 1px #1F70F1',
                  }}
                />
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter
            borderTop="1px solid"
            borderColor="#dee6f2"
            gap={3}
            pt={4}
          >
            <Button
              onClick={handleCancelCustomDate}
              bg="white"
              color="#131D53"
              fontSize="14px"
              fontWeight="500"
              h="32px"
              px="16px"
              border="1px solid #DEE6F2"
              borderRadius="6px"
              _hover={{ bg: 'gray.50' }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmCustomDate}
              bg="#1F70F1"
              color="white"
              fontSize="14px"
              fontWeight="500"
              h="32px"
              px="16px"
              borderRadius="6px"
              _hover={{ bg: '#1557C0' }}
            >
              Aplicar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
