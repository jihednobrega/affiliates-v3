import { useAuth } from '@/hooks/useAuth'
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
import { useState } from 'react'
import { Link as LinkIcon, Copy, Check } from 'lucide-react'

interface InviteModalLinkProps {
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
}

export function InviteModalLink({
  isOpen,
  onClose,
  onBack,
}: InviteModalLinkProps) {
  const [isCopying, setIsCopying] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)

  const toast = useToast()
  const { user } = useAuth()

  const getInviteLink = () => {
    if (!user?.code) return ''

    const isQA =
      window.location.host.includes('dash-qa') ||
      window.location.host.includes('localhost') ||
      window.location.host.startsWith('127.0.0.1')

    return isQA
      ? `${window.location.origin}/register?code=${user.code}`
      : `https://painel.affiliates.app.br/register?code=${user.code}`
  }

  const handleCopy = async () => {
    const inviteLink = getInviteLink()
    if (!inviteLink) return

    setIsCopying(true)
    try {
      await navigator.clipboard.writeText(inviteLink)
      setHasCopied(true)
      toast({
        title: 'Link copiado!',
        description:
          'O link do convite foi copiado para sua área de transferência.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      setTimeout(() => setHasCopied(false), 2000)
    } catch {
      toast({
        title: 'Erro ao copiar link.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsCopying(false)
    }
  }

  const inviteLink = getInviteLink()

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
              Convidar por link
            </Text>
            <Text
              fontSize={{ base: 'xs', md: 'sm' }}
              fontWeight={400}
              color="#131D5399"
            >
              Compartilhe o link abaixo para convidar um novo afiliado!
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
                  <Icon as={LinkIcon} w={4} h={4} color="#1F70F1" />
                </Box>
                <Text>Link de convite</Text>
              </Flex>
            </FormLabel>
            <Flex gap={2} direction={{ base: 'column', md: 'row' }}>
              <Input
                value={inviteLink}
                isReadOnly
                fontSize={{ base: 'xs', md: 'sm' }}
                focusBorderColor="#1F70F1"
                borderColor="#DEE6F2"
                bg="#F7FAFC"
                _hover={{ borderColor: '#C5CDDC' }}
              />
              <Button
                colorScheme={hasCopied ? 'green' : 'blue'}
                onClick={handleCopy}
                isLoading={isCopying}
                isDisabled={!inviteLink || isCopying}
                leftIcon={hasCopied ? <Check size={16} /> : <Copy size={16} />}
                flexShrink={0}
                size={{ base: 'sm', md: 'md' }}
                fontSize={{ base: 'xs', md: 'sm' }}
                w={{ base: 'full', md: 'auto' }}
                bg={
                  hasCopied
                    ? 'green.500'
                    : 'linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)'
                }
                bgGradient={
                  hasCopied
                    ? undefined
                    : 'linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)'
                }
                color="white"
                shadow={
                  hasCopied
                    ? undefined
                    : '0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset'
                }
                _hover={
                  hasCopied
                    ? { bg: 'green.600' }
                    : {
                        bgGradient:
                          'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                        shadow:
                          '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                      }
                }
                transition="all 0.2s ease"
              >
                {hasCopied ? 'Copiado' : 'Copiar'}
              </Button>
            </Flex>
            {!inviteLink && (
              <Text fontSize={{ base: 'xs', md: 'sm' }} color="#E53E3E" mt={2}>
                Seu código de afiliado não foi encontrado. Tente novamente mais
                tarde!
              </Text>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter px={0} pt={2}>
          {onBack && (
            <Flex w="full">
              <Button
                w="full"
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
            </Flex>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
