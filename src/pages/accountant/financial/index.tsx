import Head from 'next/head'
import { useState } from 'react'
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  VStack,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  useToast,
  Skeleton,
  useDisclosure,
  Input,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import { useAccountantBillings } from '@/hooks/useAccountantBillings'
import { BillingDetailsModal } from '@/components/Features/accountant/BillingDetailsModal'
import { ExportFinancesModal } from '@/components/Modals/ExportFinancesModal'
import { GenerateInvoiceModal } from '@/components/Modals/GenerateInvoiceModal'
import { AccountantListBrand } from '@/services/types/accountant-billing.types'
import { Eye, Check, DollarSign, Download, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function AccountantFinancialPage() {
  const toast = useToast()
  const [selectedBilling, setSelectedBilling] =
    useState<AccountantListBrand | null>(null)
  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose,
  } = useDisclosure()
  const {
    isOpen: isExportOpen,
    onOpen: onExportOpen,
    onClose: onExportClose,
  } = useDisclosure()
  const {
    isOpen: isGenerateOpen,
    onOpen: onGenerateOpen,
    onClose: onGenerateClose,
  } = useDisclosure()

  const { brands } = useAuth()

  const {
    data,
    isLoading,
    filters,
    setMonth,
    setBrand,
    confirmPayment,
    isUpdatingStatus,
  } = useAccountantBillings({ month: new Date().toISOString().slice(0, 7) })

  const handleConfirmPayment = async (id: number) => {
    try {
      await confirmPayment(id)
      toast({
        title: 'Pagamento confirmado!',
        status: 'success',
        duration: 3000,
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao confirmar pagamento',
        description: error.message || 'Tente novamente mais tarde.',
        status: 'error',
        duration: 5000,
      })
    }
  }

  const handleViewDetails = (billing: AccountantListBrand) => {
    setSelectedBilling(billing)
    onDetailsOpen()
  }

  const handleOpenGenerateModal = () => {
    if (!filters.brand_id) {
      toast({
        title: 'Selecione uma marca',
        description:
          'Para gerar faturas, você precisa selecionar uma marca específica',
        status: 'warning',
        duration: 4000,
      })
      return
    }

    onGenerateOpen()
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      created: { color: 'blue', label: 'Enviada' },
      pending: { color: 'yellow', label: 'Pendente' },
      payed: { color: 'green', label: 'Paga' },
      overdue: { color: 'red', label: 'Vencida' },
      expired: { color: 'gray', label: 'Expirada' },
    }

    const config = statusConfig[status] || { color: 'gray', label: status }

    return (
      <Badge
        colorScheme={config.color}
        fontSize="xs"
        px={2}
        py={1}
        borderRadius="6px"
        textTransform="none"
        fontWeight="500"
      >
        {config.label}
      </Badge>
    )
  }

  return (
    <>
      <Head>
        <title>Gestão Financeira | Contador</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Flex justify="space-between" align="center" w="full" gap={4}>
            <Flex gap={2} align="center">
              <DollarSign size={24} color="#131D53" />
              <Text fontSize="sm" color="#131D53">
                Gestão Financeira
              </Text>
            </Flex>
            <HStack spacing={3}>
              <Box minW="150px">
                <Input
                  type="month"
                  value={filters.month || ''}
                  onChange={(e) => setMonth(e.target.value)}
                  size="sm"
                  fontSize="xs"
                  placeholder="Selecione o mês"
                />
              </Box>
              <Box minW="180px">
                <Select
                  value={filters.brand_id || ''}
                  onChange={(e) =>
                    setBrand(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  size="sm"
                  fontSize="xs"
                  placeholder="Todas as marcas"
                >
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </Select>
              </Box>
              <Button
                size="sm"
                leftIcon={<Plus size={16} />}
                onClick={handleOpenGenerateModal}
                color="white"
                bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
                shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                _hover={{
                  bgGradient:
                    'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                  shadow:
                    '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                }}
                transition="all 0.2s ease"
                fontSize="xs"
              >
                Gerar Fatura
              </Button>
            </HStack>
          </Flex>
        </PageHeader>

        <PageContent>
          <VStack spacing={0} align="start" w="full">
            {/* Cards de Resumo */}
            {/* {isLoading ? (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <Skeleton height="200px" borderRadius="12px" />
                <Skeleton height="200px" borderRadius="12px" />
              </SimpleGrid>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <BillingCard
                  type="monthly_fee"
                  data={data?.monthlyFee || null}
                  onGenerateInvoice={() => {}}
                  isGenerating={false}
                />
                <BillingCard
                  type="take_rate"
                  data={data?.takeRate || null}
                  onGenerateInvoice={() => {}}
                  isGenerating={false}
                />
              </SimpleGrid>
            )} */}

            {/* Tabela de Faturas */}
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
              w="full"
            >
              {/* Header */}
              <Flex justify="space-between" align="center" px={3}>
                <Text fontSize="sm" color="#131d53">
                  Histórico de Faturas
                </Text>
                <Button
                  size="sm"
                  leftIcon={<Download size={16} />}
                  onClick={onExportOpen}
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
                  fontSize="xs"
                >
                  Exportar
                </Button>
              </Flex>

              {/* Tabela */}
              <Box border="1px solid #DEE6F2" borderRadius="md" overflow="auto">
                <TableContainer>
                  <Table
                    size="sm"
                    sx={{
                      'tr:hover': {
                        bg: '#F3F6FA',
                      },
                    }}
                  >
                    <Thead>
                      <Tr>
                        <Th
                          fontSize="xs"
                          color="#131D5399"
                          textTransform="none"
                          fontWeight="normal"
                          px={4}
                        >
                          Marca
                        </Th>
                        <Th
                          fontSize="xs"
                          color="#131D5399"
                          textTransform="none"
                          fontWeight="normal"
                          px={4}
                        >
                          Valor
                        </Th>
                        <Th
                          fontSize="xs"
                          color="#131D5399"
                          textTransform="none"
                          fontWeight="normal"
                          px={4}
                        >
                          Tipo
                        </Th>
                        <Th
                          fontSize="xs"
                          color="#131D5399"
                          textTransform="none"
                          fontWeight="normal"
                          px={4}
                        >
                          Status
                        </Th>
                        <Th
                          fontSize="xs"
                          color="#131D5399"
                          textTransform="none"
                          fontWeight="normal"
                          px={4}
                          textAlign="center"
                        >
                          Ações
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <Tr key={i}>
                            <Td colSpan={5}>
                              <Skeleton height="20px" />
                            </Td>
                          </Tr>
                        ))
                      ) : data?.billings && data.billings.length > 0 ? (
                        data.billings.map((billing) => (
                          <Tr key={billing.id}>
                            <Td fontSize="sm" color="#131D53" px={4}>
                              {billing.brand_name}
                            </Td>
                            <Td
                              fontSize="sm"
                              color="#131D53"
                              fontWeight="500"
                              px={4}
                            >
                              {parseFloat(billing.total_amount).toLocaleString(
                                'pt-BR',
                                {
                                  style: 'currency',
                                  currency: 'BRL',
                                }
                              )}
                            </Td>
                            <Td fontSize="sm" color="#131D53" px={4}>
                              {billing.type === 'monthly_fee'
                                ? 'Mensalidade'
                                : billing.type === 'take_rate'
                                ? 'Take Rate'
                                : 'Comissionamento'}
                            </Td>
                            <Td px={4}>{getStatusBadge(billing.status)}</Td>
                            <Td px={4} justifyItems="center">
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  colorScheme="gray"
                                  fontWeight={500}
                                  py={1.5}
                                  px={3}
                                  leftIcon={<Eye size={14} />}
                                  onClick={() => handleViewDetails(billing)}
                                >
                                  Detalhes
                                </Button>
                                {billing.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    colorScheme="green"
                                    leftIcon={<Check size={14} />}
                                    onClick={() =>
                                      handleConfirmPayment(billing.id)
                                    }
                                    isLoading={isUpdatingStatus}
                                  >
                                    Confirmar
                                  </Button>
                                )}
                              </HStack>
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={5} textAlign="center" py={8}>
                            <Text fontSize="sm" color="#131D5399">
                              Nenhuma fatura encontrada para o período
                              selecionado
                            </Text>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </VStack>
        </PageContent>

        {/* Modal de Detalhes */}
        <BillingDetailsModal
          isOpen={isDetailsOpen}
          onClose={onDetailsClose}
          billing={selectedBilling}
          isCentered
        />

        {/* Modal de Gerar Fatura */}
        <GenerateInvoiceModal
          isOpen={isGenerateOpen}
          onClose={onGenerateClose}
          brandId={filters.brand_id}
          month={filters.month || new Date().toISOString().slice(0, 7)}
          monthlyFeeData={data?.monthlyFee || null}
          takeRateData={data?.takeRate || null}
        />

        {/* Modal de Exportação */}
        <ExportFinancesModal
          isOpen={isExportOpen}
          onClose={onExportClose}
          currentPeriod={filters.month || ''}
          brandId={filters.brand_id}
        />
      </AppLayout>
    </>
  )
}
