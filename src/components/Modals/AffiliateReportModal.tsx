import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Input,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Skeleton,
  useToast,
} from '@chakra-ui/react'
import { Search, Calendar, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'
import { BrandFinancesReportService } from '@/services/brand-finances-report'
import { Pagination, ProductImage } from '@/components/UI'
import { formatCurrency } from '@/utils/formatToCurrency'
import { formatDateSafe } from '@/utils/periodUtils'
import { formatPercentage } from '@/utils/formatters'
import { ShimmerBadge } from '../UI/Badges'

interface AffiliateReportModalProps {
  isOpen: boolean
  onClose: () => void
  affiliateId: number
  affiliateName?: string
  affiliateAvatar?: string
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'new', label: 'Novo' },
  { value: 'pending', label: 'Aguardando pagamento' },
  { value: 'approved', label: 'Pagamento aprovado' },
  { value: 'processing', label: 'Em processamento' },
  { value: 'canceled', label: 'Cancelado' },
  { value: 'done', label: 'Completo' },
]

const STATUS_LABELS: Record<string, string> = {
  new: 'Novo',
  pending: 'Aguardando pagamento',
  approved: 'Pagamento aprovado',
  processing: 'Em processamento',
  canceled: 'Cancelado',
  done: 'Completo',
}

const STATUS_COLORS: Record<string, string> = {
  new: 'blue',
  pending: 'yellow',
  approved: 'green',
  processing: 'cyan',
  canceled: 'red',
  done: 'green',
}

function ReportLoadingSkeleton() {
  return (
    <Box border="1px solid #DEE6F2" borderRadius="md" overflow="auto">
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
                w="35%"
              >
                Produto
              </Th>
              <Th
                px={4}
                color="#131d53"
                fontSize="xs"
                textTransform="none"
                fontWeight="normal"
                w="10%"
              >
                Data
              </Th>
              <Th
                px={4}
                color="#131d53"
                fontSize="xs"
                textTransform="none"
                fontWeight="normal"
                w="10%"
              >
                ID do Pedido
              </Th>
              <Th
                px={4}
                color="#131d53"
                fontSize="xs"
                textTransform="none"
                fontWeight="normal"
                w="12%"
              >
                Origem
              </Th>
              <Th
                px={4}
                color="#131d53"
                fontSize="xs"
                textTransform="none"
                fontWeight="normal"
                textAlign="right"
                w="13%"
              >
                Preço
              </Th>
              <Th
                px={4}
                color="#131d53"
                fontSize="xs"
                textTransform="none"
                fontWeight="normal"
                textAlign="right"
                w="10%"
              >
                Comissão Est.
              </Th>
              <Th
                px={4}
                color="#131d53"
                fontSize="xs"
                textTransform="none"
                fontWeight="normal"
                w="10%"
              >
                Status
              </Th>
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
                    <Skeleton width="40px" height="40px" borderRadius="md" />
                    <Skeleton height="16px" width="150px" />
                  </HStack>
                </Td>
                <Td px={4}>
                  <Skeleton height="14px" width="80px" />
                </Td>
                <Td px={4}>
                  <Skeleton height="14px" width="100px" />
                </Td>
                <Td px={4}>
                  <Skeleton height="20px" width="70px" borderRadius="md" />
                </Td>
                <Td px={4} textAlign="right">
                  <Skeleton height="14px" width="60px" ml="auto" />
                </Td>
                <Td px={4} textAlign="right">
                  <Skeleton height="14px" width="60px" ml="auto" />
                </Td>
                <Td px={4}>
                  <Skeleton height="24px" width="90px" borderRadius="md" />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export function AffiliateReportModal({
  isOpen,
  onClose,
  affiliateId,
  affiliateName,
  affiliateAvatar,
}: AffiliateReportModalProps) {
  const toast = useToast()
  const reportService = new BrandFinancesReportService()

  const [searchProduct, setSearchProduct] = useState('')
  const [debouncedSearchProduct, setDebouncedSearchProduct] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchProduct(searchProduct)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchProduct])

  useEffect(() => {
    if (isOpen && affiliateId) {
      fetchReport()
    }
  }, [
    isOpen,
    affiliateId,
    currentPage,
    debouncedSearchProduct,
    selectedPeriod,
    selectedStatus,
  ])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const result = await reportService.getBrandFinancesReport({
        id: affiliateId,
        page: currentPage,
        perpage: itemsPerPage,
        product: debouncedSearchProduct || undefined,
        period: selectedPeriod || undefined,
        status: selectedStatus || undefined,
      })

      if (result.status === 200 && result.response?.success) {
        setReportData(result.response.data)
      } else {
        toast({
          title: 'Erro ao carregar relatório',
          description:
            result.response?.message || 'Não foi possível carregar os dados.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Erro ao buscar relatório:', error)
      toast({
        title: 'Erro ao carregar relatório',
        description: 'Ocorreu um erro inesperado.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSearchProduct('')
    setDebouncedSearchProduct('')
    setSelectedPeriod('')
    setSelectedStatus('')
    setCurrentPage(1)
    setReportData(null)
    onClose()
  }

  const totalPages = reportData?.meta?.last_page || 1
  const startItem = reportData?.meta
    ? (reportData.meta.current_page - 1) * reportData.meta.pagesize + 1
    : 1
  const endItem = reportData?.meta
    ? Math.min(
        reportData.meta.current_page * reportData.meta.pagesize,
        reportData.meta.total_items
      )
    : reportData?.list?.length || 0
  const totalItems = reportData?.meta?.total_items || 0

  const selectedPeriodLabel =
    reportData?.brand_periods?.[selectedPeriod] || 'Todos os períodos'
  const selectedStatusLabel =
    STATUS_OPTIONS.find((opt) => opt.value === selectedStatus)?.label ||
    'Todos os status'

  const userName = reportData?.user?.name || affiliateName || 'Usuário'
  const userAvatar = reportData?.user?.avatar || affiliateAvatar

  const getOriginLabel = (origin: string) => {
    if (!origin) return 'Direta'
    return origin.toLowerCase() === 'referral' ? 'Indicado' : 'Direta'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="6xl"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent maxW="90vw" maxH="90vh">
        <ModalCloseButton />
        <ModalHeader pb={3}>
          <VStack spacing={3} align="stretch">
            {/* Header com informações do usuário */}
            <HStack spacing={3}>
              <Avatar size="md" name={userName} src={userAvatar || undefined} />
              <VStack align="start" spacing={0}>
                {/* Título da tabela */}
                <Text fontSize="lg" fontWeight={600} color="#131D53">
                  Detalhe das comissões
                </Text>
                <Text fontSize="sm" fontWeight={400} color="#131D5399">
                  {userName}
                </Text>
              </VStack>
            </HStack>

            {/* Filtros */}
            <Flex gap={2} wrap="wrap">
              {/* Busca por produto */}
              <HStack
                flex={1}
                minW="200px"
                h="34px"
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
                <Search size={14} color="#131D5399" />
                <Input
                  placeholder="Buscar por produto ou SKU"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  border="none"
                  px={0}
                  h="full"
                  fontSize="sm"
                  fontWeight="normal"
                  _focus={{ boxShadow: 'none' }}
                  _placeholder={{ color: '#131D5399' }}
                />
              </HStack>

              {/* Filtro de Período */}
              {loading ? (
                <Skeleton height="34px" width="150px" borderRadius="md" />
              ) : reportData?.brand_periods ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    size="sm"
                    fontSize="xs"
                    fontWeight={500}
                    h="34px"
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
                  >
                    {selectedPeriodLabel}
                  </MenuButton>
                  <MenuList maxH="300px" overflowY="auto">
                    <MenuItem
                      onClick={() => setSelectedPeriod('')}
                      bg={!selectedPeriod ? 'blue.50' : 'transparent'}
                      color={!selectedPeriod ? 'blue.600' : 'inherit'}
                      fontSize="sm"
                    >
                      Todos os períodos
                    </MenuItem>
                    {Object.entries(reportData.brand_periods)
                      .filter(([key]) => key !== 'all')
                      .map(([key, label]) => (
                        <MenuItem
                          key={key}
                          onClick={() => setSelectedPeriod(key)}
                          bg={
                            selectedPeriod === key ? 'blue.50' : 'transparent'
                          }
                          color={
                            selectedPeriod === key ? 'blue.600' : 'inherit'
                          }
                          fontSize="sm"
                        >
                          {String(label)}
                        </MenuItem>
                      ))}
                  </MenuList>
                </Menu>
              ) : null}

              {/* Filtro de Status */}
              {loading ? (
                <Skeleton height="34px" width="180px" borderRadius="md" />
              ) : (
                <Menu>
                  <MenuButton
                    as={Button}
                    size="sm"
                    fontSize="xs"
                    fontWeight={500}
                    h="34px"
                    px={3}
                    leftIcon={<Filter size={14} />}
                    bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                    shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                    color="#131D53"
                    _hover={{
                      bgGradient:
                        'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                      shadow:
                        '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                    }}
                  >
                    {selectedStatusLabel}
                  </MenuButton>
                  <MenuList>
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem
                        key={option.value}
                        onClick={() => setSelectedStatus(option.value)}
                        bg={
                          selectedStatus === option.value
                            ? 'blue.50'
                            : 'transparent'
                        }
                        color={
                          selectedStatus === option.value
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
              )}
            </Flex>
          </VStack>
        </ModalHeader>

        <ModalBody px={6} py={4}>
          <VStack spacing={4} align="stretch">
            {/* Tabela */}
            {loading ? (
              <ReportLoadingSkeleton />
            ) : reportData?.list && reportData.list.length > 0 ? (
              <>
                <Box
                  border="1px solid #DEE6F2"
                  borderRadius="md"
                  overflow="auto"
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
                            w="35%"
                          >
                            Produto
                          </Th>
                          <Th
                            px={4}
                            color="#131d53"
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            w="10%"
                            textAlign="center"
                          >
                            Data
                          </Th>
                          <Th
                            px={4}
                            color="#131d53"
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            w="10%"
                          >
                            ID do Pedido
                          </Th>
                          <Th
                            px={4}
                            color="#131d53"
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            textAlign="center"
                            w="12%"
                          >
                            Origem
                          </Th>
                          <Th
                            px={4}
                            color="#131d53"
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            textAlign="center"
                            w="13%"
                          >
                            Preço
                          </Th>
                          <Th
                            px={4}
                            color="#131d53"
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            textAlign="center"
                            w="10%"
                          >
                            Comissão Estimada
                          </Th>
                          <Th
                            px={4}
                            color="#131d53"
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            w="10%"
                            textAlign="center"
                          >
                            Status
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {reportData.list.map((item: any) => (
                          <Tr
                            key={item.id}
                            borderTop="1px solid #DEE6F2"
                            _first={{ borderTop: 'none' }}
                            _hover={{ bg: '#F3F6FA' }}
                          >
                            <Td px={4}>
                              <HStack spacing={2}>
                                <ProductImage
                                  src={item.image}
                                  alt={item.name}
                                  width="40px"
                                  height="40px"
                                />
                                <VStack align="start" spacing={0} maxW="350px">
                                  {/* <Tooltip
                                    label={item.name}
                                    fontSize="xs"
                                    bg="#131D53"
                                    color="white"
                                    px={3}
                                    py={2}
                                    borderRadius="md"
                                    hasArrow
                                    placement="top"
                                  > */}
                                  <Text
                                    fontSize="xs"
                                    color="#131D53"
                                    noOfLines={2}
                                    fontWeight={500}
                                  >
                                    {item.name}
                                  </Text>
                                  {/* </Tooltip> */}
                                  <Text fontSize="xs" color="#131D5399">
                                    SKU: {item.sku}
                                  </Text>
                                </VStack>
                              </HStack>
                            </Td>
                            <Td px={4}>
                              <Text
                                fontSize="xs"
                                color="#131D5399"
                                textAlign="center"
                              >
                                {item.updated_at
                                  ? formatDateSafe(
                                      item.updated_at.split(' ')[0]
                                    )
                                  : '-'}
                              </Text>
                            </Td>
                            <Td px={4}>
                              <Text
                                fontSize="xs"
                                color="#131D5399"
                                fontFamily="mono"
                                noOfLines={1}
                              >
                                {item.vendor_order_id}
                              </Text>
                            </Td>
                            <Td px={4} textAlign="center">
                              <Text fontSize="xs" color="#131D5399">
                                {getOriginLabel(item.origin)}
                              </Text>
                            </Td>
                            <Td px={4} textAlign="right">
                              <HStack spacing={2} justify="flex-end">
                                <Text fontSize="xs" color="#131D53">
                                  {formatCurrency(
                                    parseFloat(item.product_price)
                                  )}
                                </Text>
                                <ShimmerBadge
                                  icon="/assets/icons/extra-commission.svg"
                                  percentage={formatPercentage(
                                    item.commission_percentage
                                  )}
                                />
                              </HStack>
                            </Td>
                            <Td px={4} textAlign="center">
                              <Text fontSize="xs" color="#131D53">
                                {formatCurrency(parseFloat(item.commission))}
                              </Text>
                            </Td>
                            <Td px={4} textAlign="center">
                              <Badge
                                colorScheme={
                                  STATUS_COLORS[item.status] || 'gray'
                                }
                                fontSize="xs"
                                fontWeight={500}
                                textTransform={'none'}
                                px={2}
                                py={1}
                                borderRadius="6px"
                              >
                                {STATUS_LABELS[item.status] || item.status}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Footer com paginação */}
                {totalPages > 1 && (
                  <Flex justify="space-between" align="center" pt={2}>
                    <Text fontSize="sm" color="#131D5399">
                      Mostrando {startItem}-{endItem} de {totalItems} itens
                    </Text>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </Flex>
                )}
              </>
            ) : (
              <Box textAlign="center" py={8} color="gray.500">
                <Text>Nenhum item encontrado</Text>
              </Box>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
