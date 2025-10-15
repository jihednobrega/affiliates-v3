/**
 * Utilitários para validação de campos
 */

export interface ValidationResult {
  isValid: boolean
  message?: string
}

export const validators = {
  /**
   * Validar CPF
   */
  cpf: (cpf: string): ValidationResult => {
    const cleaned = cpf.replace(/\D/g, '')

    // Verifica se tem 11 dígitos
    if (cleaned.length !== 11) {
      return { isValid: false, message: 'CPF deve ter 11 dígitos' }
    }

    // Verifica se não são todos iguais
    if (/^(\d)\1+$/.test(cleaned)) {
      return { isValid: false, message: 'CPF inválido' }
    }

    // Validação dos dígitos verificadores
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i)
    }
    let digit = 11 - (sum % 11)
    if (digit > 9) digit = 0
    if (parseInt(cleaned.charAt(9)) !== digit) {
      return { isValid: false, message: 'CPF inválido' }
    }

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i)
    }
    digit = 11 - (sum % 11)
    if (digit > 9) digit = 0
    if (parseInt(cleaned.charAt(10)) !== digit) {
      return { isValid: false, message: 'CPF inválido' }
    }

    return { isValid: true }
  },

  /**
   * Validar CNPJ
   */
  cnpj: (cnpj: string): ValidationResult => {
    const cleaned = cnpj.replace(/\D/g, '')

    if (cleaned.length !== 14) {
      return { isValid: false, message: 'CNPJ deve ter 14 dígitos' }
    }

    // Verifica se não são todos iguais
    if (/^(\d)\1+$/.test(cleaned)) {
      return { isValid: false, message: 'CNPJ inválido' }
    }

    // Validação do primeiro dígito verificador
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights1[i]
    }
    let digit = sum % 11
    if (digit < 2) digit = 0
    else digit = 11 - digit
    if (parseInt(cleaned.charAt(12)) !== digit) {
      return { isValid: false, message: 'CNPJ inválido' }
    }

    // Validação do segundo dígito verificador
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    sum = 0
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights2[i]
    }
    digit = sum % 11
    if (digit < 2) digit = 0
    else digit = 11 - digit
    if (parseInt(cleaned.charAt(13)) !== digit) {
      return { isValid: false, message: 'CNPJ inválido' }
    }

    return { isValid: true }
  },

  /**
   * Validar Email
   */
  email: (email: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email || email.trim() === '') {
      return { isValid: false, message: 'Campo obrigatório' }
    }

    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'E-mail inválido' }
    }

    return { isValid: true }
  },

  /**
   * Validar Telefone
   */
  phone: (phone: string): ValidationResult => {
    const cleaned = phone.replace(/\D/g, '')

    if (cleaned.length < 10) {
      return { isValid: false, message: 'Telefone deve ter pelo menos 10 dígitos' }
    }

    if (cleaned.length > 11) {
      return { isValid: false, message: 'Telefone deve ter no máximo 11 dígitos' }
    }

    // Verifica se o DDD é válido (11-99)
    const ddd = parseInt(cleaned.substring(0, 2))
    if (ddd < 11 || ddd > 99) {
      return { isValid: false, message: 'DDD inválido' }
    }

    return { isValid: true }
  },

  /**
   * Validar CEP
   */
  cep: (cep: string): ValidationResult => {
    const cleaned = cep.replace(/\D/g, '')

    if (cleaned.length !== 8) {
      return { isValid: false, message: 'CEP deve ter 8 dígitos' }
    }

    // CEP não pode ser 00000000
    if (cleaned === '00000000') {
      return { isValid: false, message: 'CEP inválido' }
    }

    return { isValid: true }
  },

  /**
   * Validar nome (obrigatório, mínimo 2 caracteres)
   */
  name: (name: string): ValidationResult => {
    if (!name || name.trim() === '') {
      return { isValid: false, message: 'Campo obrigatório' }
    }

    if (name.trim().length < 2) {
      return { isValid: false, message: 'Nome deve ter pelo menos 2 caracteres' }
    }

    return { isValid: true }
  },

  /**
   * Validar data de nascimento
   */
  birthdate: (birthdate: string): ValidationResult => {
    if (!birthdate) {
      return { isValid: false, message: 'Campo obrigatório' }
    }

    const today = new Date()
    const birth = new Date(birthdate)

    if (birth > today) {
      return { isValid: false, message: 'Data de nascimento não pode ser no futuro' }
    }

    const age = today.getFullYear() - birth.getFullYear()
    if (age < 18) {
      return { isValid: false, message: 'Deve ser maior de idade (18 anos)' }
    }

    if (age > 120) {
      return { isValid: false, message: 'Data de nascimento inválida' }
    }

    return { isValid: true }
  },

  /**
   * Validar campo obrigatório
   */
  required: (value: string, fieldName: string = 'Campo'): ValidationResult => {
    if (!value || value.trim() === '') {
      return { isValid: false, message: 'Campo obrigatório' }
    }

    return { isValid: true }
  },

  /**
   * Validar URL
   */
  url: (url: string): ValidationResult => {
    if (!url || url.trim() === '') {
      return { isValid: true } // URL é opcional
    }

    try {
      new URL(url)
      return { isValid: true }
    } catch {
      return { isValid: false, message: 'URL inválida' }
    }
  }
}

/**
 * Hook para validação em tempo real
 */
export const useValidation = () => {
  const validate = (value: string, validatorName: keyof typeof validators, ...args: any[]): ValidationResult => {
    const validator = validators[validatorName] as any
    return validator(value, ...args)
  }

  const validateMultiple = (fields: Array<{ value: string; validator: keyof typeof validators; args?: any[] }>): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {}
    let isValid = true

    fields.forEach((field, index) => {
      const result = validate(field.value, field.validator, ...(field.args || []))
      if (!result.isValid) {
        errors[`field_${index}`] = result.message || 'Campo inválido'
        isValid = false
      }
    })

    return { isValid, errors }
  }

  return { validate, validateMultiple }
}

/**
 * Utilitários para validação de grupos
 */
export const groupValidators = {
  /**
   * Validar dados pessoais básicos
   */
  personalData: (data: { name: string; email: string; cpf: string; phone: string; birthdate: string }) => {
    const errors: Record<string, string> = {}

    const nameValidation = validators.name(data.name)
    if (!nameValidation.isValid) errors.name = nameValidation.message!

    const emailValidation = validators.email(data.email)
    if (!emailValidation.isValid) errors.email = emailValidation.message!

    const cpfValidation = validators.cpf(data.cpf)
    if (!cpfValidation.isValid) errors.cpf = cpfValidation.message!

    const phoneValidation = validators.phone(data.phone)
    if (!phoneValidation.isValid) errors.phone = phoneValidation.message!

    const birthdateValidation = validators.birthdate(data.birthdate)
    if (!birthdateValidation.isValid) errors.birthdate = birthdateValidation.message!

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  /**
   * Validar endereço
   */
  address: (data: { zipcode: string; address: string; number: string; district: string; city: string; state: string }) => {
    const errors: Record<string, string> = {}

    const cepValidation = validators.cep(data.zipcode)
    if (!cepValidation.isValid) errors.zipcode = cepValidation.message!

    const addressValidation = validators.required(data.address)
    if (!addressValidation.isValid) errors.address = addressValidation.message!

    const numberValidation = validators.required(data.number)
    if (!numberValidation.isValid) errors.number = numberValidation.message!

    const districtValidation = validators.required(data.district)
    if (!districtValidation.isValid) errors.district = districtValidation.message!

    const cityValidation = validators.required(data.city)
    if (!cityValidation.isValid) errors.city = cityValidation.message!

    const stateValidation = validators.required(data.state)
    if (!stateValidation.isValid) errors.state = stateValidation.message!

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}