export const parseCommission = (value: string | number) => {
  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '').trim()
    return parseFloat(normalized) || 0
  }
  return value || 0
}

export function formatCurrencyWithoutSymbol(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const formatCurrency = (value: number | string) => {
  if (value === null || value === undefined || value === '') {
    return 'R$ 0,00'
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) {
    return 'R$ 0,00'
  }
  return numValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
