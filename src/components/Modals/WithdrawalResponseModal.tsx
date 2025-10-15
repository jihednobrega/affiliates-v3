import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Button,
  Icon,
} from '@chakra-ui/react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface WithdrawalResponseModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
  isSuccess?: boolean
  isError?: boolean
}

export const WithdrawalResponseModal: React.FC<
  WithdrawalResponseModalProps
> = ({ isOpen, onClose, message, isSuccess = false, isError = false }) => {
  const getIconAndColor = () => {
    if (isSuccess) {
      return { icon: CheckCircle, color: '#38A169', bgColor: '#C6F6D5' }
    }
    if (isError) {
      return { icon: XCircle, color: '#E53E3E', bgColor: '#FED7D7' }
    }
    return { icon: AlertCircle, color: '#F6AD55', bgColor: '#FEEBC8' }
  }

  const { icon: IconComponent, color, bgColor } = getIconAndColor()

  const getTitle = () => {
    if (isSuccess) {
      return 'Saque Solicitado!'
    }
    if (isError) {
      return 'Erro no Saque'
    }
    return 'Informação'
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent rounded={16} p={4}>
        <ModalCloseButton />
        <ModalBody p={6}>
          <VStack spacing={6} align="center">
            <VStack spacing={4}>
              <VStack
                w="80px"
                h="80px"
                bg={bgColor}
                borderRadius="50%"
                align="center"
                justify="center"
              >
                <Icon as={IconComponent} w={8} h={8} color={color} />
              </VStack>

              <Text
                fontSize="xl"
                fontWeight={600}
                color="#131D53"
                textAlign="center"
              >
                {getTitle()}
              </Text>
            </VStack>

            <Text
              fontSize="md"
              color="#131D5399"
              textAlign="center"
              lineHeight="1.5"
              maxW="300px"
            >
              {message}
            </Text>

            <Button
              w="full"
              size="md"
              fontSize="sm"
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
              onClick={onClose}
            >
              OK
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
