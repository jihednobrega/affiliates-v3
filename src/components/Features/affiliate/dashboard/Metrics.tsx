import { useMemo, memo } from 'react'
import {
  Box,
  Flex,
  Grid,
  Image,
  Skeleton,
  SkeletonCircle,
  Text,
} from '@chakra-ui/react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { DashboardComponentProps } from '@/types/dashboard.types'
import { useDashboard } from '@/hooks/useDashboard'

const METRIC_ICONS = {
  'Cliques Link Afiliado': '/assets/icons/cursor-click.svg',
  'Pedidos Efetuados': '/assets/icons/handbag-success.svg',
  'Taxa Conversão': '/assets/icons/percent-circle.svg',
  'Total em Vendas': '/assets/icons/currency-dollar.svg',
  'Comissão Estimada': '/assets/icons/wallet-sky-blue.svg',
  'Comissão Aprovada': '/assets/icons/commissions.svg',
}

export function Metrics({ dateRange }: DashboardComponentProps) {
  const { processedMetrics, isLoadingMetrics, hasMetricsData } =
    useDashboard(dateRange)

  const SkeletonCard = () => (
    <Flex
      p={3}
      bg="white"
      flexDirection="column"
      gap={3}
      border="1px solid"
      borderColor="#dee6f2"
      borderRadius="xl"
      className="container-shadow"
    >
      <Flex align="center" gap={3}>
        <SkeletonCircle size="6" />
        <Skeleton height="12px" width="80px" />
      </Flex>
      <Flex align="center" gap={2}>
        <Skeleton height="14px" width="60px" />
        <Skeleton height="16px" width="40px" borderRadius="4px" />
      </Flex>
    </Flex>
  )

  if (isLoadingMetrics) {
    return (
      <Grid
        templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
        gap={2}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </Grid>
    )
  }

  const MetricCard = memo(
    ({ metric, index }: { metric: any; index: number }) => {
      const icon = useMemo(
        () =>
          METRIC_ICONS[metric.label as keyof typeof METRIC_ICONS] ||
          '/assets/icons/currency-dollar.svg',
        [metric.label]
      )

      const trendData = useMemo(() => {
        const isPositive = metric.growth >= 0
        const TrendIcon = isPositive ? TrendingUp : TrendingDown
        const trendBg = isPositive ? '#d4fce2' : '#fed7d7'
        const trendColor = isPositive ? '#008e5a' : '#e53e3e'

        return { TrendIcon, trendBg, trendColor, isPositive }
      }, [metric.growth])

      return (
        <Flex
          key={`${metric.label}-${index}`}
          p={3}
          bg="white"
          flexDirection="column"
          gap={3}
          border="1px solid"
          borderColor="#dee6f2"
          borderRadius="xl"
          className="container-shadow"
        >
          <Flex align="center" gap={3}>
            <Flex
              bg="#dfefff"
              w={6}
              h={6}
              align="center"
              justify="center"
              borderRadius="sm"
              p={0.5}
            >
              <Image src={icon} alt={metric.label} />
            </Flex>
            <Text fontSize="xs" color="#131d5399">
              {metric.label}
            </Text>
          </Flex>
          <Flex align="center" gap={2}>
            <Text fontSize="sm" color="#131d53">
              {metric.displayText}
            </Text>
            {metric.growth !== 0 && !isNaN(metric.growth) && (
              <Flex
                align="center"
                gap={1}
                py={0.5}
                px={1}
                bg={trendData.trendBg}
                borderRadius="sm"
              >
                <Box
                  as={trendData.TrendIcon}
                  size={12}
                  color={trendData.trendColor}
                />
                <Text
                  fontWeight="semibold"
                  fontSize="10px"
                  color={trendData.trendColor}
                >
                  {Math.abs(metric.growth).toFixed(1)}%
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      )
    }
  )

  MetricCard.displayName = 'MetricCard'

  return (
    <>
      <Grid
        templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
        gap={2}
      >
        {processedMetrics.map((metric, index) => (
          <MetricCard
            key={`${metric.label}-${index}`}
            metric={metric}
            index={index}
          />
        ))}

        {!hasMetricsData && !isLoadingMetrics && (
          <Box gridColumn="1 / -1" textAlign="center" py={8} color="gray.500">
            Nenhum dado disponível para o período selecionado
          </Box>
        )}
      </Grid>
    </>
  )
}
