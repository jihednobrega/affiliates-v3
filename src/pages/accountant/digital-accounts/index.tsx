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
import { useAccountantDigitalAccounts } from '@/hooks/useAccountantDigitalAccounts'
import {
  DocumentViewer,
  DocumentItem,
} from '@/components/Features/accountant/DocumentViewer'
import { DigitalAccount } from '@/services/types/accountant-digital-account.types'
import { Check, X, FileText, CreditCard } from 'lucide-react'
import { Pagination } from '@/components/UI'
import { useAuth } from '@/hooks/useAuth'

export default function DigitalAccountsPage() {
  const toast = useToast()
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentItem[]>([])
  const [currentDocIndex, setCurrentDocIndex] = useState(0)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { brands } = useAuth()

  const {
    data,
    isLoading,
    filters,
    setBrand,
    setStatus,
    setPage,
    approve,
    reject,
    isApproving,
    isRejecting,
  } = useAccountantDigitalAccounts()

  const handleViewDocument = (
    account: DigitalAccount,
    initialDocTitle: string
  ) => {
    const docs: DocumentItem[] = []

    docs.push({
      url: account.selfie,
      title: 'Selfie',
      isAvailable: !!account.selfie,
    })
    docs.push({
      url: account.address_proof,
      title: 'Comprovante de Endereço',
      isAvailable: !!account.address_proof,
    })
    docs.push({
      url: account.identification,
      title: 'Documento de Identificação',
      isAvailable: !!account.identification,
    })

    if (account.user_account_type === 'PJ') {
      docs.push({
        url: account.social_contract,
        title: 'Contrato Social',
        isAvailable: !!account.social_contract,
      })
      docs.push({
        url: account.balance_sheet,
        title: 'Relatório Financeiro',
        isAvailable: !!account.balance_sheet,
      })
    }

    setSelectedDocuments(docs)

    const requestedIndex = docs.findIndex(
      (doc) => doc.title === initialDocTitle
    )
    const firstAvailableIndex = docs.findIndex((doc) => doc.isAvailable)
    setCurrentDocIndex(
      requestedIndex >= 0 && docs[requestedIndex].isAvailable
        ? requestedIndex
        : firstAvailableIndex >= 0
        ? firstAvailableIndex
        : 0
    )
    onOpen()
  }

  const handleNavigateDocument = (index: number) => {
    setCurrentDocIndex(index)
  }

  const handleApprove = async (id: number, userName: string) => {
    try {
      await approve(id)
      toast({
        title: 'Conta aprovada com sucesso!',
        description: `A conta digital de ${userName} foi aprovada.`,
        status: 'success',
        duration: 3000,
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao aprovar conta',
        description: error.message || 'Tente novamente mais tarde.',
        status: 'error',
        duration: 5000,
      })
    }
  }

  const handleReject = async (id: number, userName: string) => {
    try {
      await reject(id)
      toast({
        title: 'Conta recusada',
        description: `A conta digital de ${userName} foi recusada.`,
        status: 'info',
        duration: 3000,
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao recusar conta',
        description: error.message || 'Tente novamente mais tarde.',
        status: 'error',
        duration: 5000,
      })
    }
  }

  const hasAllDocuments = (account: DigitalAccount) => {
    const basicDocs =
      account.selfie && account.address_proof && account.identification

    if (account.user_account_type === 'PF') {
      return !!basicDocs
    } else {
      return !!basicDocs && !!account.social_contract && !!account.balance_sheet
    }
  }

  const totalPages = data?.meta ? data.meta.last_page : 1

  return (
    <>
      <Head>
        <title>Contas Digitais | Contador</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Flex justify="space-between" align="center" w="full" gap={4}>
            <Flex gap={2} align="center">
              <CreditCard size={24} color="#131D53" />
              <Text fontSize="sm" color="#131D53">
                Contas Digitais
              </Text>
            </Flex>
            <HStack spacing={3}>
              <Box minW="200px">
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
              <Box minW="180px">
                <Select
                  value={filters.status || ''}
                  onChange={(e) =>
                    setStatus((e.target.value as any) || undefined)
                  }
                  size="sm"
                  fontSize="xs"
                  placeholder="Todos os status"
                >
                  <option value="pending">Pendente</option>
                  <option value="verified">Aprovado</option>
                  <option value="rejected">Rejeitado</option>
                </Select>
              </Box>
            </HStack>
          </Flex>
        </PageHeader>

        <PageContent>
          <VStack spacing={6} align="start" w="full">
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
                Contas Digitais
              </Text>

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
                        >
                          Anexos
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <Tr key={i}>
                            <Td colSpan={7}>
                              <Skeleton height="20px" />
                            </Td>
                          </Tr>
                        ))
                      ) : data?.list && data.list.length > 0 ? (
                        data.list.map((account) => (
                          <Tr key={account.id}>
                            <Td fontSize="sm" color="#131D53" px={4}>
                              {new Date(account.created_at).toLocaleDateString(
                                'pt-BR'
                              )}
                            </Td>
                            <Td fontSize="sm" color="#131D53" px={4}>
                              {account.user_name}
                            </Td>
                            <Td fontSize="sm" color="#131D53" px={4}>
                              {account.user_document}
                            </Td>
                            <Td fontSize="sm" color="#131D53" px={4}>
                              {account.brand_name}
                            </Td>
                            <Td px={4}>
                              <Badge
                                colorScheme={
                                  account.user_account_type === 'PF'
                                    ? 'blue'
                                    : 'purple'
                                }
                                fontSize="xs"
                                px={2}
                                py={1}
                                borderRadius="6px"
                                textTransform="none"
                                fontWeight="500"
                              >
                                {account.user_account_type}
                              </Badge>
                            </Td>
                            <Td px={4}>
                              {account.status === 'pending' ? (
                                <HStack spacing={1}>
                                  <Button
                                    size="xs"
                                    leftIcon={<Check size={14} />}
                                    onClick={() =>
                                      handleApprove(
                                        account.id,
                                        account.user_name
                                      )
                                    }
                                    isDisabled={
                                      !hasAllDocuments(account) ||
                                      isApproving ||
                                      isRejecting
                                    }
                                    color="white"
                                    bgGradient="linear-gradient(180deg, #6EE7B7 -27.08%, #10B981 123.81%)"
                                    shadow="0px 0px 0px 1px #059669, 0px -1px 0px 0px rgba(5, 150, 105, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                                    _hover={{
                                      bgGradient:
                                        'linear-gradient(180deg, #86EFAC -27.08%, #22C55E 123.81%)',
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
                                    onClick={() =>
                                      handleReject(
                                        account.id,
                                        account.user_name
                                      )
                                    }
                                    isDisabled={isApproving || isRejecting}
                                  >
                                    Recusar
                                  </Button>
                                </HStack>
                              ) : account.status === 'verified' ? (
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
                                    account.updated_at
                                  ).toLocaleDateString('pt-BR')}
                                </Badge>
                              ) : account.status === 'rejected' ? (
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
                                    account.updated_at
                                  ).toLocaleDateString('pt-BR')}
                                </Badge>
                              ) : null}
                            </Td>
                            <Td px={4}>
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="gray"
                                leftIcon={<FileText size={16} />}
                                onClick={() => handleViewDocument(account, '')}
                                isDisabled={
                                  !account.selfie &&
                                  !account.address_proof &&
                                  !account.identification &&
                                  !account.social_contract &&
                                  !account.balance_sheet
                                }
                              >
                                Ver documentos
                              </Button>
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={7} textAlign="center" py={8}>
                            <Text fontSize="sm" color="#131D5399">
                              Nenhuma conta digital encontrada
                            </Text>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>

              {data?.list && data.list.length > 0 && (
                <Flex justify="space-between" align="center" px={3} pt={2}>
                  <Text fontSize="sm" color="#131D5399">
                    Mostrando {(filters.page - 1) * filters.per_page + 1}-
                    {Math.min(
                      filters.page * filters.per_page,
                      data.meta?.total_items || 0
                    )}{' '}
                    de {data.meta?.total_items || 0} contas
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

        <DocumentViewer
          isOpen={isOpen}
          onClose={onClose}
          documentUrl={selectedDocuments[currentDocIndex]?.url || null}
          documentTitle={selectedDocuments[currentDocIndex]?.title || ''}
          documents={selectedDocuments}
          currentIndex={currentDocIndex}
          onNavigate={handleNavigateDocument}
        />
      </AppLayout>
    </>
  )
}
