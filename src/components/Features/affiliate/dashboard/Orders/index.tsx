import { Box, Skeleton } from '@chakra-ui/react'
import { OrderChart } from './OrderChart'
import { OrdersSummary } from './OrderSummary'
import { DashboardComponentProps } from '@/types/dashboard.types'
import { useDashboard } from '@/hooks/useDashboard'

export function Orders({ dateRange }: DashboardComponentProps) {
  const {
    ordersEvolutionData,
    hasOrdersData,
    allTimeMetricsData,
    monthlyMetricsData,
    isLoadingAny,
  } = useDashboard(dateRange)

  if (isLoadingAny) {
    return (
      <div className="flex flex-col gap-3 p-3 pb-4 border border-[#dee6f2] bg-white rounded-xl overflow-hidden container-shadow">
        <h2 className="text-sm text-[#131d53] px-3">Pedidos</h2>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="px-2 flex gap-3">
              <Skeleton height="20px" width="80px" rounded={6} />
              <Skeleton height="20px" width="80px" rounded={6} />
            </div>
            <div className="overflow-x-scroll">
              <div className="min-w-[774px]">
                <Skeleton height="200px" width="100%" rounded={6} />
              </div>
            </div>
          </div>
          <Skeleton height="60px" width="100%" rounded={6} />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3 p-3 pb-4 border border-[#dee6f2] bg-white rounded-xl overflow-hidden container-shadow">
        <h2 className="text-sm text-[#131d53] px-3">Pedidos</h2>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="px-2 flex gap-3">
              <div className="flex gap-1.5 items-center">
                <div className="border border-[#99adff] bg-[#d9e7ff] rounded-sm w-5 h-3.5"></div>
                <span className="text-[#131d5399] text-xs">Cliques</span>
                <span className="text-[#131d53] text-xs">
                  {allTimeMetricsData?.clicks?.current_period?.toLocaleString() ||
                    '--'}
                </span>
              </div>

              <div className="flex gap-1.5 items-center">
                <div className="bg-linear-to-b from-[#5898FF] to-[#9EC3FF] rounded-sm w-5 h-3.5"></div>
                <span className="text-[#131d5399] text-xs">Pedidos</span>
                <span className="text-[#131d53] text-xs">
                  {allTimeMetricsData?.orders?.current_period?.toLocaleString() ||
                    '--'}
                </span>
              </div>
            </div>
            <div className="overflow-x-scroll ">
              <div className="min-w-[774px]">
                <OrderChart
                  ordersData={ordersEvolutionData}
                  monthlyMetricsData={monthlyMetricsData}
                />
              </div>
            </div>
          </div>
          <OrdersSummary ordersData={ordersEvolutionData} />
        </div>

        {!hasOrdersData && !isLoadingAny && (
          <Box textAlign="center" py={8} color="gray.500">
            Nenhum dado de pedidos disponível
          </Box>
        )}
      </div>
    </>
  )
}
