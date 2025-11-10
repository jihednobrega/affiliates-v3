import { useMemo } from 'react'
import { Box, Flex, Text, Skeleton, VStack, HStack } from '@chakra-ui/react'
import { OrderChart } from './OrderChart'
import { OrdersSummary } from './OrderSummary'
import { DashboardComponentProps } from '@/types/dashboard.types'
import { useDashboard } from '@/hooks/useDashboard'

export function Orders({ dateRange }: DashboardComponentProps) {
  const {
    ordersEvolutionData,
    isLoadingOrders,
    hasOrdersData,
    allTimeMetricsData,
    isLoadingAllTimeMetrics,
    monthlyMetricsData,
    isLoadingMonthlyMetrics,
    isLoadingAny,
  } = useDashboard(dateRange)

  if (isLoadingAny) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        gap={3}
        p={3}
        pb={4}
        border="1px solid"
        borderColor="#DEE6F2"
        bg="white"
        borderRadius="xl"
        overflow="hidden"
        className="container-shadow"
      >
        <Text fontSize="sm" color="#131D53" px={3}>
          Pedidos
        </Text>
        <VStack spacing={5} align="stretch">
          <VStack spacing={3} align="stretch">
            <HStack px={2} spacing={3}>
              <Skeleton height="20px" width="80px" borderRadius={6} />
              <Skeleton height="20px" width="80px" borderRadius={6} />
            </HStack>
            <Box overflowX="auto">
              <Box minW="774px">
                <Skeleton height="200px" width="100%" borderRadius={6} />
              </Box>
            </Box>
          </VStack>
          <Skeleton height="60px" width="100%" borderRadius={6} />
        </VStack>
      </Box>
    )
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={3}
      p={3}
      pb={4}
      border="1px solid"
      borderColor="#DEE6F2"
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      className="container-shadow"
    >
      <Text fontSize="sm" color="#131D53" px={3}>
        Pedidos
      </Text>
      <VStack spacing={5} align="stretch">
        <VStack spacing={3} align="stretch">
          <HStack px={2} spacing={3}>
            <HStack spacing={1.5}>
              <Box
                border="1px solid"
                borderColor="#99ADFF"
                bg="#D9E7FF"
                borderRadius="sm"
                w={5}
                h={3.5}
              />
              <Text fontSize="xs" color="#131D5399">
                Cliques
              </Text>
              <Text fontSize="xs" color="#131D53">
                {allTimeMetricsData?.clicks?.current_period?.toLocaleString() ||
                  '--'}
              </Text>
            </HStack>

            <HStack spacing={1.5}>
              <Box
                bgGradient="linear(to-b, #5898FF, #9EC3FF)"
                borderRadius="sm"
                w={5}
                h={3.5}
              />
              <Text fontSize="xs" color="#131D5399">
                Pedidos
              </Text>
              <Text fontSize="xs" color="#131D53">
                {allTimeMetricsData?.orders?.current_period?.toLocaleString() ||
                  '--'}
              </Text>
            </HStack>
          </HStack>

          <Box overflowX="auto">
            <Box minW="774px">
              <OrderChart
                ordersData={ordersEvolutionData}
                monthlyMetricsData={monthlyMetricsData}
              />
            </Box>
          </Box>
        </VStack>

        <OrdersSummary ordersData={ordersEvolutionData} />
      </VStack>

      {!hasOrdersData && !isLoadingAny && (
        <Box textAlign="center" py={8} color="gray.500">
          Nenhum dado de pedidos disponível
        </Box>
      )}
    </Box>
  )
}
