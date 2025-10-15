import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Input,
  useToast,
  Skeleton,
} from '@chakra-ui/react'
import { useState, ChangeEvent, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FinancesService } from '@/services/finances'
import { ProfileService } from '@/services/profile'
import { useAuth } from '@/hooks/useAuth'
import { parseCommission } from '@/utils/formatToCurrency'
import { InfoIcon, CreditCard, DollarSign, X } from 'lucide-react'

interface WithdrawalModalProps {
  isOpen: boolean
  onClose: () => void
  onWithdrawalSuccess: (message: string) => void
}

const accountTypeMapper = {
  checking: 'Conta Corrente',
  savings: 'Conta Poupança',
  investment: 'Conta Investimento',
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  onWithdrawalSuccess,
}) => {
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()
  const financesService = new FinancesService()
  const profileService = new ProfileService()
  const { user } = useAuth()

  const { data: withdrawalInfo, isLoading: isLoadingWithdrawalInfo } = useQuery(
    {
      queryKey: ['simplified-withdrawal-info'],
      queryFn: () => financesService.getSimplifiedWithdrawalInfo(),
      enabled: isOpen,
      select: (data) => data.response.data,
    }
  )

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['affiliate-profile'],
    queryFn: () => profileService.getAffiliateProfile(),
    enabled: isOpen,
    select: (data) => data.response.data,
  })

  useEffect(() => {
    if (!isOpen) {
      setAmount('')
    }
  }, [isOpen])

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const numericValue = event.target.value.replace(/\D/g, '')
    const numberValue = parseFloat(numericValue) / 100

    if (isNaN(numberValue)) {
      setAmount('')
      return
    }

    const formatted = numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    setAmount(formatted)
  }

  const getNumericValue = (formattedValue: string): number => {
    if (!formattedValue) return 0

    let numericString = formattedValue.replace(/[^\d,\.]/g, '')
    numericString = numericString.replace(/\./g, '')
    numericString = numericString.replace(',', '.')

    return parseFloat(numericString) || 0
  }

  const getApplicableTax = (
    withdrawalAmount: number
  ): {
    label: string
    value: number
    type: 'percent' | 'fixed'
  } => {
    let taxes: Array<{ operator: string; target: string; tax: string }> = []

    if (withdrawalInfo?.taxes) {
      if (typeof withdrawalInfo.taxes === 'string') {
        try {
          taxes = JSON.parse(withdrawalInfo.taxes)
        } catch (error) {
          console.warn('Erro ao fazer parse das taxas:', error)
          taxes = []
        }
      } else {
        taxes = withdrawalInfo.taxes as unknown as Array<{
          operator: string
          target: string
          tax: string
        }>
      }
    }

    for (const taxRule of taxes) {
      const target = parseFloat(taxRule.target)
      const isPercent = taxRule.tax.includes('%')
      const taxValue = parseFloat(taxRule.tax.replace('%', '').trim())

      const conditionMet =
        (taxRule.operator === '<' && withdrawalAmount < target) ||
        (taxRule.operator === '<=' && withdrawalAmount <= target) ||
        (taxRule.operator === '>' && withdrawalAmount > target) ||
        (taxRule.operator === '>=' && withdrawalAmount >= target)

      if (conditionMet) {
        return {
          label: taxRule.tax,
          value: taxValue,
          type: isPercent ? 'percent' : 'fixed',
        }
      }
    }

    return { label: '0', value: 0, type: 'fixed' }
  }

  const withdrawalAmount = getNumericValue(amount)
  const applicableTax = getApplicableTax(withdrawalAmount)

  const feeAmount =
    applicableTax.type === 'percent'
      ? withdrawalAmount * (applicableTax.value / 100)
      : applicableTax.value

  const netAmount = withdrawalAmount - feeAmount

  const availableBalance = parseCommission(user.balance || 0)

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const hasNoBankData = !profileData?.bank
  const isAmountValid =
    withdrawalAmount > 0 && withdrawalAmount <= availableBalance
  const hasWithdrawableAmount = withdrawalAmount > 0 && feeAmount > 0
  const isFormValid = isAmountValid && !hasNoBankData && hasWithdrawableAmount

  const handleSubmit = async () => {
    if (!isFormValid) return

    setIsSubmitting(true)
    try {
      const { response } = await financesService.postWithdrawal(
        withdrawalAmount.toFixed(2)
      )

      onWithdrawalSuccess(response.message || 'Saque solicitado com sucesso!')
      onClose()
      setAmount('')
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        'Erro ao processar saque. Tente novamente.'
      toast({
        title: 'Erro',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'xs', md: '2xl' }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        rounded={20}
        maxW={{ base: 'calc(100vw - 32px)', md: '600px' }}
        maxH={{ base: 'calc(100vh - 64px)', md: 'auto' }}
        mx={{ base: 4, md: 'auto' }}
        my={{ base: 8, md: 'auto' }}
      >
        <ModalHeader borderBottomWidth={1} borderBottomColor="#DEE6F2" p={3}>
          <HStack
            pl={3}
            align="center"
            justify="space-between"
            overflow="hidden"
          >
            <Text fontSize="sm" color="#131D53">
              Solicitação de Saque
            </Text>
            <Button
              onClick={onClose}
              w="44px"
              h="32px"
              background="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
              boxShadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset;"
              borderRadius="md"
              p={0}
            >
              <X size={20} color="#131d53" />
            </Button>
          </HStack>
        </ModalHeader>

        <ModalBody p={3}>
          <VStack spacing={3} align="stretch">
            <Box
              bg="white"
              p={4}
              borderRadius="12px"
              borderWidth={1}
              borderColor="#DEE6F2"
              shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
            >
              <VStack align="start" spacing={4}>
                <VStack align="start" spacing={2} w="full">
                  <HStack>
                    <Box
                      w="24px"
                      h="24px"
                      bg="#DFEFFF"
                      borderRadius="4px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <DollarSign size={16} color="#1F70F1" />
                    </Box>
                    <Text fontSize="xs" color="#131D5399" fontWeight="400">
                      Saldo Disponível
                    </Text>
                  </HStack>
                  <Text fontSize="lg" fontWeight={600} color="#131D53">
                    {formatCurrency(availableBalance)}
                  </Text>
                </VStack>

                <Box w="full" h="1px" bg="#DEE6F2" />

                <VStack align="start" spacing={2} w="full">
                  <Text fontSize="xs" color="#131D5399" fontWeight="400">
                    Valor para Saque
                  </Text>
                  <Box position="relative" w="full">
                    <Text
                      position="absolute"
                      left="16px"
                      top="50%"
                      transform="translateY(-50%)"
                      fontSize="sm"
                      fontWeight={500}
                      color="#131D53"
                      zIndex={1}
                      pointerEvents="none"
                    >
                      R$
                    </Text>
                    <Input
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0,00"
                      fontSize="sm"
                      fontWeight={400}
                      color="#131D53"
                      h="48px"
                      pl="48px"
                      borderColor="#DEE6F2"
                      focusBorderColor="#1F70F1"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                      variant="outline"
                    />
                  </Box>
                </VStack>
              </VStack>
            </Box>

            {isFormValid && (
              <Box
                bg="white"
                p={4}
                borderRadius="12px"
                borderWidth={1}
                borderColor="#DEE6F2"
                shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
              >
                <VStack align="start" spacing={3}>
                  <HStack>
                    <Box
                      w="24px"
                      h="24px"
                      bg="#DFEFFF"
                      borderRadius="4px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <InfoIcon size={16} color="#1F70F1" />
                    </Box>
                    <Text fontSize="xs" color="#131D5399" fontWeight="400">
                      Resumo da Operação
                    </Text>
                  </HStack>

                  {isLoadingWithdrawalInfo ? (
                    <VStack spacing={2} w="full">
                      <Skeleton height="16px" width="full" />
                      <Skeleton height="16px" width="60%" />
                    </VStack>
                  ) : feeAmount > 0 ? (
                    <VStack align="start" spacing={2} w="full">
                      <HStack justify="space-between" w="full">
                        <Text fontSize="xs" color="#131D5399">
                          Valor solicitado:
                        </Text>
                        <Text fontSize="xs" fontWeight={500} color="#131D53">
                          {formatCurrency(withdrawalAmount)}
                        </Text>
                      </HStack>

                      <HStack justify="space-between" w="full">
                        <Text fontSize="xs" color="#131D5399">
                          Taxa de serviço:
                        </Text>
                        <Text fontSize="xs" fontWeight={500} color="#E53E3E">
                          -{formatCurrency(feeAmount)}
                        </Text>
                      </HStack>

                      <Box w="full" h="1px" bg="#DEE6F2" />

                      <HStack justify="space-between" w="full">
                        <Text fontSize="xs" fontWeight={600} color="#131D53">
                          Valor líquido a receber:
                        </Text>
                        <Text fontSize="xs" fontWeight={600} color="#38A169">
                          {formatCurrency(netAmount)}
                        </Text>
                      </HStack>
                    </VStack>
                  ) : (
                    <HStack justify="space-between" w="full">
                      <Text fontSize="xs" color="#131D5399">
                        Valor líquido a receber:
                      </Text>
                      <Text fontSize="xs" fontWeight={600} color="#38A169">
                        {formatCurrency(withdrawalAmount)}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </Box>
            )}

            {isLoadingProfile ? (
              <Box
                bg="white"
                p={4}
                borderRadius="12px"
                borderWidth={1}
                borderColor="#DEE6F2"
                shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
              >
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Skeleton w="24px" h="24px" borderRadius="4px" />
                    <Skeleton height="16px" width="120px" />
                  </HStack>
                  <VStack align="start" spacing={1} w="full">
                    <Skeleton height="14px" width="100px" />
                    <Skeleton height="12px" width="80px" />
                  </VStack>
                </VStack>
              </Box>
            ) : hasNoBankData ? (
              <Box
                bg="#FED7D7"
                p={3}
                borderRadius="12px"
                borderWidth={1}
                borderColor="#FEB2B2"
              >
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" fontWeight={600} color="#E53E3E">
                    Finalize seu cadastro para realizar o saque
                  </Text>
                  <Text fontSize="xs" color="#742A2A">
                    Cadastre seus dados bancários no perfil.
                  </Text>
                </VStack>
              </Box>
            ) : (
              <Box
                bg="white"
                p={4}
                borderRadius="12px"
                borderWidth={1}
                borderColor="#DEE6F2"
                shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
              >
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Box
                      w="24px"
                      h="24px"
                      bg="#DFEFFF"
                      borderRadius="4px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <CreditCard size={16} color="#1F70F1" />
                    </Box>
                    <Text fontSize="xs" color="#131D5399" fontWeight="400">
                      Conta para Recebimento
                    </Text>
                  </HStack>

                  <VStack align="start" spacing={1} w="full">
                    <Text fontSize="xs" fontWeight={600} color="#131D53">
                      {profileData?.bank?.bank_name}
                    </Text>
                    <Text fontSize="xs" color="#131D5399">
                      Ag:{' '}
                      <Text as="span" fontWeight={500} color="#131D53">
                        {profileData?.bank?.agency_number}
                      </Text>
                      {' • '}
                      Conta:{' '}
                      <Text as="span" fontWeight={500} color="#131D53">
                        {profileData?.bank?.account_number}
                      </Text>
                    </Text>
                    <Text as="span" fontSize="xs" color="#131D53">
                      {accountTypeMapper[
                        profileData?.bank
                          ?.account_type as keyof typeof accountTypeMapper
                      ] || profileData?.bank?.account_type}
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            )}

            <HStack spacing={2} pt={1}>
              <Button
                flex={1}
                size="sm"
                fontSize="xs"
                fontWeight={500}
                bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                color="#131D53"
                _hover={{
                  bgGradient:
                    'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                  shadow:
                    '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                }}
                transition="all 0.2s ease"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                flex={1}
                size="sm"
                fontSize="xs"
                fontWeight={500}
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
                isLoading={isSubmitting}
                isDisabled={!isFormValid}
                onClick={handleSubmit}
              >
                Confirmar Saque
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
