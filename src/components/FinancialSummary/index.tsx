import { Box, Grid, HStack, Text, VStack, Skeleton } from '@chakra-ui/react'
import { useFinancesSummary } from '@/hooks/useFinances'

interface FinancialSummaryProps {
  isLoading?: boolean
}

export function FinancialSummary({
  isLoading: externalLoading,
}: FinancialSummaryProps) {
  const { summary, isLoading: hookLoading } = useFinancesSummary()

  const isLoading = externalLoading || hookLoading

  if (isLoading) {
    return (
      <Grid templateColumns="repeat(auto-fit, minmax(240px, 1fr))" gap={4}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box
            key={i}
            bg="white"
            p={4}
            borderRadius="12px"
            borderWidth={1}
            borderColor="#DEE6F2"
            shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
          >
            <Skeleton height="60px" />
          </Box>
        ))}
      </Grid>
    )
  }

  if (!summary) {
    return (
      <Box
        bg="white"
        p={6}
        borderRadius="12px"
        borderWidth={1}
        borderColor="#DEE6F2"
        textAlign="center"
      >
        <Text color="gray.500">Erro ao carregar dados financeiros</Text>
      </Box>
    )
  }

  return (
    <Grid templateColumns="repeat(auto-fit, minmax(240px, 1fr))" gap={4}>
      <Box
        bg="white"
        p={4}
        borderRadius="12px"
        borderWidth={1}
        borderColor="#DEE6F2"
        shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
      >
        <VStack align="start" spacing={3}>
          <HStack>
            <Box
              w="24px"
              h="24px"
              bg="#DFEFFF"
              borderRadius="4px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <img
                src="/assets/icons/wallet-sky-blue.svg"
                alt="carteira"
                width="16px"
                height="16px"
              />
            </Box>
            <Text fontSize="xs" color="#131D5399" fontWeight="400">
              Disponível para Saque
            </Text>
          </HStack>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="600" color="#131D53">
              {summary.availableCommissionsFormatted}
            </Text>
            <Text fontSize="xs" color="#131D5399">
              Mínimo: {summary.minimumWithdrawAmountFormatted}
            </Text>
          </VStack>
        </VStack>
      </Box>

      <Box
        bg="white"
        p={4}
        borderRadius="12px"
        borderWidth={1}
        borderColor="#DEE6F2"
        shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
      >
        <VStack align="start" spacing={3}>
          <HStack>
            <Box
              w="24px"
              h="24px"
              bg="#DFEFFF"
              borderRadius="4px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <img
                src="/assets/icons/currency-dollar.svg"
                alt="vendas"
                width="16px"
                height="16px"
              />
            </Box>
            <Text fontSize="xs" color="#131D5399" fontWeight="400">
              Total de Vendas
            </Text>
          </HStack>
          <Text fontSize="2xl" fontWeight="600" color="#131D53">
            {summary.totalSalesFormatted}
          </Text>
        </VStack>
      </Box>

      <Box
        bg="white"
        p={4}
        borderRadius="12px"
        borderWidth={1}
        borderColor="#DEE6F2"
        shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
      >
        <VStack align="start" spacing={3}>
          <HStack>
            <Box
              w="24px"
              h="24px"
              bg="#DFEFFF"
              borderRadius="4px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <img
                src="/assets/icons/offer.svg"
                alt="futuro"
                width="16"
                height="16"
              />
            </Box>
            <Text fontSize="xs" color="#131D5399" fontWeight="400">
              Comissões Pendentes
            </Text>
          </HStack>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="600" color="#131D53">
              {summary.futureCommissionsFormatted}
            </Text>
            {summary.nextPayDate && (
              <Text fontSize="xs" color="#131D5399">
                Próximo pagamento:{' '}
                {new Date(summary.nextPayDate).toLocaleDateString('pt-BR')}
              </Text>
            )}
          </VStack>
        </VStack>
      </Box>

      <Box
        bg="white"
        p={4}
        borderRadius="12px"
        borderWidth={1}
        borderColor="#DEE6F2"
        shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
      >
        <VStack align="start" spacing={3}>
          <HStack>
            <Box
              w="24px"
              h="24px"
              bg="#DFEFFF"
              borderRadius="4px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <img
                src="/assets/icons/commissions.svg"
                alt="total"
                width="16"
                height="16"
              />
            </Box>
            <Text fontSize="xs" color="#131D5399" fontWeight="400">
              Total Acumulado
            </Text>
          </HStack>
          <Text fontSize="2xl" fontWeight="600" color="#131D53">
            {(
              summary.availableCommissions + summary.futureCommissions
            ).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </VStack>
      </Box>
    </Grid>
  )
}
