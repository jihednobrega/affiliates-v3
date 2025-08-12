import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Progress,
  Button,
  Box,
  Grid,
  GridItem,
  Divider,
  useDisclosure,
} from '@chakra-ui/react'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/utils/currency'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, isLoggedIn } = useAuth()
  const [cardPosition, setCardPosition] = useState('64px')
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setCardPosition('140px')
      }, 50)
      return () => clearTimeout(timer)
    } else {
      setCardPosition('64px')
    }
  }, [isOpen])
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" isCentered>
      <ModalOverlay />
      <ModalContent rounded={20} maxW="369px">
        <ModalHeader borderBottomWidth={1} borderBottomColor="#DEE6F2" p={3}>
          <HStack
            pl={3}
            align="center"
            justify="space-between"
            overflow="hidden"
          >
            <Text fontSize="sm" color="#131D53">
              Sua Carteira
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
          <Box
            rounded={12}
            display={'flex'}
            flexDirection={'column'}
            overflow="hidden"
            position="relative"
            h="278px"
          >
            <img
              className="absolute bottom-0 z-10"
              src="/assets/Subtract.png"
              alt=""
            />
            <Box
              position="absolute"
              bottom={cardPosition}
              left={0}
              right={0}
              zIndex={9}
              transition="bottom 1.2s cubic-bezier(0.645, 0.045, 0.355, 1.000) 0.3s"
            >
              <Box
                position="relative"
                h="138px"
                bg="#284AFF"
                color="white"
                rounded={12}
                p={4}
              >
                <Box position="absolute" left={4} top={4} zIndex={11}>
                  <Text fontSize="sm" lineHeight="16px">
                    {isLoggedIn && user.name ? user.name : 'User'}
                  </Text>
                  <Text
                    fontSize="base"
                    fontWeight={600}
                    lineHeight="16px"
                    mt={1}
                  >
                    Lvl 09 - Super Vendedor
                  </Text>
                </Box>
                <Box
                  position="absolute"
                  left={0}
                  right={0}
                  top={0}
                  bottom={0}
                  zIndex={10}
                  rounded={12}
                  shadow="0 0 39.2px 0 #9AC0FF inset"
                />
                <img
                  className="absolute left-0 bottom-5 z-0"
                  src="/assets/affiliates-card-detail.png"
                  alt=""
                />
              </Box>
            </Box>
            <Box color="white" mt="auto" p={5} zIndex={10}>
              <Text fontSize="xs" fontWeight={500}>
                Minha Carteira
              </Text>
              <Text
                fontSize="32px"
                fontWeight={600}
                lineHeight="23px"
                letterSpacing="-1.44px"
                mt={3}
              >
                {formatCurrency(user.balance)}
              </Text>
            </Box>
          </Box>
        </ModalBody>

        <ModalFooter p={3} borderTopWidth={1} borderTopColor="#DEE6F2">
          <Button
            w="full"
            size="md"
            fontSize="sm"
            borderRadius="md"
            color="#131D53"
            fontWeight={600}
            bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
            shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
          >
            Solicitar Saque
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
