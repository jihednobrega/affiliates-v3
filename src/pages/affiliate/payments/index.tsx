import Head from 'next/head'
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
  SimpleGrid,
  useToast,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/AppLayout'
import { PageHeader, PageContent } from '@/components/PageHeader'
import { FinancialSummary } from '@/components/FinancialSummary'
import {
  CommissionCard,
  CommissionCardSkeleton,
} from '@/components/CommissionCard'
import { useFinances } from '@/hooks/useFinances'
import { useAdvancedSearch } from '@/hooks/useSearch'
import {
  Search,
  SlidersHorizontal,
  Wallet,
  BadgeDollarSign,
} from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os Status' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'invoiced', label: 'Faturado' },
  { value: 'handling', label: 'Processando' },
  { value: 'canceled', label: 'Cancelado' },
  { value: 'pending', label: 'Pendente' },
]

export default function PaymentsPage() {
  const toast = useToast()

  const {
    data,
    isLoading,
    hasError,
    filters,
    setStatus,
    setPage,
    exportExtract,
  } = useFinances()

  const {
    searchTerm,
    setSearchTerm,
    filteredData: filteredCommissions,
  } = useAdvancedSearch({
    data: data?.commissions || [],
    searchFields: ['name', 'customer', 'vendor_order_id'],
    filters: { status: filters.status },
  })

  const currentStatus = STATUS_OPTIONS.find(
    (option) => option.value === filters.status,
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
            </Flex>

            <HStack spacing={3}>
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
                  placeholder="Pesquisar por produto, cliente ou pedido"
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
                    gap={1.5}
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
                        filters.status === option.value ? 'blue.600' : 'inherit'
                      }
                      fontSize="sm"
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </HStack>
          </Box>
        </PageHeader>

        <PageContent>
          <FinancialSummary isLoading={isLoading} />

          {hasError && (
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

          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="600" color="#131D53">
              Histórico de Comissões
            </Text>
            {data?.commissions && (
              <Text fontSize="sm" color="#131D5399">
                {filteredCommissions.length} de {data.commissions.length}{' '}
                comissões
              </Text>
            )}
          </Flex>

          {isLoading ? (
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
              {Array.from({ length: 6 }).map((_, i) => (
                <CommissionCardSkeleton key={i} />
              ))}
            </SimpleGrid>
          ) : filteredCommissions.length > 0 ? (
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
              {filteredCommissions.map((commission) => (
                <CommissionCard
                  key={`${commission.id}-${commission.vendor_order_id}`}
                  commission={commission}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Box
              textAlign="center"
              py={12}
              bg="white"
              borderRadius="12px"
              borderWidth={1}
              borderColor="#DEE6F2"
            >
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
                  <Wallet size={32} color="#A0AEC0" />
                </Box>
                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="600" color="#131D53">
                    {searchTerm || filters.status
                      ? 'Nenhuma comissão encontrada'
                      : 'Nenhuma comissão ainda'}
                  </Text>
                  <Text
                    fontSize="sm"
                    color="#131D5399"
                    maxW="400px"
                    textAlign="center"
                  >
                    {searchTerm || filters.status
                      ? 'Tente ajustar os filtros ou termo de busca para encontrar suas comissões.'
                      : 'Suas comissões aparecerão aqui conforme você realizar vendas através dos seus links de afiliado.'}
                  </Text>
                </VStack>
              </VStack>
            </Box>
          )}

          {data?.meta && data.meta.last_page > 1 && (
            <HStack justify="center" spacing={2}>
              <Button
                size="sm"
                variant="outline"
                isDisabled={data.meta.current_page === 1}
                onClick={() => setPage(data.meta.current_page - 1)}
              >
                Anterior
              </Button>
              <Text fontSize="sm" color="#131D5399">
                Página {data.meta.current_page} de {data.meta.last_page}
              </Text>
              <Button
                size="sm"
                variant="outline"
                isDisabled={data.meta.current_page === data.meta.last_page}
                onClick={() => setPage(data.meta.current_page + 1)}
              >
                Próxima
              </Button>
            </HStack>
          )}
        </PageContent>
      </AppLayout>
    </>
  )
}
