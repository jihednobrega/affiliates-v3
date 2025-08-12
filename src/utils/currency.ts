export function formatCurrency(value: number | string | undefined): string {
  const parseValue = (val: number | string | undefined): number => {
    if (val === undefined || val === null) return 0
    if (typeof val === 'number') return val

    const cleanedString = String(val).replace(/,/g, '')
    const parsed = Number(cleanedString)

    return isNaN(parsed) ? 0 : parsed
  }

  const safeValue = parseValue(value)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}
