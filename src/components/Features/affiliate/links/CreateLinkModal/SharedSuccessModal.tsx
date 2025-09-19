import {
  Modal,
  ModalOverlay,
  ModalContent,
  Text,
  Button,
  Box,
  Image,
  Flex,
} from '@chakra-ui/react'
import { X } from 'lucide-react'
import { useRouter } from 'next/router'

interface SharedSuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SharedSuccessModal({
  isOpen,
  onClose,
}: SharedSuccessModalProps) {
  const router = useRouter()

  const handleRedirect = () => {
    onClose()
    router.push('/affiliate/hotlinks/')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xs" isCentered>
      <ModalOverlay />
      <ModalContent
        bg="white"
        p={3}
        borderRadius="lg"
        alignContent="center"
        gap={3}
      >
        <Flex pl={3} justify="space-between" align="center">
          <Text fontSize="sm" color="#131D53">
            Link compartilhado com sucesso!
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
        </Flex>

        <Box
          bg="#eff7ff"
          rounded={4}
          borderWidth={1}
          borderColor="#dfefff"
          p={2}
        >
          <Image
            src="/assets/success-image.png"
            alt="Ícone de sucesso"
            w="100%"
            h="285px"
          />
        </Box>

        <Text fontSize="xs" color="#131D5399" mb={3} lineHeight={4} px={2}>
          Agora você pode acompanhar de perto todas as métricas acessando Meus
          Links.
        </Text>

        <Button
          w="full"
          size="sm"
          fontSize="xs"
          fontWeight="medium"
          color="#131D53"
          borderRadius="lg"
          bg="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
          boxShadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
          onClick={handleRedirect}
        >
          Ver Links Criados
        </Button>
      </ModalContent>
    </Modal>
  )
}
