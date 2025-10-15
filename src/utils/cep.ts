import { useState } from 'react'

export interface CEPData {
  cep: string
  logradouro: string
  complemento?: string
  bairro: string
  localidade: string
  uf: string
  ibge?: string
  gia?: string
  ddd?: string
  siafi?: string
  erro?: boolean
}

export interface FormattedCEPData {
  address: string
  district: string
  city: string
  state: string
  zipcode: string
}

export const fetchCEPData = async (
  cep: string
): Promise<{ success: boolean; data?: FormattedCEPData; message?: string }> => {
  try {
    const cleanCEP = cep.replace(/\D/g, '')

    if (cleanCEP.length !== 8) {
      return { success: false, message: 'CEP deve ter 8 dígitos' }
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return { success: false, message: 'Erro ao consultar CEP' }
    }

    const data: CEPData = await response.json()

    if (data.erro) {
      return { success: false, message: 'CEP não encontrado' }
    }

    const formattedData: FormattedCEPData = {
      address: data.logradouro,
      district: data.bairro,
      city: data.localidade,
      state: data.uf,
      zipcode: cep,
    }

    return { success: true, data: formattedData }
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    return { success: false, message: 'Erro de conexão ao consultar CEP' }
  }
}

export const useCEP = () => {
  const [loading, setLoading] = useState(false)

  const searchCEP = async (cep: string) => {
    setLoading(true)
    try {
      const result = await fetchCEPData(cep)
      return result
    } finally {
      setLoading(false)
    }
  }

  return { searchCEP, loading }
}
