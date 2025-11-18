import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  Flex,
  Select,
  Text,
  VStack,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { Wallet, FileText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { AccountantBillingService } from '@/services/accountant-billing'

interface Period {
  value: string
  label: string
  start: string
  end: string
}

interface CommissionTabProps {
  brandId: number
  month: string
  onGenerateInvoice: (period: string, dueDate: string) => Promise<void>
  isGenerating: boolean
}

export function CommissionTab({
  brandId,
  month,
  onGenerateInvoice,
  isGenerating,
}: CommissionTabProps) {
  const toast = useToast()
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const billingService = useMemo(() => new AccountantBillingService(), [])

  const periods = useMemo((): Period[] => {
    if (!month) return []

    const [year, monthNum] = month.split('-')
    const lastDayNum = new Date(parseInt(year), parseInt(monthNum), 0).getDate()

    const period1Start = `${year}-${monthNum}-01`
    const period1End = `${year}-${monthNum}-15`
    const period2Start = `${year}-${monthNum}-16`
    const period2End = `${year}-${monthNum}-${lastDayNum
      .toString()
      .padStart(2, '0')}`

    const formatDate = (dateStr: string) => {
      const [y, m, d] = dateStr.split('-')
      return `${d}/${m}/${y}`
    }

    return [
      {
        value: `${period1Start}:${period1End}`,
        label: `${formatDate(period1Start)} - ${formatDate(period1End)}`,
        start: period1Start,
        end: period1End,
      },
      {
        value: `${period2Start}:${period2End}`,
        label: `${formatDate(period2Start)} - ${formatDate(period2End)}`,
        start: period2Start,
        end: period2End,
      },
    ]
  }, [month])

  const {
    data: periodData,
    isLoading: isLoadingPeriod,
    refetch,
  } = useQuery({
    queryKey: ['accountant', 'billings', 'period', brandId, selectedPeriod],
    queryFn: async () => {
      if (!selectedPeriod || !brandId) return null

      const response = await billingService.getBillings({
        brand_id: brandId,
        month,
        period: selectedPeriod,
      })

      return response.response.data
    },
    enabled: !!selectedPeriod && !!brandId,
    staleTime: 1 * 60 * 1000,
  })

  useEffect(() => {
    if (periods.length > 0) {
      setSelectedPeriod(periods[0].value)
    }
  }, [periods])

  const handleGenerate = async () => {
    if (!selectedPeriod) {
      toast({
        title: 'Período obrigatório',
        description: 'Por favor, selecione o período quinzenal',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    try {
      await onGenerateInvoice(selectedPeriod, '')
      toast({
        title: 'Fatura de comissão gerada com sucesso!',
        status: 'success',
        duration: 3000,
      })

      setSelectedPeriod(periods[0]?.value || '')
      refetch()
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar fatura',
        description: error.message || 'Tente novamente mais tarde',
        status: 'error',
        duration: 5000,
      })
    }
  }

  const commissionData = periodData
    ? {
        totalSales: periodData.total_sales || '0',
        totalAffiliatesSales: periodData.total_affiliates_sales || '0',
        commissions: periodData.commissions || '0',
        daysToBill: periodData.days_to_bill || 15,
      }
    : null

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
          bg="#FFE1CD"
          w={8}
          h={8}
          align="center"
          justify="center"
          borderRadius="md"
          p={1}
        >
          <Wallet size={20} color="#AA4100" />
        </Flex>
        <Text fontSize="md" color="#131D53" fontWeight="600">
          Comissionamento
        </Text>
      </Flex>

      <VStack align="start" spacing={2} w="full">
        <Text fontSize="xs" color="#131D5399">
          Período Quinzenal
        </Text>
        <Select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          size="sm"
          fontSize="xs"
          placeholder="Selecione o período"
        >
          {periods.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </Select>
      </VStack>

      {selectedPeriod && (
        <>
          {isLoadingPeriod ? (
            <Flex justify="center" align="center" py={6}>
              <Spinner size="sm" color="#203BE2" />
              <Text ml={3} fontSize="sm" color="#131D5399">
                Carregando dados do período...
              </Text>
            </Flex>
          ) : commissionData ? (
            <VStack align="start" spacing={3}>
              <Box>
                <Text fontSize="xs" color="#131D5399">
                  Vendas por Afiliados
                </Text>
                <Text fontSize="lg" color="#131D53" fontWeight="600">
                  {(() => {
                    const value = parseFloat(
                      commissionData.totalAffiliatesSales
                    )
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
                  Total de Comissões
                </Text>
                <Text fontSize="2xl" color="#131D53" fontWeight="700">
                  {(() => {
                    const value = parseFloat(commissionData.commissions)
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
                  Dias do Período
                </Text>
                <Text fontSize="lg" color="#131D53" fontWeight="600">
                  {commissionData.daysToBill || '-'} dias
                </Text>
              </Box>
            </VStack>
          ) : (
            <Flex
              p={4}
              justify="center"
              align="center"
              bg="#F9FBFB"
              borderRadius="md"
            >
              <Text fontSize="sm" color="#131D5399">
                Nenhum dado disponível para este período
              </Text>
            </Flex>
          )}
        </>
      )}

      <Button
        w="full"
        size="sm"
        leftIcon={<FileText size={16} />}
        onClick={handleGenerate}
        isLoading={isGenerating}
        isDisabled={!selectedPeriod || isGenerating || isLoadingPeriod}
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
        Gerar Fatura
      </Button>
    </Flex>
  )
}
