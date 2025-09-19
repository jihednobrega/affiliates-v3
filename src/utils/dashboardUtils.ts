import { DateRange } from '@/types/dashboard.types'

export interface PeriodOption {
  label: string
  value: string
  interval: string
  previous: string
}

export const getDateRanges = (): PeriodOption[] => [
  {
    label: 'Hoje',
    value: 'today',
    interval: 'today',
    previous: 'yesterday',
  },
  {
    label: 'Últimos 7 dias',
    value: 'last_7_days',
    interval: 'week',
    previous: 'previous_week',
  },
  {
    label: 'Mês atual',
    value: 'current_month',
    interval: 'month',
    previous: 'previous_month',
  },
  {
    label: 'Mês anterior',
    value: 'last_month',
    interval: 'previous_month',
    previous: 'month_before_previous',
  },
  {
    label: 'Últimos 30 dias',
    value: 'last_30_days',
    interval: 'last_30_days',
    previous: 'previous_30_days',
  },
  {
    label: 'Últimos 90 dias',
    value: 'last_90_days',
    interval: 'last_90_days',
    previous: 'previous_90_days',
  },
]

export const getPreviousPeriod = (period: string): string => {
  const periodMap: Record<string, string> = {
    today: 'yesterday',
    week: 'previous_week',
    month: 'previous_month',
    previous_month: 'month_before_previous',
    last_30_days: 'previous_30_days',
    last_90_days: 'previous_90_days',
  }

  return periodMap[period] || 'previous_month'
}

export const calcularVariacaoPercentual = (
  atual: number,
  anterior: number
): number => {
  if (anterior === 0) return atual > 0 ? 100 : 0
  return ((atual - anterior) / anterior) * 100
}

export const formatDateSafe = (dateString: string): string => {
  const date = new Date(dateString + 'T12:00:00')
  return date.toLocaleDateString('pt-BR')
}

export const getPreviousPeriodFromDateRange = (
  startDate: string,
  endDate: string
): string => {
  const formatDate = (date: Date): string => date.toISOString().split('T')[0]
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date format. Use 'YYYY-MM-DD'")
  }

  const diffTime: number = end.getTime() - start.getTime()
  const diffDays: number = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1

  const prevStartDate = new Date(start)
  prevStartDate.setDate(start.getDate() - diffDays)

  const prevEndDate = new Date(end)
  prevEndDate.setDate(end.getDate() - diffDays)

  return `${formatDate(prevStartDate)}:${formatDate(prevEndDate)}`
}

export const dateRangeToApiParams = (dateRange: DateRange) => {
  const interval = `${dateRange.start_date}:${dateRange.end_date}`
  const previous = getPreviousPeriodFromDateRange(
    dateRange.start_date,
    dateRange.end_date
  )

  return {
    interval,
    previous,
  }
}

export const periodToApiParams = (
  selectedPeriod: string,
  customDateRange?: DateRange
) => {
  if (selectedPeriod === 'custom' && customDateRange) {
    return dateRangeToApiParams(customDateRange)
  }

  const periods = getDateRanges()
  const period = periods.find((p) => p.value === selectedPeriod)

  return {
    interval: period?.interval || 'month',
    previous: period?.previous || 'previous_month',
  }
}
