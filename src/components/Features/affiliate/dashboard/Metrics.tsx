import { useMemo, memo } from 'react'
import { Box, Skeleton, SkeletonCircle } from '@chakra-ui/react'
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
    <div className="p-3 bg-white flex flex-col gap-3 border border-[#dee6f2] rounded-xl container-shadow">
      <div className="flex items-center gap-3">
        <SkeletonCircle size="6" />
        <Skeleton height="12px" width="80px" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton height="14px" width="60px" />
        <Skeleton height="16px" width="40px" borderRadius="4px" />
      </div>
    </div>
  )

  if (isLoadingMetrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
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
        const trendBg = isPositive ? 'bg-[#d4fce2]' : 'bg-[#fed7d7]'
        const trendColor = isPositive ? 'text-[#008e5a]' : 'text-[#e53e3e]'

        return { TrendIcon, trendBg, trendColor, isPositive }
      }, [metric.growth])

      return (
        <div
          key={`${metric.label}-${index}`}
          className="p-3 bg-white flex flex-col gap-3 border border-[#dee6f2] rounded-xl container-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
              <img src={icon} alt={metric.label} />
            </div>
            <span className="text-xs text-[#131d5399]">{metric.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-[#131d53]">{metric.displayText}</p>
            {metric.growth !== 0 && !isNaN(metric.growth) && (
              <div
                className={`flex items-center gap-1 py-0.5 px-1 ${trendData.trendBg} rounded-sm`}
              >
                <trendData.TrendIcon
                  size={12}
                  className={trendData.trendColor}
                />
                <small
                  className={`font-semibold text-[10px] ${trendData.trendColor}`}
                >
                  {Math.abs(metric.growth).toFixed(1)}%
                </small>
              </div>
            )}
          </div>
        </div>
      )
    }
  )

  MetricCard.displayName = 'MetricCard'

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
      </div>
    </>
  )
}
