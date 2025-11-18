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
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import { useAccountantWithdraws } from '@/hooks/useAccountantWithdraws'
import { WithdrawActionModal } from '@/components/Features/accountant/WithdrawActionModal'
import { WithdrawRequest } from '@/services/types/accountant-withdraw.types'
import { Check, X, Wallet } from 'lucide-react'
import { Pagination } from '@/components/UI'
import { useAuth } from '@/hooks/useAuth'

export default function WithdrawRequestsPage() {
  const toast = useToast()
  const [selectedWithdraw, setSelectedWithdraw] =
    useState<WithdrawRequest | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'refuse'>('approve')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { brands } = useAuth()

  const {
    data,
    isLoading,
    filters,
    setBrand,
    setPage,
    approve,
    refuse,
    isApproving,
    isRefusing,
  } = useAccountantWithdraws()

  const handleOpenApprove = (withdraw: WithdrawRequest) => {
    setSelectedWithdraw(withdraw)
    setActionType('approve')
    onOpen()
  }

  const handleOpenRefuse = (withdraw: WithdrawRequest) => {
    setSelectedWithdraw(withdraw)
    setActionType('refuse')
    onOpen()
  }

  const handleConfirmAction = async (id: number, reason?: string) => {
    try {
      if (actionType === 'approve') {
        await approve(id)
        toast({
          title: 'Saque aprovado com sucesso!',
          description: 'O afiliado será notificado.',
          status: 'success',
          duration: 3000,
        })
      } else {
        await refuse(id)
        toast({
          title: 'Saque recusado',
          description: 'O afiliado será notificado.',
          status: 'info',
          duration: 3000,
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao processar saque',
        description: error.message || 'Tente novamente mais tarde.',
        status: 'error',
        duration: 5000,
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'yellow', label: 'Pendente' },
      done: { color: 'green', label: 'Aprovado' },
      refused: { color: 'red', label: 'Recusado' },
      processing: { color: 'blue', label: 'Processando' },
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

  const totalPages = data?.meta ? data.meta.last_page : 1

  return (
    <>
      <Head>
        <title>Solicitações de Saque | Contador</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Flex justify="space-between" align="center" w="full" gap={4}>
            <Flex gap={2} align="center">
              <Wallet size={24} color="#131D53" />
              <Text fontSize="sm" color="#131D53">
                Solicitações de Saque
              </Text>
            </Flex>
            <Box minW="200px">
              <Select
                value={filters.brand_id || ''}
                onChange={(e) =>
                  setBrand(e.target.value ? Number(e.target.value) : undefined)
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
          </Flex>
        </PageHeader>

        <PageContent>
          <VStack spacing={6} align="start" w="full">
            {/* Tabela de Solicitações */}
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
              <Text fontSize="sm" color="#131d53" px={3}>
                Solicitações de Saque
              </Text>

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
                          Data
                        </Th>
                        <Th
                          fontSize="xs"
                          color="#131D5399"
                          textTransform="none"
                          fontWeight="normal"
                          px={4}
                        >
                          Afiliado
                        </Th>
                        <Th
                          fontSize="xs"
                          color="#131D5399"
                          textTransform="none"
                          fontWeight="normal"
                          px={4}
                        >
                          Documento
                        </Th>
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
                          Valor Solicitado
                        </Th>
                        <Th
                          fontSize="xs"
                          color="#131D5399"
                          textTransform="none"
                          fontWeight="normal"
                          px={4}
                        >
                          Tarifa
                        </Th>
                        <Th
                          fontSize="xs"
                          color="#131D5399"
                          textTransform="none"
                          fontWeight="normal"
                          px={4}
                        >
                          Líquido
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
                        {/* <Th
                          fontSize="xs"
                          color="#131D5399"
                          textTransform="none"
                          fontWeight="normal"
                          px={4}
                        >
                          Ações
                        </Th> */}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <Tr key={i}>
                            <Td colSpan={9}>
                              <Skeleton height="20px" />
                            </Td>
                          </Tr>
                        ))
                      ) : data?.list && data.list.length > 0 ? (
                        data.list.map((withdraw) => (
                          <Tr key={withdraw.id}>
                            <Td fontSize="sm" color="#131D53" px={4}>
                              {new Date(withdraw.created_at).toLocaleDateString(
                                'pt-BR'
                              )}
                            </Td>
                            <Td fontSize="sm" color="#131D53" px={4}>
                              {withdraw.user_name}
                            </Td>
                            <Td fontSize="sm" color="#131D53" px={4}>
                              {withdraw.user_document}
                            </Td>
                            <Td fontSize="sm" color="#131D53" px={4}>
                              {withdraw.brand_name}
                            </Td>
                            <Td
                              fontSize="sm"
                              color="#131D53"
                              fontWeight="600"
                              px={4}
                            >
                              {withdraw.amountFormatted}
                            </Td>
                            <Td
                              fontSize="sm"
                              color="#EF4444"
                              fontWeight="500"
                              px={4}
                            >
                              {withdraw.tax_amount &&
                              withdraw.tax_amount !== 'null'
                                ? withdraw.taxAmountFormatted
                                : withdraw.tax_percent &&
                                  withdraw.tax_percent !== 'null'
                                ? `${parseFloat(withdraw.tax_percent).toFixed(
                                    2
                                  )}%`
                                : '-'}
                            </Td>
                            <Td
                              fontSize="sm"
                              color="#22C55E"
                              fontWeight="500"
                              px={4}
                            >
                              {withdraw.finalAmountFormatted}
                            </Td>
                            {/* <Td px={4}>{getStatusBadge(withdraw.status)}</Td> */}
                            <Td px={4}>
                              {withdraw.status === 'pending' ? (
                                <HStack spacing={1}>
                                  <Button
                                    size="xs"
                                    leftIcon={<Check size={14} />}
                                    onClick={() => handleOpenApprove(withdraw)}
                                    isDisabled={isApproving || isRefusing}
                                    color="white"
                                    bgGradient="linear-gradient(180deg, #53b38c -27.08%, #0f9669 123.81%)"
                                    shadow="0px 0px 0px 1px #059669, 0px -1px 0px 0px rgba(5, 150, 105, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                                    _hover={{
                                      bgGradient:
                                        'linear-gradient(180deg, #7cdbb3 -27.08%, #1cb877 123.81%)',
                                      shadow:
                                        '0px 0px 0px 1px #10B981, 0px -1px 0px 0px rgba(5, 150, 105, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                                    }}
                                    _disabled={{
                                      opacity: 0.6,
                                      cursor: 'not-allowed',
                                    }}
                                    transition="all 0.2s ease"
                                  >
                                    Aprovar
                                  </Button>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="outline"
                                    leftIcon={<X size={14} />}
                                    onClick={() => handleOpenRefuse(withdraw)}
                                    isDisabled={isApproving || isRefusing}
                                  >
                                    Recusar
                                  </Button>
                                </HStack>
                              ) : withdraw.status === 'done' ? (
                                <Badge
                                  colorScheme="green"
                                  fontSize="xs"
                                  px={2}
                                  py={1}
                                  borderRadius="6px"
                                  textTransform="none"
                                  fontWeight="500"
                                >
                                  Aprovado em{' '}
                                  {new Date(
                                    withdraw.updated_at
                                  ).toLocaleDateString('pt-BR')}
                                </Badge>
                              ) : withdraw.status === 'refused' ? (
                                <Badge
                                  colorScheme="red"
                                  fontSize="xs"
                                  px={2}
                                  py={1}
                                  borderRadius="6px"
                                  textTransform="none"
                                  fontWeight="500"
                                >
                                  Recusado em{' '}
                                  {new Date(
                                    withdraw.updated_at
                                  ).toLocaleDateString('pt-BR')}
                                </Badge>
                              ) : withdraw.status === 'processing' ? (
                                <Badge
                                  colorScheme="blue"
                                  fontSize="xs"
                                  px={2}
                                  py={1}
                                  borderRadius="6px"
                                  textTransform="none"
                                  fontWeight="500"
                                >
                                  Em processamento
                                </Badge>
                              ) : (
                                getStatusBadge(withdraw.status)
                              )}
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={9} textAlign="center" py={8}>
                            <Text fontSize="sm" color="#131D5399">
                              Nenhuma solicitação de saque encontrada
                            </Text>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Footer com contador e paginação */}
              {data?.list && data.list.length > 0 && (
                <Flex justify="space-between" align="center" px={3} pt={2}>
                  <Text fontSize="sm" color="#131D5399">
                    Mostrando {(filters.page - 1) * filters.perpage + 1}-
                    {Math.min(
                      filters.page * filters.perpage,
                      data.meta?.total_items || 0
                    )}{' '}
                    de {data.meta?.total_items || 0} solicitações
                  </Text>
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={filters.page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  )}
                </Flex>
              )}
            </Box>
          </VStack>
        </PageContent>

        {/* Modal de Ação */}
        <WithdrawActionModal
          isOpen={isOpen}
          onClose={onClose}
          withdraw={selectedWithdraw}
          action={actionType}
          onConfirm={handleConfirmAction}
          isLoading={isApproving || isRefusing}
        />
      </AppLayout>
    </>
  )
}
