import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Textarea,
} from '@chakra-ui/react'
import { useState } from 'react'
import { WithdrawRequest } from '@/services/types/accountant-withdraw.types'
import { formatCurrency } from '@/utils/formatters'

interface WithdrawActionModalProps {
  isOpen: boolean
  onClose: () => void
  withdraw: WithdrawRequest | null
  action: 'approve' | 'refuse'
  onConfirm: (id: number, reason?: string) => Promise<void>
  isLoading?: boolean
}

export function WithdrawActionModal({
  isOpen,
  onClose,
  withdraw,
  action,
  onConfirm,
  isLoading,
}: WithdrawActionModalProps) {
  const [reason, setReason] = useState('')

  if (!withdraw) return null

  const isApprove = action === 'approve'

  const handleConfirm = async () => {
    await onConfirm(withdraw.id, reason)
    setReason('')
    onClose()
  }

  const handleClose = () => {
    setReason('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text fontSize="lg" fontWeight="600" color="#131D53">
            {isApprove ? 'Aprovar Saque' : 'Recusar Saque'}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="start" spacing={4} w="full">
            <Box w="full" bg="#F3F6FA" p={4} borderRadius="8px">
              <VStack align="start" spacing={2}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="#131D5399">
                    Afiliado
                  </Text>
                  <Text fontSize="sm" color="#131D53" fontWeight="600">
                    {withdraw.user_name}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="#131D5399">
                    Documento
                  </Text>
                  <Text fontSize="sm" color="#131D53" fontWeight="600">
                    {withdraw.user_document}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="#131D5399">
                    Marca
                  </Text>
                  <Text fontSize="sm" color="#131D53" fontWeight="600">
                    {withdraw.brand_name}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            <Box
              w="full"
              bg={isApprove ? '#DCFCE7' : '#FEE2E2'}
              p={4}
              borderRadius="8px"
            >
              <VStack align="start" spacing={2}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="#131D5399">
                    Saldo Atual
                  </Text>
                  <Text fontSize="sm" color="#131D53" fontWeight="600">
                    {formatCurrency(withdraw.user_current_balance)}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="#131D5399">
                    Valor Solicitado
                  </Text>
                  <Text fontSize="md" color="#1F70F1" fontWeight="700">
                    {formatCurrency(withdraw.amount)}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="#131D5399">
                    Taxa ({withdraw.tax_percent}%)
                  </Text>
                  <Text fontSize="sm" color="#EF4444" fontWeight="600">
                    - {formatCurrency(withdraw.tax_amount)}
                  </Text>
                </HStack>
                <Box w="full" h="1px" bg="#131D5333" my={1} />
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="#131D5399" fontWeight="600">
                    Recebimento Líquido
                  </Text>
                  <Text fontSize="md" color="#22C55E" fontWeight="700">
                    {formatCurrency(withdraw.final_amount)}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            <Box
              w="full"
              p={4}
              borderRadius="8px"
              bg={isApprove ? '#DBEAFE' : '#FEF3C7'}
            >
              <Text fontSize="sm" color="#131D53" textAlign="center">
                {isApprove
                  ? 'Tem certeza que deseja aprovar este saque? O valor será transferido para a conta do afiliado.'
                  : 'Tem certeza que deseja recusar este saque? O valor voltará ao saldo disponível do afiliado.'}
              </Text>
            </Box>

            {!isApprove && (
              <Box w="full">
                <Text fontSize="sm" color="#131D5399" mb={2}>
                  Motivo da Recusa (opcional)
                </Text>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Descreva o motivo da recusa..."
                  size="sm"
                  rows={3}
                />
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={handleClose}
              isDisabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              colorScheme={isApprove ? 'green' : 'red'}
              onClick={handleConfirm}
              isLoading={isLoading}
            >
              {isApprove ? 'Aprovar Saque' : 'Recusar Saque'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
