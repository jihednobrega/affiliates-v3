import { InvitesService } from '@/services/invites'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Input,
  FormLabel,
  Flex,
  Text,
  useToast,
  VStack,
  Icon,
  Box,
} from '@chakra-ui/react'
import { useState, useMemo } from 'react'
import { Mail } from 'lucide-react'

interface InviteModalEmailProps {
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
}

export function InviteModalEmail({
  isOpen,
  onClose,
  onBack,
}: InviteModalEmailProps) {
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const toast = useToast()
  const invitesService = useMemo(() => new InvitesService(), [])

  const handleInvite = async () => {
    if (!email.trim()) return

    const emailList = email
      .split(/[\s,]+/)
      .map((e) => e.trim())
      .filter((e) => e.includes('@') && e.includes('.'))

    if (emailList.length === 0) {
      toast({
        title: 'Nenhum e-mail válido encontrado.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSending(true)

    try {
      const formattedEmails = emailList.join(',')
      const { response, status } = await invitesService.sendInvites(
        formattedEmails
      )

      if (status === 200) {
        toast({
          title: 'Convite enviado!',
          description: `Convite enviado com sucesso para: ${emailList.join(
            ', '
          )}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

        setEmail('')
        onClose()
      } else {
        toast({
          title: 'Erro inesperado',
          description: `Status: ${status}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || 'Tente novamente mais tarde.'
      const errorDetails = error?.response?.data?.errors

      toast({
        title: 'Erro ao enviar convite',
        description: errorMessage,
        status: 'error',
        duration: 6000,
        isClosable: true,
      })

      if (errorDetails && typeof errorDetails === 'object') {
        Object.entries(errorDetails).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => {
              toast({
                title: `Erro: ${field}`,
                description: msg,
                status: 'error',
                duration: 6000,
                isClosable: true,
              })
            })
          }
        })
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={{ base: 'sm', md: 'lg' }}
    >
      <ModalOverlay />
      <ModalContent
        rounded={16}
        p={{ base: 3, md: 4 }}
        mx={{ base: 4, md: 0 }}
        my={{ base: 4, md: 0 }}
      >
        <ModalCloseButton />
        <ModalHeader pb={2} px={{ base: 0, md: 0 }}>
          <VStack spacing={1} align="start">
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight={600}
              color="#131D53"
            >
              Convidar por e-mail
            </Text>
            <Text
              fontSize={{ base: 'xs', md: 'sm' }}
              fontWeight={400}
              color="#131D5399"
            >
              Novos membros receberão seu convite por e-mail com instruções para
              cadastro!
            </Text>
          </VStack>
        </ModalHeader>
        <ModalBody px={0} py={{ base: 3, md: 4 }}>
          <VStack spacing={3} align="stretch">
            <FormLabel
              fontSize={{ base: 'xs', md: 'sm' }}
              fontWeight={400}
              color="#131D5399"
              mb={0}
            >
              <Flex align="center" gap={2}>
                <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm">
                  <Icon as={Mail} w={4} h={4} color="#1F70F1" />
                </Box>
                <Text>E-mail (separado por vírgula)</Text>
              </Flex>
            </FormLabel>
            <Input
              placeholder="exemplo@email.com, outro@email.com"
              value={email}
              fontSize={{ base: 'xs', md: 'sm' }}
              onChange={(e) => setEmail(e.target.value)}
              focusBorderColor="#1F70F1"
              borderColor="#DEE6F2"
              bg="white"
              _hover={{ borderColor: '#C5CDDC' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSending && email.trim()) {
                  handleInvite()
                }
              }}
            />
          </VStack>
        </ModalBody>

        <ModalFooter px={0} pt={2}>
          <Flex w="full" gap={2} direction={{ base: 'column', md: 'row' }}>
            {onBack && (
              <Button
                flex={{ base: 'none', md: 1 }}
                w={{ base: 'full', md: 'auto' }}
                size={{ base: 'sm', md: 'md' }}
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
                onClick={() => {
                  onClose()
                  onBack()
                }}
              >
                Cancelar
              </Button>
            )}
            <Button
              flex={{ base: 'none', md: 1 }}
              w={{ base: 'full', md: 'auto' }}
              size={{ base: 'sm', md: 'md' }}
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
              onClick={handleInvite}
              isLoading={isSending}
              isDisabled={!email.trim() || isSending}
            >
              Enviar convite
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
