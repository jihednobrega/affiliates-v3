/**
 * Converte um período pré-definido para o formato de data start_date:end_date
 * Exemplo: "current_month" -> "2025-10-01:2025-10-31"
 */
export const periodToDateRange = (period: string): string | null => {
  const now = new Date()

  switch (period) {
    case 'all':
      // "all" não deve ser convertido - retorna null
      return null

    case 'current_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return `${start.toISOString().split('T')[0]}:${end.toISOString().split('T')[0]}`
    }

    case 'previous_month':
    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return `${start.toISOString().split('T')[0]}:${end.toISOString().split('T')[0]}`
    }

    case 'last_3_months': {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return `${start.toISOString().split('T')[0]}:${end.toISOString().split('T')[0]}`
    }

    case 'last_6_months': {
      const start = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return `${start.toISOString().split('T')[0]}:${end.toISOString().split('T')[0]}`
    }

    case 'current_year': {
      const start = new Date(now.getFullYear(), 0, 1)
      const end = new Date(now.getFullYear(), 11, 31)
      return `${start.toISOString().split('T')[0]}:${end.toISOString().split('T')[0]}`
    }

    case 'last_30_days': {
      const start = new Date(now)
      start.setDate(start.getDate() - 30)
      return `${start.toISOString().split('T')[0]}:${now.toISOString().split('T')[0]}`
    }

    case 'last_90_days': {
      const start = new Date(now)
      start.setDate(start.getDate() - 90)
      return `${start.toISOString().split('T')[0]}:${now.toISOString().split('T')[0]}`
    }

    case 'today': {
      return `${now.toISOString().split('T')[0]}:${now.toISOString().split('T')[0]}`
    }

    case 'last_7_days': {
      const start = new Date(now)
      start.setDate(start.getDate() - 7)
      return `${start.toISOString().split('T')[0]}:${now.toISOString().split('T')[0]}`
    }

    default:
      return null
  }
}

/**
 * Converte datas customizadas para o formato da API
 * Exemplo: ("2025-10-01", "2025-10-31") -> "2025-10-01:2025-10-31"
 */
export const customDateToRange = (startDate: string, endDate: string): string => {
  return `${startDate}:${endDate}`
}

/**
 * Verifica se um período é válido (não é "all")
 */
export const isValidPeriod = (period: string): boolean => {
  return period !== 'all' && period !== ''
}

/**
 * Formata data de forma segura evitando problemas de timezone
 */
export const formatDateSafe = (dateString: string): string => {
  const date = new Date(dateString + 'T12:00:00')
  return date.toLocaleDateString('pt-BR')
}
