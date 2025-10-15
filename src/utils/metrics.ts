import {
  MainMetricsData,
  ProcessedMetric,
} from '@/services/types/dashboard.types'

/**
 * Utilitários para processamento de métricas do dashboard
 * Separado do DashboardService para manter responsabilidade única
 */

/**
 * Calcula a variação percentual entre dois valores
 */
export const calculateGrowth = (current: number, previous: number): number => {
  console.log('📊 calculateGrowth:', {
    current,
    previous,
    currentType: typeof current,
    previousType: typeof previous,
  })

  // Garantir que os valores são números
  const currentNum = Number(current) || 0
  const previousNum = Number(previous) || 0

  if (previousNum === 0) return currentNum > 0 ? 100 : 0
  return ((currentNum - previousNum) / previousNum) * 100
}

/**
 * Determina a tendência baseada no crescimento
 */
export const getTrend = (growth: number): 'up' | 'down' | 'neutral' => {
  if (growth > 0) return 'up'
  if (growth < 0) return 'down'
  return 'neutral'
}

/**
 * Processa os dados brutos das métricas da API em formato adequado para exibição
 */
export const processMetrics = (
  mainMetrics: MainMetricsData,
  formatCurrency: (value: number) => string
): ProcessedMetric[] => {
  console.log('🔍 processMetrics - Dados recebidos:', mainMetrics)

  // Taxa de conversão calculada
  const conversionRate =
    mainMetrics.clicks.current_period > 0
      ? (mainMetrics.orders.current_period /
          mainMetrics.clicks.current_period) *
        100
      : 0

  const conversionGrowth = calculateGrowth(
    mainMetrics.orders.current_period,
    mainMetrics.orders.previous_period
  )

  return [
    {
      label: 'Cliques Link Afiliado',
      value: mainMetrics.clicks.current_period,
      displayText: mainMetrics.clicks.current_period.toString(),
      growth: calculateGrowth(
        mainMetrics.clicks.current_period,
        mainMetrics.clicks.previous_period
      ),
      trend: getTrend(
        calculateGrowth(
          mainMetrics.clicks.current_period,
          mainMetrics.clicks.previous_period
        )
      ),
      info: 'Total de cliques em seus links gerados durante o periodo selecionado.',
    },
    {
      label: 'Pedidos Efetuados',
      value: mainMetrics.orders.current_period,
      displayText: mainMetrics.orders.current_period.toString(),
      growth: calculateGrowth(
        mainMetrics.orders.current_period,
        mainMetrics.orders.previous_period
      ),
      trend: getTrend(
        calculateGrowth(
          mainMetrics.orders.current_period,
          mainMetrics.orders.previous_period
        )
      ),
      info: 'Total de pedidos realizados a partir de seus links durante o periodo selecionado.',
    },
    {
      label: 'Taxa Conversão',
      value: conversionRate,
      displayText: `${conversionRate.toFixed(1)}%`,
      growth: conversionGrowth,
      trend: getTrend(conversionGrowth),
      info: 'Percentual de conversao de cliques em pedidos no periodo selecionado.',
    },
    {
      label: 'Total em Vendas',
      value: mainMetrics.sales.current_period,
      displayText: formatCurrency(mainMetrics.sales.current_period),
      growth: calculateGrowth(
        mainMetrics.sales.current_period,
        mainMetrics.sales.previous_period
      ),
      trend: getTrend(
        calculateGrowth(
          mainMetrics.sales.current_period,
          mainMetrics.sales.previous_period
        )
      ),
      info: 'Total em vendas geradas pelos seus links no periodo selecionado.',
    },
    {
      label: 'Comissão Estimada',
      value: mainMetrics.estimated_commissions.current_period,
      displayText: formatCurrency(
        mainMetrics.estimated_commissions.current_period
      ),
      growth: calculateGrowth(
        mainMetrics.estimated_commissions.current_period,
        mainMetrics.estimated_commissions.previous_period
      ),
      trend: getTrend(
        calculateGrowth(
          mainMetrics.estimated_commissions.current_period,
          mainMetrics.estimated_commissions.previous_period
        )
      ),
      info: 'Estimativa de comissao dos pedidos no periodo selecionado.',
    },
    {
      label: 'Comissão Aprovada',
      value: mainMetrics.approved_commissions.current_period,
      displayText: formatCurrency(
        mainMetrics.approved_commissions.current_period
      ),
      growth: calculateGrowth(
        mainMetrics.approved_commissions.current_period,
        mainMetrics.approved_commissions.previous_period
      ),
      trend: getTrend(
        calculateGrowth(
          mainMetrics.approved_commissions.current_period,
          mainMetrics.approved_commissions.previous_period
        )
      ),
      info: 'Comissao aprovada sobre os pedidos confirmados no periodo.',
    },
  ]
}
