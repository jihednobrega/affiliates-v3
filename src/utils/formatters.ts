/**
 * Utilitários de formatação para valores monetários e percentuais
 */

/**
 * Formata um valor percentual removendo ".00" quando for número inteiro
 * Exemplo: 10.00 → "10%", 10.5 → "10.5%", 0 → "Consulte"
 * Trata valores não numéricos, undefined, null, etc.
 */
export const formatPercentage = (value: any): string => {
  // Validações robustas para diferentes tipos de entrada
  if (value === null || value === undefined || value === '') {
    return 'Consulte'
  }

  // Converter para número se for string
  let numericValue: number
  if (typeof value === 'string') {
    // Tentar converter string para número
    numericValue = parseFloat(value)
    if (isNaN(numericValue)) {
      console.warn(
        `formatPercentage: valor inválido "${value}", usando "Consulte"`
      )
      return 'Consulte'
    }
  } else if (typeof value === 'number') {
    numericValue = value
  } else {
    // Tipo não suportado
    console.warn(
      `formatPercentage: tipo não suportado "${typeof value}" para valor:`,
      value
    )
    return 'Consulte'
  }

  // Verificar se é um número válido
  if (isNaN(numericValue) || !isFinite(numericValue)) {
    console.warn(
      `formatPercentage: número inválido "${numericValue}", usando "Consulte"`
    )
    return 'Consulte'
  }

  // Se for negativo, mostrar "Consulte"
  if (numericValue < 0) {
    return 'Consulte'
  }

  // Converter para string com 2 casas decimais
  const formatted = numericValue.toFixed(2)

  // Remover ".00" se for número inteiro
  if (formatted.endsWith('.00')) {
    return formatted.slice(0, -3) + '%'
  }

  // Remover "0" final desnecessário (ex: 10.50 → 10.5%)
  if (formatted.endsWith('0') && formatted.includes('.')) {
    return formatted.slice(0, -1) + '%'
  }

  return formatted + '%'
}

/**
 * Formata um valor monetário para exibição em Real brasileiro
 * Exemplo: 1234.56 → "R$ 1.234,56", 0 → "Consulte"
 * Trata valores não numéricos, undefined, null, etc.
 */
export const formatCurrency = (value: any): string => {
  // Validações robustas para diferentes tipos de entrada
  if (value === null || value === undefined || value === '') {
    return 'Consulte'
  }

  // Converter para número se for string
  let numericValue: number
  if (typeof value === 'string') {
    numericValue = parseFloat(value)
    if (isNaN(numericValue)) {
      console.warn(
        `formatCurrency: valor inválido "${value}", usando "Consulte"`
      )
      return 'Consulte'
    }
  } else if (typeof value === 'number') {
    numericValue = value
  } else {
    console.warn(
      `formatCurrency: tipo não suportado "${typeof value}" para valor:`,
      value
    )
    return 'Consulte'
  }

  // Verificar se é um número válido
  if (isNaN(numericValue) || !isFinite(numericValue)) {
    console.warn(
      `formatCurrency: número inválido "${numericValue}", usando "Consulte"`
    )
    return 'Consulte'
  }

  // Se for negativo, mostrar "Consulte"
  if (numericValue < 0) {
    return 'Consulte'
  }

  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Formata um valor monetário sem o símbolo da moeda
 * Exemplo: 1234.56 → "1.234,56", 0 → "Consulte"
 * Trata valores não numéricos, undefined, null, etc.
 */
export const formatCurrencyValue = (value: any): string => {
  // Validações robustas para diferentes tipos de entrada
  if (value === null || value === undefined || value === '') {
    return 'Consulte'
  }

  // Converter para número se for string
  let numericValue: number
  if (typeof value === 'string') {
    numericValue = parseFloat(value)
    if (isNaN(numericValue)) {
      return 'Consulte'
    }
  } else if (typeof value === 'number') {
    numericValue = value
  } else {
    return 'Consulte'
  }

  // Verificar se é um número válido
  if (isNaN(numericValue) || !isFinite(numericValue)) {
    return 'Consulte'
  }

  // Se for negativo, mostrar "Consulte"
  if (numericValue < 0) {
    return 'Consulte'
  }

  return numericValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Formata uma data no formato brasileiro (DD/MM/YYYY)
 * Aceita tanto string ISO quanto Date
 */
export const formatDate = (date: string | Date): string => {
  try {
    if (typeof date === 'string') {
      // Se já está formatado (DD/MM/YYYY), retorna como está
      if (date.includes('/')) {
        return date
      }

      // Se é ISO (YYYY-MM-DD ou YYYY-MM-DD HH:mm:ss), converte
      if (date.includes('-')) {
        // Separar a parte da data da parte da hora (se existir)
        const datePart = date.split(' ')[0]
        const [year, month, day] = datePart.split('-')
        return `${day}/${month}/${year}`
      }
    }

    // Se é um objeto Date
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return String(date)
  }
}
