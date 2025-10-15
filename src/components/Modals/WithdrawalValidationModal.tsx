import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Button,
  HStack,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'

interface WithdrawalValidationModalProps {
  isOpen: boolean
  onClose: () => void
  reason: string
  message: string
  extraMessage?: string
  userType?: 'PF' | 'PJ'
  onCreateAccount?: (type: 'PF' | 'PJ') => void
}

export const WithdrawalValidationModal: React.FC<
  WithdrawalValidationModalProps
> = ({
  isOpen,
  onClose,
  reason,
  message,
  extraMessage,
  userType,
  onCreateAccount,
}) => {
  const router = useRouter()

  const getButtonText = () => {
    switch (reason) {
      case 'incomplete_profile':
        return 'Editar Perfil'
      case 'no_iugu_account':
        return 'Criar Conta Digital'
      case 'account_not_verified':
        return 'Verificar Conta'
      case 'account_rejected':
        return 'Reenviar Documentos'
      default:
        return 'Fechar'
    }
  }

  const handleAction = () => {
    console.log('🎯 Ação do modal de validação executada:', {
      reason,
      userType,
    })

    if (reason === 'incomplete_profile') {
      console.log('📝 Redirecionando para perfil')
      onClose()
      router.push('/affiliate/profile')
    } else if (
      reason === 'no_iugu_account' ||
      reason === 'account_not_verified' ||
      reason === 'account_rejected'
    ) {
      console.log('🏦 Tentando criar conta digital')
      if (onCreateAccount && userType) {
        console.log('✅ Chamando onCreateAccount com tipo:', userType)
        onCreateAccount(userType)
      } else {
        console.log('❌ onCreateAccount ou userType não disponível:', {
          onCreateAccount: !!onCreateAccount,
          userType,
        })
      }
    } else {
      console.log('❓ Razão não identificada, fechando modal')
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'sm', md: 'md' }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        rounded={16}
        p={{ base: 3, md: 4 }}
        mx={{ base: 4, md: 0 }}
        my={{ base: 4, md: 0 }}
      >
        <ModalCloseButton />
        <ModalBody px={{ base: 4, md: 4 }} py={{ base: 4, md: 6 }}>
          <VStack spacing={{ base: 4, md: 6 }} align="center">
            <Text
              fontSize={{ base: 'base', md: 'lg' }}
              fontWeight={500}
              color="#131D53"
              textAlign="center"
              lineHeight="short"
            >
              {message}
            </Text>

            {reason === 'account_rejected' && extraMessage && (
              <Text
                fontSize={{ base: 'sm', md: 'md' }}
                color="#E53E3E"
                fontWeight={500}
                textAlign="center"
                bg="#FED7D7"
                px={{ base: 3, md: 4 }}
                py={2}
                rounded={8}
              >
                {extraMessage}
              </Text>
            )}

            <HStack spacing={{ base: 2, md: 3 }} w="full">
              {reason !== 'incomplete_profile' && (
                <Button
                  w="full"
                  h="40px"
                  fontSize={{ base: 'xs', md: 'sm' }}
                  fontWeight={500}
                  variant="outline"
                  color="#131D53"
                  borderColor="#DEE6F2"
                  bgColor="white"
                  _hover={{
                    bgColor: '#F7FAFC',
                    borderColor: '#C5CDDC',
                  }}
                  onClick={onClose}
                >
                  Cancelar
                </Button>
              )}

              <Button
                w="full"
                h="40px"
                fontSize={{ base: 'xs', md: 'sm' }}
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
                onClick={handleAction}
              >
                {getButtonText()}
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
