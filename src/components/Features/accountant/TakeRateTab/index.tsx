import { useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  VStack,
  Badge,
  useToast,
} from '@chakra-ui/react'
import { TrendingUp, FileText, ExternalLink } from 'lucide-react'
import { AccountantListTakeRate } from '@/services/types/accountant-billing.types'

interface TakeRateTabProps {
  data: AccountantListTakeRate | null
  brandId: number
  month: string
  onGenerateInvoice: (dueDate: string, amount: string) => Promise<void>
  isGenerating: boolean
}

export function TakeRateTab({
  data,
  brandId,
  month,
  onGenerateInvoice,
  isGenerating,
}: TakeRateTabProps) {
  const toast = useToast()
  const [dueDate, setDueDate] = useState('')

  const handleGenerate = async () => {
    if (!dueDate) {
      toast({
        title: 'Data de vencimento obrigatória',
        description: 'Por favor, selecione a data de vencimento',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    if (!data?.take_rate_amount) {
      toast({
        title: 'Erro',
        description: 'Valor do take rate não disponível',
        status: 'error',
        duration: 3000,
      })
      return
    }

    try {
      await onGenerateInvoice(dueDate, data.take_rate_amount)
      toast({
        title: 'Fatura gerada com sucesso!',
        status: 'success',
        duration: 3000,
      })
      setDueDate('')
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar fatura',
        description: error.message || 'Tente novamente mais tarde',
        status: 'error',
        duration: 5000,
      })
    }
  }

  const handleOpenPaymentUrl = () => {
    if (data?.invoice?.payment_url) {
      window.open(data.invoice.payment_url, '_blank')
    }
  }

  if (!data) {
    return (
      <Flex
        p={6}
        justify="center"
        align="center"
        minH="300px"
        bg="#F9FBFB"
        borderRadius="xl"
      >
        <Text fontSize="sm" color="#131D5399">
          Nenhum dado de take rate disponível para esta marca
        </Text>
      </Flex>
    )
  }

  const invoice = data.invoice
  const hasInvoice = invoice && invoice.invoice_id
  const isInvoicePending = hasInvoice && invoice.status === 'pending'
  const isInvoicePaid = hasInvoice && invoice.status === 'payed'

  return (
    <Flex
      p={4}
      bg="white"
      flexDirection="column"
      gap={4}
      border="1px solid #DEE6F2"
      borderRadius="xl"
      className="container-shadow"
    >
      <Flex align="center" gap={3}>
        <Flex
          bg="#E1FFDF"
          w={8}
          h={8}
          align="center"
          justify="center"
          borderRadius="md"
          p={1}
        >
          <TrendingUp size={20} color="#054400" />
        </Flex>
        <Text fontSize="md" color="#131D53" fontWeight="600">
          Take Rate
        </Text>
      </Flex>

      {data.settings && data.settings.length > 0 && (
        <VStack align="start" spacing={2}>
          <Text fontSize="xs" color="#131D5399" fontWeight="500">
            Condições Contratuais:
          </Text>
          {data.settings.map((setting, index) => (
            <Text key={index} fontSize="sm" color="#131D53">
              • {setting}
            </Text>
          ))}
        </VStack>
      )}

      <VStack align="start" spacing={3}>
        <Box>
          <Text fontSize="xs" color="#131D5399">
            {data.metric_type === 'orders_count'
              ? 'Número de Pedidos'
              : 'Faturamento Total'}
          </Text>
          <Text fontSize="lg" color="#131D53" fontWeight="600">
            {data.metric_type === 'orders_count'
              ? data.orders_count || '-'
              : (() => {
                  const value = parseFloat(data.revenue)
                  return !isNaN(value) && isFinite(value)
                    ? value.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })
                    : '-'
                })()}
          </Text>
        </Box>

        <Box>
          <Text fontSize="xs" color="#131D5399">
            Valor do Take Rate
          </Text>
          <Text fontSize="2xl" color="#22C55E" fontWeight="700">
            {(() => {
              const value = parseFloat(data.take_rate_amount)
              return !isNaN(value) && isFinite(value)
                ? value.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })
                : '-'
            })()}
          </Text>
        </Box>
      </VStack>

      {hasInvoice && (
        <Flex align="center" gap={2}>
          <Badge
            colorScheme={
              isInvoicePaid ? 'green' : isInvoicePending ? 'yellow' : 'gray'
            }
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="6px"
            textTransform="none"
            fontWeight="500"
          >
            {isInvoicePaid
              ? 'Pago'
              : isInvoicePending
              ? 'Aguardando Pagamento'
              : invoice.status}
          </Badge>
          {isInvoicePending && invoice.payment_url && (
            <Button
              size="xs"
              variant="ghost"
              colorScheme="blue"
              leftIcon={<ExternalLink size={12} />}
              onClick={handleOpenPaymentUrl}
            >
              Abrir Link de Pagamento
            </Button>
          )}
        </Flex>
      )}

      {(!hasInvoice || invoice.status === 'canceled') && (
        <>
          <VStack align="start" spacing={2} w="full">
            <Text fontSize="xs" color="#131D5399">
              Data de Vencimento
            </Text>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              size="sm"
              fontSize="xs"
            />
          </VStack>

          <Button
            w="full"
            size="sm"
            leftIcon={<FileText size={16} />}
            onClick={handleGenerate}
            isLoading={isGenerating}
            isDisabled={!dueDate || isGenerating}
            color="white"
            bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
            shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
            _hover={{
              bgGradient:
                'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
              shadow:
                '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
            }}
            transition="all 0.2s ease"
            fontSize="xs"
          >
            {invoice?.status === 'canceled'
              ? 'Gerar Nova Fatura'
              : 'Gerar Fatura'}
          </Button>
        </>
      )}
    </Flex>
  )
}
