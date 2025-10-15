/**
 * Utilitários para formatação de campos com máscaras
 */

export const masks = {
  /**
   * Formatar CPF: 000.000.000-00
   */
  cpf: (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    const limited = cleaned.substring(0, 11)

    if (limited.length <= 3) return limited
    if (limited.length <= 6) return `${limited.slice(0, 3)}.${limited.slice(3)}`
    if (limited.length <= 9)
      return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`

    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(
      6,
      9
    )}-${limited.slice(9)}`
  },

  /**
   * Formatar CNPJ: 00.000.000/0000-00
   */
  cnpj: (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    const limited = cleaned.substring(0, 14)

    if (limited.length <= 2) return limited
    if (limited.length <= 5) return `${limited.slice(0, 2)}.${limited.slice(2)}`
    if (limited.length <= 8)
      return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`
    if (limited.length <= 12)
      return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(
        5,
        8
      )}/${limited.slice(8)}`

    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(
      5,
      8
    )}/${limited.slice(8, 12)}-${limited.slice(12)}`
  },

  /**
   * Formatar Telefone: (00) 00000-0000 ou (00) 0000-0000
   */
  phone: (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    const limited = cleaned.substring(0, 11)

    if (limited.length <= 2) return limited
    if (limited.length <= 6)
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`
    if (limited.length <= 10)
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(
        6
      )}`

    // Celular com 9 dígitos
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`
  },

  /**
   * Formatar CEP: 00000-000
   */
  cep: (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    const limited = cleaned.substring(0, 8)

    if (limited.length <= 5) return limited

    return `${limited.slice(0, 5)}-${limited.slice(5)}`
  },

  /**
   * Formatar conta bancária: separa número do dígito
   * Ex: 123456 -> 123456 (sem dígito) ou 123456-7 -> 123456-7 (com dígito)
   */
  bankAccount: (value: string): string => {
    // Remove espaços e caracteres especiais, mantém apenas números e hífen
    const cleaned = value.replace(/[^\d-]/g, '')

    // Se já tem hífen, limita a estrutura
    if (cleaned.includes('-')) {
      const parts = cleaned.split('-')
      const accountNumber = parts[0]
      const digit = parts[1]?.substring(0, 2) || '' // Máximo 2 dígitos

      if (digit) {
        return `${accountNumber}-${digit}`
      }
      return accountNumber
    }

    return cleaned
  },

  /**
   * Formatar agência bancária: similar à conta
   */
  bankAgency: (value: string): string => {
    const cleaned = value.replace(/[^\d-]/g, '')

    if (cleaned.includes('-')) {
      const parts = cleaned.split('-')
      const agencyNumber = parts[0]
      const digit = parts[1]?.substring(0, 1) || '' // Máximo 1 dígito para agência

      if (digit) {
        return `${agencyNumber}-${digit}`
      }
      return agencyNumber
    }

    return cleaned
  },

  /**
   * Remove formatação - retorna apenas números
   */
  unmask: (value: string): string => {
    return value.replace(/\D/g, '')
  },

  /**
   * Remove formatação mantendo alguns caracteres especiais (para contas bancárias)
   */
  unmaskKeepHyphen: (value: string): string => {
    return value.replace(/[^\d-]/g, '')
  },
}

/**
 * Hook para aplicar máscara em tempo real
 */
export const useMask = (maskType: keyof typeof masks) => {
  const applyMask = (value: string): string => {
    if (!value) return ''
    return masks[maskType](value)
  }

  return { applyMask }
}

/**
 * Utilitário para validar se um campo com máscara está completo
 */
export const maskValidation = {
  isCPFComplete: (value: string): boolean => {
    return masks.unmask(value).length === 11
  },

  isCNPJComplete: (value: string): boolean => {
    return masks.unmask(value).length === 14
  },

  isPhoneComplete: (value: string): boolean => {
    const cleaned = masks.unmask(value)
    return cleaned.length === 10 || cleaned.length === 11 // Fixo ou celular
  },

  isCEPComplete: (value: string): boolean => {
    return masks.unmask(value).length === 8
  },
}
