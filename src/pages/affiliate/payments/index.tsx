import Head from 'next/head'
import { useState, useCallback, useEffect } from 'react'
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
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Image,
  Badge,
  Skeleton,
  SkeletonText,
  useColorModeValue,
  useBreakpointValue,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'

import { useFinances, useFinancesSummary } from '@/hooks/useFinances'
import {
  Search,
  SlidersHorizontal,
  Download,
  Wallet,
  BadgeDollarSign,
  Calendar,
  FileText,
  CreditCard,
} from 'lucide-react'
import { useRouter } from 'next/router'
import { Pagination } from '@/components/UI'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os Status' },
  { value: 'approved', label: 'Pagamento Aprovado' },
  { value: 'awaiting', label: 'Aguardando Pagamento' },
  { value: 'canceled', label: 'Cancelado' },
  { value: 'done', label: 'Completo' },
  { value: 'new', label: 'Novo' },
  { value: 'processing', label: 'Em processamento' },
]

function ProductImage({
  src,
  alt,
  ...props
}: {
  src: string
  alt: string
  [key: string]: any
}) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true)
      setImgSrc('/assets/no-image.png')
    }
  }, [hasError])

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
      fallback={
        <Box
          w="full"
          h="full"
          bg="gray.200"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="xs" color="gray.500">
            IMG
          </Text>
        </Box>
      }
    />
  )
}

export default function PaymentsPage() {
  const router = useRouter()
  const toast = useToast()

  const {
    summary: financialSummary,
    isLoading: isLoadingSummary,
    error: summaryError,
  } = useFinancesSummary()

  const {
    data,
    isLoading: isLoadingCommissions,
    hasError: commissionsError,
    filters,
    setStatus,
    setProduct,
    setPage,
    exportFinances,
  } = useFinances({
    perPage: useBreakpointValue({ base: 10, md: 15 }) || 10,
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  useEffect(() => {
    setProduct(debouncedSearchTerm || undefined)
  }, [debouncedSearchTerm, setProduct])

  const filteredCommissions = data?.commissions || []

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('#DEE6F2', 'gray.600')
  const textColor = useColorModeValue('#131D53', 'white')
  const mutedTextColor = useColorModeValue('#131D5399', 'gray.400')
  const emptyStateBgColor = useColorModeValue('#F7FAFC', 'gray.600')

  const formatPayDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return 'Não informado'
    }
  }

  const formatCurrency = (value: number | string) => {
    if (value === null || value === undefined || value === '') {
      return 'R$ 0,00'
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue)) {
      return 'R$ 0,00'
    }
    return numValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase()
    const statusOption = STATUS_OPTIONS.find(
      (option) => option.value === statusLower
    )
    return statusOption ? statusOption.label : status
  }

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()

    if (statusLower === 'approved' || statusLower === 'done') {
      return 'green'
    }
    if (statusLower === 'processing') {
      return 'blue'
    }
    if (statusLower === 'canceled') {
      return 'red'
    }
    if (statusLower === 'awaiting' || statusLower === 'new') {
      return 'yellow'
    }
    return 'gray'
  }

  const handleExportFinances = async () => {
    try {
      const { response } = await exportFinances(
        undefined,
        undefined,
        filters.product,
        filters.status
      )

      if (response instanceof Blob) {
        const url = window.URL.createObjectURL(response)
        const link = document.createElement('a')
        link.href = url
        link.download = `financas-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setTimeout(() => {
          window.URL.revokeObjectURL(url)
        }, 1000)
      } else {
        throw new Error('Resposta não é um arquivo')
      }
    } catch (error) {
      console.error('Erro ao exportar:', error)
      toast({
        title: 'Erro ao exportar',
        description: 'Tente novamente mais tarde',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleViewStatement = () => {
    router.push('/affiliate/payments/statement')
  }

  const currentStatus = STATUS_OPTIONS.find(
    (option) => option.value === filters.status
  )

  return (
    <>
      <Head>
        <title>Meus Pagamentos | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Box display="flex" flexDirection="column" gap={4} w="full">
            <Flex justifyContent="space-between" align="center">
              <Flex gap={2} align="center">
                <BadgeDollarSign size={24} color="#131D53" />
                <Text fontSize="sm" color="#131D53">
                  Meus Pagamentos
                </Text>
              </Flex>

              {financialSummary && (
                <Button
                  display={{ base: 'none', md: 'flex' }}
                  size="sm"
                  fontSize="xs"
                  fontWeight={500}
                  px={4}
                  py={2}
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
                  isDisabled={
                    !financialSummary ||
                    financialSummary.availableCommissions <
                      financialSummary.minimumWithdrawAmount
                  }
                >
                  Solicitar Saque
                </Button>
              )}

              {financialSummary && (
                <Button
                  display={{ base: 'flex', md: 'none' }}
                  size="sm"
                  fontSize="xs"
                  fontWeight={500}
                  px={3}
                  py={1.5}
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
                  isDisabled={
                    !financialSummary ||
                    financialSummary.availableCommissions <
                      financialSummary.minimumWithdrawAmount
                  }
                >
                  Solicitar Saque
                </Button>
              )}
            </Flex>

            <VStack spacing={3} align="stretch">
              <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
                <HStack
                  flex={1}
                  h="34px"
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
                    w="34px"
                    h="34px"
                    borderRightWidth={1}
                    borderRightColor="#dee6f2"
                  >
                    <Search color="#C5CDDC" size={20} />
                  </HStack>
                  <Input
                    p={2}
                    variant="unstyled"
                    placeholder="Pesquisar por produto ou SKU"
                    flex="1"
                    h="full"
                    _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </HStack>

                <Menu>
                  <MenuButton>
                    <Button
                      rounded={4}
                      size="sm"
                      fontSize="xs"
                      fontWeight={500}
                      px={3}
                      py={1.5}
                      bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                      shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                      color="#131D53"
                      leftIcon={<SlidersHorizontal size={16} />}
                    >
                      {currentStatus?.label || 'Filtrar Status'}
                    </Button>
                  </MenuButton>
                  <MenuList>
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem
                        key={option.value}
                        onClick={() => setStatus(option.value || undefined)}
                        bg={
                          filters.status === option.value
                            ? 'blue.50'
                            : 'transparent'
                        }
                        color={
                          filters.status === option.value
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

                {financialSummary && (
                  <Button
                    size="sm"
                    fontSize="xs"
                    fontWeight={500}
                    px={3}
                    py={1.5}
                    leftIcon={<FileText size={16} />}
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
                    onClick={handleViewStatement}
                  >
                    Ver Extrato
                  </Button>
                )}
              </HStack>

              <HStack
                display={{ base: 'flex', md: 'none' }}
                flex={1}
                h="34px"
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
                  w="34px"
                  h="34px"
                  borderRightWidth={1}
                  borderRightColor="#dee6f2"
                >
                  <Search color="#C5CDDC" size={20} />
                </HStack>
                <Input
                  p={2}
                  variant="unstyled"
                  placeholder="Pesquisar por produto ou SKU"
                  flex="1"
                  h="full"
                  _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </HStack>

              <HStack
                spacing={2}
                display={{ base: 'flex', md: 'none' }}
                w="full"
              >
                <Box flex={1}>
                  <Menu>
                    <MenuButton w="full">
                      <Button
                        w="full"
                        rounded={4}
                        size="sm"
                        fontSize="xs"
                        fontWeight={500}
                        px={3}
                        py={1.5}
                        bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                        shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                        color="#131D53"
                        leftIcon={<SlidersHorizontal size={16} />}
                      >
                        Filtrar Status
                      </Button>
                    </MenuButton>
                    <MenuList>
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem
                          key={option.value}
                          onClick={() => setStatus(option.value || undefined)}
                          bg={
                            filters.status === option.value
                              ? 'blue.50'
                              : 'transparent'
                          }
                          color={
                            filters.status === option.value
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
                </Box>

                {financialSummary && (
                  <Box flex={1}>
                    <Button
                      w="full"
                      size="sm"
                      fontSize="xs"
                      fontWeight={500}
                      px={3}
                      py={1.5}
                      leftIcon={<FileText size={14} />}
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
                      onClick={handleViewStatement}
                    >
                      Ver Extrato
                    </Button>
                  </Box>
                )}
              </HStack>
            </VStack>
          </Box>
        </PageHeader>

        <PageContent>
          {isLoadingSummary ? (
            <Box className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Box
                  key={i}
                  className="p-3 bg-white flex flex-col gap-3 border border-[#dee6f2] rounded-xl container-shadow"
                >
                  <HStack>
                    <Skeleton w="24px" h="24px" borderRadius="4px" />
                    <SkeletonText noOfLines={1} width="80px" />
                  </HStack>
                  <Skeleton height="14px" width="60px" />
                </Box>
              ))}
            </Box>
          ) : (
            financialSummary && (
              <>
                <Box className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Box className="p-3 bg-white flex flex-col gap-3 border border-[#dee6f2] rounded-xl container-shadow">
                    <HStack gap={3}>
                      <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm">
                        <Wallet size={16} color="#1F70F1" />
                      </Box>
                      <Text className="text-xs text-[#131d5399]">
                        Saldo Estimado
                      </Text>
                    </HStack>
                    <Text className="text-sm text-[#131d53]">
                      {formatCurrency(financialSummary?.availableCommissions)}
                    </Text>
                  </Box>

                  <Box className="p-3 bg-white flex flex-col gap-3 border border-[#dee6f2] rounded-xl container-shadow">
                    <HStack gap={3}>
                      <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm">
                        <CreditCard size={16} color="#1F70F1" />
                      </Box>
                      <Text className="text-xs text-[#131d5399]">
                        Saldo Mínimo
                      </Text>
                    </HStack>
                    <Text className="text-sm text-[#131d53]">
                      {formatCurrency(financialSummary?.minimumWithdrawAmount)}
                    </Text>
                  </Box>

                  <Box className="p-3 bg-white flex flex-col gap-3 border border-[#dee6f2] rounded-xl container-shadow">
                    <HStack gap={3}>
                      <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm">
                        <BadgeDollarSign size={16} color="#1F70F1" />
                      </Box>
                      <Text className="text-xs text-[#131d5399]">
                        Vendas Efetuadas
                      </Text>
                    </HStack>
                    <Text className="text-sm text-[#131d53]">
                      {formatCurrency(financialSummary?.totalSales)}
                    </Text>
                  </Box>

                  <Box className="p-3 bg-white flex flex-col gap-3 border border-[#dee6f2] rounded-xl container-shadow">
                    <HStack gap={3}>
                      <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm">
                        <Calendar size={16} color="#1F70F1" />
                      </Box>
                      <Text className="text-xs text-[#131d5399]">
                        Próxima Liberação
                      </Text>
                    </HStack>
                    <Text className="text-sm text-[#131d53]">
                      {financialSummary?.nextPayDate
                        ? formatPayDate(financialSummary.nextPayDate)
                        : 'Não informado'}
                    </Text>
                  </Box>
                </Box>
              </>
            )
          )}

          {(summaryError || commissionsError) && (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>Erro ao carregar dados!</AlertTitle>
                <AlertDescription>
                  Não foi possível carregar suas informações financeiras. Tente
                  novamente mais tarde.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          <Box
            display="flex"
            flexDirection="column"
            gap={3}
            p={3}
            pb={4}
            border="1px solid #DEE6F2"
            bg={bgColor}
            borderRadius="xl"
            overflow="hidden"
            className="container-shadow"
          >
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" color="#131d53" pl={3}>
                Histórico de Comissões
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
                  onClick={handleExportFinances}
                >
                  Exportar
                </Button>
              </HStack>
            </Flex>

            {isLoadingCommissions ? (
              <Box p={4}>
                <Skeleton height="20px" mb={4} />
                {Array.from({ length: 5 }).map((_, i) => (
                  <HStack
                    key={i}
                    spacing={4}
                    py={3}
                    borderBottomWidth={i < 4 ? 1 : 0}
                    borderBottomColor={borderColor}
                  >
                    <Skeleton w="50px" h="50px" borderRadius="8px" />
                    <VStack align="start" spacing={1} flex={1}>
                      <Skeleton height="16px" width="60%" />
                      <Skeleton height="14px" width="40%" />
                    </VStack>
                    <Skeleton height="16px" width="80px" />
                    <Skeleton height="16px" width="80px" />
                    <Skeleton height="20px" width="60px" borderRadius="6px" />
                  </HStack>
                ))}
              </Box>
            ) : filteredCommissions.length > 0 ? (
              <>
                <Box
                  border="1px solid #DEE6F2"
                  borderRadius="md"
                  overflow="scroll"
                  position="relative"
                >
                  <TableContainer>
                    <Table
                      variant="simple"
                      sx={{
                        td: {
                          borderBottom: 'none',
                        },
                      }}
                    >
                      <Thead>
                        <Tr>
                          <Th
                            px={4}
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            color="#131d53"
                          >
                            Produto
                          </Th>
                          <Th
                            px={4}
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            color="#131d53"
                          >
                            ID do Pedido
                          </Th>
                          <Th
                            px={4}
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            color="#131d53"
                          >
                            Última Atualização
                          </Th>
                          <Th
                            px={4}
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            color="#131d53"
                          >
                            Valor do Produto
                          </Th>
                          <Th
                            px={4}
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            color="#131d53"
                          >
                            Cupom
                          </Th>
                          <Th
                            px={4}
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            color="#131d53"
                          >
                            Origem
                          </Th>
                          <Th
                            px={4}
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            color="#131d53"
                          >
                            Comissão
                          </Th>
                          <Th
                            px={4}
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            color="#131d53"
                            textAlign="center"
                          >
                            Status
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody fontSize="xs">
                        {filteredCommissions.map((commission) => (
                          <Tr
                            key={`${commission.id}-${commission.vendor_order_id}`}
                            _hover={{ bg: '#F3F6FA' }}
                            borderTop="1px solid #DEE6F2"
                            _first={{ borderTop: 'none' }}
                          >
                            <Td px={4} maxW="230px">
                              <Flex align="center" gap={2.5}>
                                <Box
                                  w="32px"
                                  h="32px"
                                  border="1px solid #E6E6E6"
                                  borderRadius="4px"
                                  overflow="hidden"
                                  bg="white"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  flexShrink={0}
                                >
                                  <ProductImage
                                    src={commission.image}
                                    alt={commission.name}
                                    height="32px"
                                    width="32px"
                                    objectFit="contain"
                                  />
                                </Box>
                                <Text
                                  noOfLines={1}
                                  color="#131D53"
                                  overflow="hidden"
                                  textOverflow="ellipsis"
                                  maxW="275px"
                                >
                                  {commission.name}
                                </Text>
                              </Flex>
                            </Td>
                            <Td px={4} color="#131D53">
                              {commission.vendor_order_id}
                            </Td>
                            <Td px={4} color="#131D53">
                              {new Date(
                                commission.updated_at
                              ).toLocaleDateString('pt-BR')}
                            </Td>
                            <Td px={4} color="#131D53">
                              {formatCurrency(commission.product_price)}
                            </Td>
                            <Td px={4} color="#131D53">
                              {commission.coupon || '-'}
                            </Td>
                            <Td px={4} color="#131D53" maxW="120px">
                              <Text
                                noOfLines={1}
                                title={commission.commission_origin}
                              >
                                {commission.commission_origin || '-'}
                              </Text>
                            </Td>
                            <Td px={4} color="#131D53">
                              {formatCurrency(commission.commission)}
                            </Td>
                            <Td px={4} textAlign="center">
                              <Badge
                                colorScheme={getStatusColor(commission.status)}
                                fontSize="xs"
                                px={2}
                                py={1}
                                borderRadius="6px"
                                textTransform="none"
                                fontWeight="500"
                              >
                                {getStatusLabel(commission.status)}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>

                {data?.meta && (
                  <>
                    <Flex
                      justify="flex-end"
                      px={3}
                      pt={2}
                      display={{ base: 'flex', md: 'none' }}
                    >
                      <Text fontSize="xs" color={mutedTextColor}>
                        Mostrando{' '}
                        {data.meta
                          ? `${
                              (data.meta.current_page - 1) *
                                data.meta.pagesize +
                              1
                            }-${Math.min(
                              data.meta.current_page * data.meta.pagesize,
                              data.meta.total_items
                            )} de ${data.meta.total_items}`
                          : filteredCommissions.length}{' '}
                        comissões
                      </Text>
                    </Flex>

                    <Flex
                      justify="space-between"
                      align="center"
                      px={3}
                      pt={2}
                      display={{ base: 'none', md: 'flex' }}
                    >
                      <Text fontSize="sm" color={mutedTextColor}>
                        Mostrando{' '}
                        {data.meta
                          ? `${
                              (data.meta.current_page - 1) *
                                data.meta.pagesize +
                              1
                            }-${Math.min(
                              data.meta.current_page * data.meta.pagesize,
                              data.meta.total_items
                            )} de ${data.meta.total_items}`
                          : filteredCommissions.length}{' '}
                        comissões
                      </Text>

                      {data.meta.last_page > 1 && (
                        <Pagination
                          currentPage={data.meta.current_page}
                          totalPages={data.meta.last_page}
                          onPageChange={setPage}
                          isLoading={isLoadingCommissions}
                          align="flex-end"
                        />
                      )}
                    </Flex>

                    {data.meta.last_page > 1 && (
                      <Box display={{ base: 'block', md: 'none' }} pt={2}>
                        <Pagination
                          currentPage={data.meta.current_page}
                          totalPages={data.meta.last_page}
                          onPageChange={setPage}
                          isLoading={isLoadingCommissions}
                          align="center"
                        />
                      </Box>
                    )}
                  </>
                )}
              </>
            ) : (
              <Box textAlign="center" py={12}>
                <VStack spacing={4}>
                  <Box
                    w="64px"
                    h="64px"
                    bg={emptyStateBgColor}
                    borderRadius="50%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Wallet size={32} color="#A0AEC0" />
                  </Box>
                  <VStack spacing={2}>
                    <Text fontSize="lg" fontWeight="600" color={textColor}>
                      {filters.product || filters.status
                        ? 'Nenhuma comissão encontrada'
                        : 'Nenhuma comissão ainda'}
                    </Text>
                    <Text
                      fontSize="sm"
                      color={mutedTextColor}
                      maxW="400px"
                      textAlign="center"
                    >
                      {filters.product || filters.status
                        ? 'Tente ajustar os filtros ou termo de busca para encontrar suas comissões.'
                        : 'Suas comissões aparecerão aqui conforme você realizar vendas através dos seus links de afiliado.'}
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            )}
          </Box>
        </PageContent>
      </AppLayout>
    </>
  )
}
