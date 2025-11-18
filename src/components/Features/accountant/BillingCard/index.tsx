import {
  Box,
  Button,
  HStack,
  Text,
  VStack,
  Badge,
  useToast,
} from '@chakra-ui/react'
import {
  AccountantListMonthlyFee,
  AccountantListTakeRate,
} from '@/services/types/accountant-billing.types'
import { formatCurrency } from '@/utils/formatters'

interface BillingCardProps {
  type: 'monthly_fee' | 'take_rate'
  data: AccountantListMonthlyFee | AccountantListTakeRate | null
  onGenerateInvoice: () => void
  isGenerating?: boolean
}

export function BillingCard({
  type,
  data,
  onGenerateInvoice,
  isGenerating,
}: BillingCardProps) {
  if (!data) {
    return null
  }

  const isMonthlyFee = type === 'monthly_fee'
  const title = isMonthlyFee ? 'Mensalidade SaaS' : 'Take Rate'

  const monthlyData = isMonthlyFee ? (data as AccountantListMonthlyFee) : null
  const takeRateData = !isMonthlyFee ? (data as AccountantListTakeRate) : null

  const hasInvoice = data.invoice !== null

  const getStatusBadge = (status?: string) => {
    if (!status) return null

    const statusConfig: Record<string, { color: string; label: string }> = {
      created: { color: 'blue', label: 'Criada' },
      pending: { color: 'yellow', label: 'Pendente' },
      payed: { color: 'green', label: 'Paga' },
      overdue: { color: 'red', label: 'Vencida' },
      expired: { color: 'gray', label: 'Expirada' },
    }

    const config = statusConfig[status] || { color: 'gray', label: status }

    return (
      <Badge colorScheme={config.color} fontSize="xs">
        {config.label}
      </Badge>
    )
  }

  return (
    <Box
      bg="white"
      p={6}
      borderRadius="12px"
      borderWidth={1}
      borderColor="#DEE6F2"
      shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
    >
      <VStack align="start" spacing={4} w="full">
        <HStack justify="space-between" w="full">
          <HStack>
            <Box
              w="32px"
              h="32px"
              bg="#DFEFFF"
              borderRadius="6px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <img
                src={
                  isMonthlyFee
                    ? '/assets/icons/calendar.svg'
                    : '/assets/icons/chart-line.svg'
                }
                alt={title}
                width="20px"
                height="20px"
              />
            </Box>
            <Text fontSize="md" fontWeight="600" color="#131D53">
              {title}
            </Text>
          </HStack>
          {hasInvoice && getStatusBadge(data.invoice?.status)}
        </HStack>

        {data.settings && data.settings.length > 0 && (
          <Box bg="#F3F6FA" p={3} borderRadius="8px" w="full">
            <Text fontSize="xs" color="#131D5399" fontWeight="600" mb={2}>
              Condições Contratuais
            </Text>
            <VStack align="start" spacing={1}>
              {data.settings.map((setting, index) => (
                <Text key={index} fontSize="xs" color="#131D53">
                  • {setting}
                </Text>
              ))}
            </VStack>
          </Box>
        )}

        {monthlyData && (
          <HStack w="full" justify="space-between">
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="#131D5399">
                Afiliados Ativos
              </Text>
              <Text fontSize="lg" fontWeight="600" color="#131D53">
                {monthlyData.active_affiliates}
              </Text>
            </VStack>
            <VStack align="end" spacing={0}>
              <Text fontSize="xs" color="#131D5399">
                Valor Mensal
              </Text>
              <Text fontSize="lg" fontWeight="600" color="#1F70F1">
                {formatCurrency(monthlyData.fee_amount)}
              </Text>
            </VStack>
          </HStack>
        )}

        {takeRateData && (
          <>
            <HStack w="full" justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="#131D5399">
                  {takeRateData.metric_type === 'revenue'
                    ? 'Revenue Total'
                    : 'Total de Pedidos'}
                </Text>
                <Text fontSize="lg" fontWeight="600" color="#131D53">
                  {takeRateData.metric_type === 'revenue'
                    ? formatCurrency(takeRateData.revenue)
                    : takeRateData.orders_count}
                </Text>
              </VStack>
              <VStack align="end" spacing={0}>
                <Text fontSize="xs" color="#131D5399">
                  Take Rate
                </Text>
                <Text fontSize="lg" fontWeight="600" color="#1F70F1">
                  {formatCurrency(takeRateData.take_rate_amount)}
                </Text>
              </VStack>
            </HStack>
          </>
        )}

        <HStack w="full" spacing={3}>
          {hasInvoice && data.invoice ? (
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              onClick={() => window.open(data.invoice!.payment_url, '_blank')}
              w="full"
            >
              Ver Fatura
            </Button>
          ) : (
            <Button
              size="sm"
              colorScheme="blue"
              onClick={onGenerateInvoice}
              isLoading={isGenerating}
              w="full"
            >
              Gerar Fatura
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  )
}
