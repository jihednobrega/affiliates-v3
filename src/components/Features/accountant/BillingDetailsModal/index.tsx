import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Box,
  Divider,
} from '@chakra-ui/react'
import { AccountantListBrand } from '@/services/types/accountant-billing.types'
import { formatCurrency } from '@/utils/currency'

interface BillingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  billing: AccountantListBrand | null
  isCentered?: boolean
}

export function BillingDetailsModal({
  isOpen,
  onClose,
  billing,
  isCentered,
}: BillingDetailsModalProps) {
  if (!billing) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered={isCentered}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text fontSize="lg" fontWeight="600" color="#131D53">
            Detalhes da Fatura
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack align="start" spacing={4} w="full">
            <Box w="full">
              <Text fontSize="sm" color="#131D5399" mb={2}>
                Informações Gerais
              </Text>
              <VStack
                align="start"
                spacing={2}
                bg="#F3F6FA"
                p={4}
                borderRadius="8px"
                w="full"
              >
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="#131D5399">
                    Marca
                  </Text>
                  <Text fontSize="sm" color="#131D53" fontWeight="600">
                    {billing.brand_name}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="#131D5399">
                    Tipo
                  </Text>
                  <Text fontSize="sm" color="#131D53" fontWeight="600">
                    {billing.type === 'monthly_fee'
                      ? 'Mensalidade'
                      : billing.type === 'take_rate'
                      ? 'Take Rate'
                      : 'Comissionamento'}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="#131D5399">
                    Referência
                  </Text>
                  <Text fontSize="sm" color="#131D53" fontWeight="600">
                    {billing.reference}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="#131D5399">
                    Vencimento
                  </Text>
                  <Text fontSize="sm" color="#131D53" fontWeight="600">
                    {new Date(billing.due_date).toLocaleDateString('pt-BR')}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="#131D5399">
                    Criada em
                  </Text>
                  <Text fontSize="sm" color="#131D53" fontWeight="600">
                    {new Date(billing.created_at).toLocaleDateString('pt-BR')}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            <Divider />

            <Box w="full">
              <Text fontSize="sm" color="#131D5399" mb={2}>
                Valores
              </Text>
              <VStack
                align="start"
                spacing={2}
                bg="#F3F6FA"
                p={4}
                borderRadius="8px"
                w="full"
              >
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="#131D5399">
                    Valor Total
                  </Text>
                  <Text fontSize="md" color="#1F70F1" fontWeight="700">
                    {formatCurrency(billing.total_amount)}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="#131D5399">
                    Valor Pago
                  </Text>
                  <Text fontSize="md" color="#22C55E" fontWeight="700">
                    {formatCurrency(billing.total_payed)}
                  </Text>
                </HStack>
                {parseFloat(billing.total_amount) >
                  parseFloat(billing.total_payed) && (
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="#131D5399">
                      Saldo Pendente
                    </Text>
                    <Text fontSize="md" color="#EF4444" fontWeight="700">
                      {formatCurrency(
                        (
                          parseFloat(billing.total_amount) -
                          parseFloat(billing.total_payed)
                        ).toString()
                      )}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </Box>

            <Divider />

            <Box w="full">
              <Text fontSize="sm" color="#131D5399" mb={2}>
                Status
              </Text>
              <Box
                bg={
                  billing.status === 'payed'
                    ? '#DCFCE7'
                    : billing.status === 'overdue'
                    ? '#FEE2E2'
                    : '#DBEAFE'
                }
                p={3}
                borderRadius="8px"
                textAlign="center"
              >
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color={
                    billing.status === 'payed'
                      ? '#16A34A'
                      : billing.status === 'overdue'
                      ? '#DC2626'
                      : '#1F70F1'
                  }
                >
                  {billing.status === 'created' && 'Criada'}
                  {billing.status === 'pending' && 'Pendente'}
                  {billing.status === 'payed' && 'Paga'}
                  {billing.status === 'overdue' && 'Vencida'}
                  {billing.status === 'expired' && 'Expirada'}
                </Text>
              </Box>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
