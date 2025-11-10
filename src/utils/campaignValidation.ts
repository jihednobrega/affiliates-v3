import { z } from 'zod'

export const campaignSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Nome da campanha é obrigatório' })
      .max(100, { message: 'Nome deve ter no máximo 100 caracteres' }),

    description: z.string().optional(),

    banner: z.string().optional(),

    commission: z
      .string()
      .min(1, { message: 'Comissão é obrigatória' })
      .transform((value) => {
        const normalized = value.replace(',', '.')
        return Number(normalized).toFixed(2)
      })
      .refine(
        (value) => {
          const num = parseFloat(value)
          return !isNaN(num) && num > 0
        },
        { message: 'Comissão deve ser um número maior que 0' }
      ),

    start_date: z
      .string()
      .min(1, { message: 'Data de início é obrigatória' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Data deve estar no formato YYYY-MM-DD',
      }),

    end_date: z
      .string()
      .min(1, { message: 'Data de término é obrigatória' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Data deve estar no formato YYYY-MM-DD',
      }),

    items: z
      .array(
        z.object({
          type: z.enum(['category', 'product'], {
            message: 'Tipo deve ser "category" ou "product"',
          }),
          id: z.string().min(1, { message: 'ID do item é obrigatório' }),
        })
      )
      .min(1, { message: 'Selecione pelo menos 1 produto ou categoria' })
      .max(10, { message: 'Máximo de 10 itens por campanha' }),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)
      return end >= start
    },
    {
      message: 'Data de término deve ser posterior à data de início',
      path: ['end_date'],
    }
  )

export type CampaignFormValues = z.infer<typeof campaignSchema>

export function isHighCommission(commission: string | number): boolean {
  const value =
    typeof commission === 'string'
      ? parseFloat(commission.replace(',', '.'))
      : commission
  return value > 30
}
