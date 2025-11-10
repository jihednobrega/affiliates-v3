import { Box, Flex, Text } from '@chakra-ui/react'
import { GetOrderEvolutionResponse } from '@/services/types/dashboard.types'

type SummaryItem = {
  label: string
  value: string | number
}

interface OrdersSummaryProps {
  ordersData?: GetOrderEvolutionResponse['data']
}

export function OrdersSummary({ ordersData }: OrdersSummaryProps) {
  const summaryData: SummaryItem[] = [
    { label: 'Concluídos', value: ordersData?.done || 0 },
    { label: 'Em Processamento', value: ordersData?.processing || 0 },
    { label: 'Pagamentos Aprovados', value: ordersData?.approved || 0 },
    { label: 'Aguardando', value: ordersData?.awaiting || 0 },
    { label: 'Novos', value: ordersData?.new || 0 },
    { label: 'Cancelados', value: ordersData?.canceled || 0 },
  ]

  return (
    <Box border="1px solid" borderColor="#dee6f2" borderRadius="md">
      {summaryData.map((item, index) => (
        <Flex
          key={index}
          maxH="38px"
          align="center"
          justify="space-between"
          py={3}
          borderTop={index > 0 ? '1px solid' : 'none'}
          borderTopColor="#dee6f2"
        >
          <Text fontSize="xs" color="#131d5399" pl={4}>
            {item.label}
          </Text>
          <Text fontSize="sm" color="#131d53" pr={4}>
            {typeof item.value === 'number'
              ? item.value.toLocaleString()
              : item.value}
          </Text>
        </Flex>
      ))}
    </Box>
  )
}
