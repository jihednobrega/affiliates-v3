'use client'

import Head from 'next/head'
import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
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
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  Badge,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  VStack,
  FormControl,
  FormLabel,
  useDisclosure,
  Skeleton,
  useToast,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import { Ticket, Plus, Ellipsis, Edit2, Trash2, Search } from 'lucide-react'
import {
  Pagination,
  EmptyState,
  ErrorState,
  AffiliateAutocomplete,
  type AffiliateOption,
} from '@/components/UI'
import { useCoupons } from '@/hooks/useCoupons'
import { useAffiliates } from '@/hooks/useAffiliates'
import { CouponData } from '@/services/types/coupons.types'

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
}

function CouponsLoadingSkeleton() {
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
          Lista de Cupons
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
                  <Skeleton height="12px" width="60px" />
                </Th>
                <Th px={4} fontSize="xs">
                  <Skeleton height="12px" width="70px" />
                </Th>
                <Th px={4} fontSize="xs">
                  <Skeleton height="12px" width="80px" />
                </Th>
                <Th px={4} fontSize="xs">
                  <Skeleton height="12px" width="50px" />
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <Tr key={i} borderTop="1px solid #DEE6F2">
                  <Td px={4}>
                    <Skeleton height="24px" width="100px" borderRadius="6px" />
                  </Td>
                  <Td px={4}>
                    <Skeleton height="16px" width="140px" />
                  </Td>
                  <Td px={4}>
                    <Skeleton height="16px" width="90px" />
                  </Td>
                  <Td px={4}>
                    <Flex align="center" justify="end" gap={0}>
                      <Skeleton
                        height="32px"
                        width="80px"
                        borderRadius="6px 0 0 6px"
                      />
                      <Skeleton
                        height="32px"
                        width="80px"
                        borderRadius="0 6px 6px 0"
                      />
                    </Flex>
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

export default function BrandCouponsPage() {
  const toast = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [couponSearch, setCouponSearch] = useState('')
  const [affiliateSearch, setAffiliateSearch] = useState('')
  const [debouncedCouponSearch, setDebouncedCouponSearch] = useState('')
  const [debouncedAffiliateSearch, setDebouncedAffiliateSearch] = useState('')
  const itemsPerPage = 10

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCouponSearch(couponSearch)
      setDebouncedAffiliateSearch(affiliateSearch)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [couponSearch, affiliateSearch])

  const {
    data: coupons,
    loading,
    error,
    retry,
    meta,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCoupons({
    page: currentPage,
    perpage: itemsPerPage,
    coupon: debouncedCouponSearch || undefined,
    affiliate: debouncedAffiliateSearch || undefined,
  })

  const { data: affiliatesData, loading: loadingAffiliates } = useAffiliates({
    page: 1,
    perpage: 1000,
    listOnly: true,
  })

  const affiliatesList: AffiliateOption[] = useMemo(() => {
    return affiliatesData.map((affiliate) => ({
      id: affiliate.id,
      name: affiliate.name,
      avatar: affiliate.avatar,
    }))
  }, [affiliatesData])

  const {
    isOpen: isCreateCouponOpen,
    onOpen: onCreateCouponOpen,
    onClose: onCreateCouponClose,
  } = useDisclosure()
  const [couponCode, setCouponCode] = useState('')
  const [selectedAffiliate, setSelectedAffiliate] = useState('')
  const [selectedAffiliateName, setSelectedAffiliateName] = useState('')

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure()
  const [editingCoupon, setEditingCoupon] = useState<CouponData | null>(null)
  const [editingAffiliateName, setEditingAffiliateName] = useState('')

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()
  const [deletingCoupon, setDeletingCoupon] = useState<CouponData | null>(null)

  const uniqueAffiliates = Array.from(
    new Set(coupons.map((c) => ({ id: c.user_id, name: c.user_name })))
  )

  const startItem = meta ? (meta.current_page - 1) * itemsPerPage + 1 : 0
  const endItem = meta
    ? Math.min(meta.current_page * itemsPerPage, meta.total_items)
    : 0

  const handleCreateCoupon = () => {
    setCouponCode('')
    setSelectedAffiliate('')
    setSelectedAffiliateName('')
    onCreateCouponOpen()
  }

  const handleAffiliateChange = (
    affiliateId: string,
    affiliateName: string
  ) => {
    setSelectedAffiliate(affiliateId)
    setSelectedAffiliateName(affiliateName)
  }

  const handleSaveCoupon = async () => {
    try {
      if (!couponCode.trim()) {
        toast({
          title: 'Código do cupom é obrigatório',
          status: 'error',
          duration: 3000,
        })
        return
      }

      if (!selectedAffiliate) {
        toast({
          title: 'Selecione um afiliado',
          status: 'error',
          duration: 3000,
        })
        return
      }

      const isDuplicate = coupons.some(
        (c) => c.coupon.toLowerCase() === couponCode.trim().toLowerCase()
      )

      if (isDuplicate) {
        toast({
          title: 'Código do cupom já existe',
          description: 'Escolha um código diferente.',
          status: 'error',
          duration: 3000,
        })
        return
      }

      await createCoupon({
        user_id: parseInt(selectedAffiliate),
        coupon: couponCode.toUpperCase().trim(),
      })

      onCreateCouponClose()
      setCouponCode('')
      setSelectedAffiliate('')
    } catch (error) {
      console.error('Erro ao criar cupom:', error)
    }
  }

  const handleEditCoupon = (coupon: CouponData) => {
    setEditingCoupon(coupon)
    setCouponCode(coupon.coupon)
    setSelectedAffiliate(String(coupon.user_id))
    setEditingAffiliateName(coupon.user_name)
    onEditOpen()
  }

  const handleEditingAffiliateChange = (
    affiliateId: string,
    affiliateName: string
  ) => {
    setSelectedAffiliate(affiliateId)
    setEditingAffiliateName(affiliateName)
  }

  const handleUpdateCoupon = async () => {
    if (!editingCoupon) return

    try {
      if (!couponCode.trim()) {
        toast({
          title: 'Código do cupom é obrigatório',
          status: 'error',
          duration: 3000,
        })
        return
      }

      if (!selectedAffiliate) {
        toast({
          title: 'Selecione um afiliado',
          status: 'error',
          duration: 3000,
        })
        return
      }

      const isDuplicate = coupons.some(
        (c) =>
          c.id !== editingCoupon.id &&
          c.coupon.toLowerCase() === couponCode.trim().toLowerCase()
      )

      if (isDuplicate) {
        toast({
          title: 'Código do cupom já existe',
          description: 'Escolha um código diferente.',
          status: 'error',
          duration: 3000,
        })
        return
      }

      await updateCoupon({
        id: editingCoupon.id,
        user_id: parseInt(selectedAffiliate),
        coupon: couponCode.toUpperCase().trim(),
      })

      onEditClose()
      setEditingCoupon(null)
      setCouponCode('')
      setSelectedAffiliate('')
    } catch (error) {
      console.error('Erro ao atualizar cupom:', error)
    }
  }

  const handleDeleteCoupon = (coupon: CouponData) => {
    setDeletingCoupon(coupon)
    onDeleteOpen()
  }

  const handleConfirmDelete = async () => {
    if (!deletingCoupon) return

    try {
      await deleteCoupon({ id: deletingCoupon.id })

      onDeleteClose()
      setDeletingCoupon(null)
    } catch (error) {
      console.error('Erro ao deletar cupom:', error)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  if (loading && coupons.length === 0) {
    return (
      <>
        <Head>
          <title>Cupons | Affiliates</title>
        </Head>
        <AppLayout>
          <PageHeader>
            <Flex gap={2} align="center">
              <Ticket size={24} color="#131D53" />
              <Text fontSize="sm" color="#131D53">
                Cupons
              </Text>
            </Flex>
          </PageHeader>
          <PageContent>
            <CouponsLoadingSkeleton />
          </PageContent>
        </AppLayout>
      </>
    )
  }

  if (error && coupons.length === 0) {
    return (
      <>
        <Head>
          <title>Cupons | Affiliates</title>
        </Head>
        <AppLayout>
          <PageHeader>
            <Flex gap={2} align="center">
              <Ticket size={24} color="#131D53" />
              <Text fontSize="sm" color="#131D53">
                Cupons
              </Text>
            </Flex>
          </PageHeader>
          <PageContent>
            <ErrorState
              description="Não foi possível carregar os cupons. Verifique sua conexão e tente novamente."
              onRetry={retry}
            />
          </PageContent>
        </AppLayout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Cupons | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Box display="flex" flexDirection="column" gap={4} w="full">
            <Flex justify="space-between" align="center">
              <Flex gap={2} align="center">
                <Ticket size={24} color="#131D53" />
                <HStack fontSize="sm" color="#131D53">
                  <Text>Cupons:</Text>
                  <Box
                    alignContent="center"
                    justifyContent="center"
                    bgColor="#DFEFFF"
                    px={2}
                    py={0.5}
                    rounded={4}
                    lineHeight="120%"
                  >
                    {meta?.total_items || 0}
                  </Box>
                </HStack>
              </Flex>

              <Button
                size="sm"
                fontSize="xs"
                fontWeight={500}
                px={3}
                py={1.5}
                leftIcon={<Plus size={14} />}
                color="#fff"
                bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
                shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                _hover={{
                  bgGradient:
                    'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                  shadow:
                    '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                }}
                transition="all 0.2s ease"
                onClick={handleCreateCoupon}
              >
                Adicionar Cupom
              </Button>
            </Flex>

            <Flex gap={3} flexDirection={{ base: 'column', md: 'row' }}>
              <HStack
                h={{ base: 10, md: 8 }}
                position="relative"
                rounded={4}
                borderWidth={1}
                borderColor="#DEE6F2"
                gap={0}
                transition="all 0.2s"
                flex={1}
                _focusWithin={{
                  borderColor: '#1F70F1',
                  boxShadow: '0 0 0 1px #1F70F1',
                  bg: 'white',
                }}
              >
                <HStack
                  justify="center"
                  p={2}
                  w={{ base: '38px', md: '32px' }}
                  h={{ base: '38px', md: '32px' }}
                  borderRightWidth={1}
                  borderRightColor="#dee6f2"
                >
                  <Box display={{ base: 'block', md: 'none' }}>
                    <Search color="#C5CDDC" size={20} />
                  </Box>
                  <Box display={{ base: 'none', md: 'block' }}>
                    <Search color="#C5CDDC" size={16} />
                  </Box>
                </HStack>
                <Input
                  p={2}
                  variant="unstyled"
                  placeholder="Buscar por código do cupom"
                  border="none"
                  flex="1"
                  minW="fit-content"
                  fontSize={{ base: 'sm', md: 'sm' }}
                  _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                  value={couponSearch}
                  onChange={(e) => setCouponSearch(e.target.value)}
                />
              </HStack>

              <HStack
                h={{ base: 10, md: 8 }}
                position="relative"
                rounded={4}
                borderWidth={1}
                borderColor="#DEE6F2"
                gap={0}
                transition="all 0.2s"
                flex={1}
                _focusWithin={{
                  borderColor: '#1F70F1',
                  boxShadow: '0 0 0 1px #1F70F1',
                  bg: 'white',
                }}
              >
                <HStack
                  justify="center"
                  p={2}
                  w={{ base: '38px', md: '32px' }}
                  h={{ base: '38px', md: '32px' }}
                  borderRightWidth={1}
                  borderRightColor="#dee6f2"
                >
                  <Box display={{ base: 'block', md: 'none' }}>
                    <Search color="#C5CDDC" size={20} />
                  </Box>
                  <Box display={{ base: 'none', md: 'block' }}>
                    <Search color="#C5CDDC" size={16} />
                  </Box>
                </HStack>
                <Input
                  p={2}
                  variant="unstyled"
                  placeholder="Buscar por nome do afiliado"
                  border="none"
                  flex="1"
                  minW="fit-content"
                  fontSize={{ base: 'sm', md: 'sm' }}
                  _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                  value={affiliateSearch}
                  onChange={(e) => setAffiliateSearch(e.target.value)}
                />
              </HStack>
            </Flex>
          </Box>
        </PageHeader>

        <PageContent>
          {coupons.length === 0 ? (
            <EmptyState
              icon={Ticket}
              title="Nenhum cupom encontrado"
              description={
                debouncedCouponSearch || debouncedAffiliateSearch
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando seu primeiro cupom de desconto.'
              }
            />
          ) : (
            /* Card de Lista de Cupons */
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
              <Flex
                justify="space-between"
                flexDirection={{ base: 'column', md: 'row' }}
                gap={{ base: 3, md: 0 }}
              >
                <Text fontSize="sm" color="#131d53" pl={3}>
                  Lista de Cupons
                </Text>
              </Flex>

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
                            Cupom
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
                            Criado em
                          </Th>
                          <Th
                            px={8}
                            w={{ base: '86px', md: 'auto' }}
                            color="#131d53"
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                          ></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {coupons.map((coupon) => (
                          <Tr
                            key={coupon.id}
                            _hover={{ bg: '#F3F6FA' }}
                            borderTop="1px solid #DEE6F2"
                            _first={{ borderTop: 'none' }}
                          >
                            <Td px={4}>
                              <Badge
                                colorScheme="gray"
                                fontSize="xs"
                                px={2}
                                py={1}
                                borderRadius="6px"
                                textTransform="none"
                                fontWeight="500"
                              >
                                {coupon.coupon}
                              </Badge>
                            </Td>
                            <Td px={4}>
                              <Text fontSize="sm" color="#131D53" noOfLines={1}>
                                {coupon.user_name}
                              </Text>
                            </Td>
                            <Td px={4}>
                              <Text
                                fontSize="sm"
                                color="#131D5399"
                                noOfLines={1}
                              >
                                {formatDate(coupon.created_at)}
                              </Text>
                            </Td>
                            <Td px={4}>
                              <Flex
                                align="center"
                                justify="end"
                                display={{ base: 'none', md: 'flex' }}
                              >
                                <Button
                                  onClick={() => handleEditCoupon(coupon)}
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
                                  rightIcon={<Edit2 size={14} />}
                                  iconSpacing="6px"
                                >
                                  Editar
                                </Button>
                                <Button
                                  onClick={() => handleDeleteCoupon(coupon)}
                                  bg="white"
                                  color="red.500"
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
                                  _hover={{
                                    bg: '#FEE',
                                    borderTop: '1px solid #feb2b2',
                                    borderRight: '1px solid #feb2b2',
                                    borderBottom: '1px solid #feb2b2',
                                    borderLeft: '1px solid #feb2b2',
                                  }}
                                  rightIcon={<Trash2 size={14} />}
                                  iconSpacing="6px"
                                >
                                  Excluir
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
                                        icon={<Edit2 size={16} />}
                                        onClick={() => handleEditCoupon(coupon)}
                                        fontSize="sm"
                                        _hover={{ bg: 'gray.100' }}
                                      >
                                        Editar
                                      </MenuItem>
                                      <MenuItem
                                        icon={<Trash2 size={16} />}
                                        onClick={() =>
                                          handleDeleteCoupon(coupon)
                                        }
                                        fontSize="sm"
                                        color="red.500"
                                        _hover={{ bg: 'red.50' }}
                                      >
                                        Excluir
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
                      Mostrando {startItem}-{endItem} de{' '}
                      {meta?.total_items || 0} cupons
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
                      Mostrando {startItem}-{endItem} de{' '}
                      {meta?.total_items || 0} cupons
                    </Text>

                    {meta && meta.last_page > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={meta.last_page}
                        onPageChange={setCurrentPage}
                      />
                    )}
                  </Flex>

                  {meta && meta.last_page > 1 && (
                    <Box pt={2} display={{ base: 'block', md: 'none' }}>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={meta.last_page}
                        onPageChange={setCurrentPage}
                      />
                    </Box>
                  )}
                </>
              </>
            </Box>
          )}
        </PageContent>

        <Modal
          isOpen={isCreateCouponOpen}
          onClose={onCreateCouponClose}
          size="md"
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              fontSize="md"
              fontWeight="600"
              color="#131D53"
              borderBottom="1px solid #DEE6F2"
            >
              Adicionar Novo Cupom
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={6}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" color="#131D53" mb={2}>
                    Cupom *
                  </FormLabel>
                  <Input
                    placeholder="Digite o código do cupom"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    borderColor="#DEE6F2"
                    _hover={{ borderColor: '#C5CDDC' }}
                    _focus={{
                      borderColor: '#1F70F1',
                      boxShadow: '0 0 0 1px #1F70F1',
                    }}
                  />
                </FormControl>

                <AffiliateAutocomplete
                  value={selectedAffiliateName}
                  onChange={handleAffiliateChange}
                  affiliates={affiliatesList}
                  placeholder="Digite o nome do afiliado"
                  label="Afiliado *"
                />
              </VStack>
            </ModalBody>

            <ModalFooter borderTop="1px solid #DEE6F2">
              <HStack spacing={3}>
                <Button
                  size="md"
                  fontSize="sm"
                  fontWeight={500}
                  px={6}
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  color="#131D53"
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                  }}
                  onClick={onCreateCouponClose}
                >
                  Cancelar
                </Button>
                <Button
                  size="md"
                  fontSize="sm"
                  fontWeight={500}
                  px={6}
                  color="#fff"
                  bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
                  shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                  }}
                  onClick={handleSaveCoupon}
                  isDisabled={!couponCode || !selectedAffiliate}
                  isLoading={isCreating}
                >
                  Criar Cupom
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={isEditOpen} onClose={onEditClose} size="md" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              fontSize="md"
              fontWeight="600"
              color="#131D53"
              borderBottom="1px solid #DEE6F2"
            >
              Editar Cupom
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={6}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" color="#131D53" mb={2}>
                    Cupom *
                  </FormLabel>
                  <Input
                    placeholder="Digite o código do cupom"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    borderColor="#DEE6F2"
                    _hover={{ borderColor: '#C5CDDC' }}
                    _focus={{
                      borderColor: '#1F70F1',
                      boxShadow: '0 0 0 1px #1F70F1',
                    }}
                  />
                </FormControl>

                <AffiliateAutocomplete
                  value={editingAffiliateName}
                  onChange={handleEditingAffiliateChange}
                  affiliates={affiliatesList}
                  placeholder="Digite o nome do afiliado"
                  label="Afiliado *"
                />
              </VStack>
            </ModalBody>

            <ModalFooter borderTop="1px solid #DEE6F2">
              <HStack spacing={3}>
                <Button
                  size="md"
                  fontSize="sm"
                  fontWeight={500}
                  px={6}
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  color="#131D53"
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                  }}
                  onClick={onEditClose}
                >
                  Cancelar
                </Button>
                <Button
                  size="md"
                  fontSize="sm"
                  fontWeight={500}
                  px={6}
                  color="#fff"
                  bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
                  shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                  }}
                  onClick={handleUpdateCoupon}
                  isDisabled={!couponCode || !selectedAffiliate}
                  isLoading={isUpdating}
                >
                  Salvar Alterações
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          size="sm"
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              fontSize="md"
              fontWeight="600"
              color="#131D53"
              borderBottom="1px solid #DEE6F2"
            >
              Confirmar Exclusão
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={6}>
              <Text fontSize="sm" color="#131D53">
                Tem certeza que deseja excluir o cupom{' '}
                <Text as="span" fontWeight="bold">
                  {deletingCoupon?.coupon}
                </Text>
                ?
              </Text>
              <Text mt={2} fontSize="sm" color="#131D5399">
                Esta ação não pode ser desfeita.
              </Text>
            </ModalBody>

            <ModalFooter borderTop="1px solid #DEE6F2">
              <HStack spacing={3}>
                <Button
                  size="md"
                  fontSize="sm"
                  fontWeight={500}
                  px={6}
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  color="#131D53"
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                  }}
                  onClick={onDeleteClose}
                >
                  Cancelar
                </Button>
                <Button
                  size="md"
                  fontSize="sm"
                  fontWeight={500}
                  px={6}
                  colorScheme="red"
                  onClick={handleConfirmDelete}
                  isLoading={isDeleting}
                >
                  Excluir
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </AppLayout>
    </>
  )
}
