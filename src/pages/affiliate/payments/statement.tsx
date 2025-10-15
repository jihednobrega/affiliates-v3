import Head from 'next/head'
import React, { useState, useCallback } from 'react'
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Select,
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
  Badge,
  Skeleton,
  useColorModeValue,
  useBreakpointValue,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import { Pagination } from '@/components/UI'
import { FinancesService } from '@/services/finances'
import { GetExtractResponse } from '@/services/types/finances.types'
import { Download, FileText } from 'lucide-react'

const FILTER_OPTIONS = [
  { value: '', label: 'Extrato Completo' },
  { value: 'withdrawal', label: 'Apenas Saques' },
]

const generateMonthOptions = () => {
  const options = [{ value: '', label: 'Desde sempre' }]
  const now = new Date()

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}`
    const label = date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
    })
    options.push({ value, label })
  }

  return options
}

const MONTH_OPTIONS = generateMonthOptions()

type StatementData = GetExtractResponse['data']

export default function StatementPage() {
  const toast = useToast()

  const [data, setData] = useState<StatementData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [month, setMonth] = useState('')
  const [filterType, setFilterType] = useState('')
  const [page, setPage] = useState(1)

  const perPage = useBreakpointValue({ base: 10, md: 15 }) || 10

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('#DEE6F2', 'gray.600')
  const textColor = useColorModeValue('#131D53', 'white')
  const mutedTextColor = useColorModeValue('#131D5399', 'gray.400')

  const fetchStatementData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params: any = {
        page,
        perpage: perPage,
      }

      if (month) {
        params.month = month
      }

      if (filterType === 'withdrawal') {
        params.withdrawal = true
      }

      const { response, status } =
        await FinancesService.prototype.getAffiliateExtract(params)

      if (status === 200 && response && !(response instanceof Blob)) {
        setData(response.data)
      } else {
        throw new Error('Erro ao carregar dados do extrato')
      }
    } catch (err: any) {
      console.error('Erro ao carregar extrato:', err)
      setError(err.message || 'Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }, [page, perPage, month, filterType])

  React.useEffect(() => {
    fetchStatementData()
  }, [fetchStatementData])

  const handleExportStatement = async () => {
    try {
      const params: any = {
        exportFile: true,
      }

      if (month) {
        params.month = month
      }

      if (filterType === 'withdrawal') {
        params.withdrawal = true
      }

      const { response } = await FinancesService.prototype.getAffiliateExtract(
        params
      )

      if (response instanceof Blob) {
        const url = window.URL.createObjectURL(response)
        const link = document.createElement('a')
        link.href = url
        link.download = `extrato-${month || 'completo'}.csv`
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
      console.error('Erro ao exportar extrato:', error)
      toast({
        title: 'Erro ao exportar extrato',
        description: 'Tente novamente mais tarde',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return 'Data inválida'
    }
  }

  const formatCurrency = (value: string | number | null) => {
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

  const formatTax = (taxAmount: string | null, taxPercent: string | null) => {
    if (taxAmount && taxAmount !== '0' && taxAmount !== '0.00') {
      return formatCurrency(taxAmount)
    }

    if (taxPercent && taxPercent !== '0' && taxPercent !== '0.00') {
      const percent = parseFloat(taxPercent)
      if (!isNaN(percent)) {
        return `${percent.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}%`
      }
    }

    return 'Sem taxa'
  }

  const getTypeColor = (type: string) => {
    const typeStr = String(type)
    if (typeStr === 'revenue' || typeStr === 'commission') {
      return 'green'
    }
    if (typeStr === 'withdrawal' || typeStr === 'withdraw') {
      return 'blue'
    }
    return 'gray'
  }

  const getTypeLabel = (type: string) => {
    const typeStr = String(type)
    if (typeStr === 'revenue' || typeStr === 'commission') {
      return 'Receita'
    }
    if (typeStr === 'withdrawal' || typeStr === 'withdraw') {
      return 'Saque'
    }
    return typeStr
  }

  return (
    <>
      <Head>
        <title>Extrato de Pagamentos | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Box display="flex" flexDirection="column" gap={4} w="full">
            <Flex justifyContent="space-between" align="center">
              <Flex gap={2} align="center">
                <FileText size={24} color="#131D53" />
                <Text fontSize="sm" color="#131D53">
                  Extrato de Pagamentos
                </Text>
              </Flex>
            </Flex>

            <VStack spacing={3} align="stretch">
              <HStack
                spacing={4}
                display={{ base: 'none', md: 'flex' }}
                justify="flex-start"
              >
                <Box>
                  <Text fontSize="xs" color="#131D5399" mb={1} fontWeight={500}>
                    Período
                  </Text>
                  <Select
                    value={month}
                    onChange={(e) => {
                      setMonth(e.target.value)
                      setPage(1)
                    }}
                    size="md"
                    borderColor="#DEE6F2"
                    borderRadius="6px"
                    _focus={{
                      borderColor: '#1F70F1',
                      boxShadow: '0 0 0 1px #1F70F1',
                    }}
                    fontSize="sm"
                    minW="200px"
                    maxW="250px"
                  >
                    {MONTH_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="xs" color="#131D5399" mb={1} fontWeight={500}>
                    Tipo de Extrato
                  </Text>
                  <Select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value)
                      setPage(1)
                    }}
                    size="md"
                    borderColor="#DEE6F2"
                    borderRadius="6px"
                    _focus={{
                      borderColor: '#1F70F1',
                      boxShadow: '0 0 0 1px #1F70F1',
                    }}
                    fontSize="sm"
                    minW="180px"
                    maxW="200px"
                  >
                    {FILTER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Box>
              </HStack>

              <VStack spacing={2} display={{ base: 'flex', md: 'none' }}>
                <Select
                  value={month}
                  onChange={(e) => {
                    setMonth(e.target.value)
                    setPage(1)
                  }}
                  size="md"
                  borderColor="#DEE6F2"
                  borderRadius="6px"
                  _focus={{
                    borderColor: '#1F70F1',
                    boxShadow: '0 0 0 1px #1F70F1',
                  }}
                  fontSize="sm"
                  w="full"
                >
                  {MONTH_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>

                <Select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value)
                    setPage(1)
                  }}
                  size="md"
                  borderColor="#DEE6F2"
                  borderRadius="6px"
                  _focus={{
                    borderColor: '#1F70F1',
                    boxShadow: '0 0 0 1px #1F70F1',
                  }}
                  fontSize="sm"
                  w="full"
                >
                  {FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </VStack>
            </VStack>
          </Box>
        </PageHeader>

        <PageContent>
          {error && (
            <Alert status="error" borderRadius="lg" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Erro ao carregar dados!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
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
              <Text fontSize="sm" color="#131d53" px={3}>
                Extrato de Movimentações
              </Text>
              <HStack spacing={2}>
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
                  onClick={handleExportStatement}
                  isDisabled={!data?.list?.length}
                  opacity={!data?.list?.length ? 0.5 : 1}
                  cursor={!data?.list?.length ? 'not-allowed' : 'pointer'}
                >
                  Exportar
                </Button>
              </HStack>
            </Flex>

            {isLoading ? (
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
                    <Skeleton w="80px" h="16px" />
                    <Skeleton w="60px" h="20px" borderRadius="6px" />
                    <Skeleton w="80px" h="16px" />
                    <Skeleton w="60px" h="16px" />
                    <Skeleton w="80px" h="16px" />
                  </HStack>
                ))}
              </Box>
            ) : data?.list && data.list.length > 0 ? (
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
                            Data
                          </Th>
                          <Th
                            px={4}
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            color="#131d53"
                          >
                            Tipo
                          </Th>
                          <Th
                            px={4}
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            color="#131d53"
                          >
                            Valor Bruto
                          </Th>
                          <Th
                            px={4}
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            color="#131d53"
                          >
                            Taxa Aplicada
                          </Th>
                          <Th
                            px={4}
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            color="#131d53"
                          >
                            Recebimento Líquido
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody fontSize="xs">
                        {data.list.map((item, index) => (
                          <Tr
                            key={index}
                            _hover={{ bg: '#F3F6FA' }}
                            borderTop="1px solid #DEE6F2"
                            _first={{ borderTop: 'none' }}
                          >
                            <Td px={4} color="#131D53">
                              {formatDate(item.created_at)}
                            </Td>
                            <Td px={4}>
                              <Badge
                                colorScheme={getTypeColor(item.type)}
                                fontSize="xs"
                                px={2}
                                py={1}
                                borderRadius="6px"
                                textTransform="none"
                                fontWeight="500"
                              >
                                {getTypeLabel(item.type)}
                              </Badge>
                            </Td>
                            <Td px={4} color="#131D53" fontWeight="500">
                              {formatCurrency(
                                String(item.type) === 'withdrawal' ||
                                  String(item.type) === 'withdraw'
                                  ? item.withdraw_requests_amount || item.amount
                                  : item.amount
                              )}
                            </Td>
                            <Td px={4} color="#131D53">
                              {String(item.type) === 'withdrawal' ||
                              String(item.type) === 'withdraw'
                                ? formatTax(
                                    item.withdraw_requests_tax_amount,
                                    item.withdraw_requests_tax_percent
                                  )
                                : '-'}
                            </Td>
                            <Td px={4} color="#131D53" fontWeight="500">
                              {formatCurrency(
                                String(item.type) === 'withdrawal' ||
                                  String(item.type) === 'withdraw'
                                  ? item.withdraw_requests_final_amount ||
                                      item.amount
                                  : item.amount
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>

                {data.meta && (
                  <>
                    <Flex
                      justify="flex-end"
                      px={3}
                      pt={2}
                      display={{ base: 'flex', md: 'none' }}
                    >
                      <Text fontSize="12px" color={mutedTextColor}>
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
                          : data.list.length}{' '}
                        registros
                      </Text>
                    </Flex>

                    <Flex
                      justify="space-between"
                      align="center"
                      px={3}
                      pt={2}
                      display={{ base: 'none', md: 'flex' }}
                    >
                      <Text fontSize="12px" color={mutedTextColor}>
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
                          : data.list.length}{' '}
                        registros
                      </Text>

                      {data.meta.last_page > 1 && (
                        <Pagination
                          currentPage={data.meta.current_page}
                          totalPages={data.meta.last_page}
                          onPageChange={setPage}
                          isLoading={isLoading}
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
                          isLoading={isLoading}
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
                    bg={useColorModeValue('#F7FAFC', 'gray.600')}
                    borderRadius="50%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FileText size={32} color="#A0AEC0" />
                  </Box>
                  <VStack spacing={2}>
                    <Text fontSize="lg" fontWeight="600" color={textColor}>
                      {month || filterType
                        ? 'Nenhum registro encontrado'
                        : 'Nenhuma movimentação ainda'}
                    </Text>
                    <Text
                      fontSize="sm"
                      color={mutedTextColor}
                      maxW="400px"
                      textAlign="center"
                    >
                      {month || filterType
                        ? 'Tente ajustar os filtros para encontrar suas movimentações.'
                        : 'Suas movimentações financeiras aparecerão aqui conforme você realizar vendas e saques.'}
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
