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
  Text,
  Flex,
  VStack,
  Image,
  Link,
  Icon,
  Box,
  useToast,
} from '@chakra-ui/react'
import { Hash, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface AffiliateCodeModalProps {
  isOpen: boolean
  onClose: () => void
  landingPageUrl?: string
}

export function AffiliateCodeModal({
  isOpen,
  onClose,
  landingPageUrl = '#',
}: AffiliateCodeModalProps) {
  const { user } = useAuth()
  const toast = useToast()
  const [hasCopied, setHasCopied] = useState(false)

  const handleCopy = async () => {
    const code = user?.code || ''
    if (!code) return

    try {
      await navigator.clipboard.writeText(code)
      setHasCopied(true)
      toast({
        title: 'Código copiado!',
        description: 'O código foi copiado para sua área de transferência.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      setTimeout(() => setHasCopied(false), 2000)
    } catch {
      toast({
        title: 'Erro ao copiar código.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={{ base: 'sm', md: 'md' }}
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
              Código de Afiliado
            </Text>
            <Text
              fontSize={{ base: 'xs', md: 'sm' }}
              fontWeight={400}
              color="#131D5399"
            >
              Compartilhe este código com novos afiliados!
            </Text>
          </VStack>
        </ModalHeader>
        <VStack py={{ base: 2, md: 3 }} spacing={2} align="center">
          <Image
            w={{ base: 70, md: 94 }}
            src="/saqueMessageSuccess.png"
            alt="successful sales"
          />
        </VStack>
        <ModalBody px={0} py={{ base: 3, md: 4 }}>
          <Flex
            direction="column"
            align="center"
            justify="center"
            textAlign="center"
          >
            <Text fontSize={{ base: 'xs', md: 'sm' }} mb={3} color="#131D5399">
              {`Este é o seu código de afiliado que deverá ser colocado no campo "Indicação" no momento da realização do `}
              <Link
                href={landingPageUrl}
                color="#1F70F1"
                textDecoration="underline"
                isExternal
              >
                cadastro
              </Link>
              .
            </Text>

            <Image
              src="/indicacao_img_cropped.PNG"
              alt="Indicação"
              maxW="100%"
              borderRadius="md"
              my={2}
              mb={4}
              display={{ base: 'none', md: 'block' }}
            />

            <Box
              bg="#F7FAFC"
              px={{ base: 4, md: 6 }}
              py={{ base: 2, md: 3 }}
              borderRadius="md"
              border="1px solid"
              borderColor="#DEE6F2"
              w="full"
            >
              <Flex align="center" justify="center" gap={2}>
                <Icon
                  as={Hash}
                  w={{ base: 4, md: 5 }}
                  h={{ base: 4, md: 5 }}
                  color="#1F70F1"
                />
                <Text
                  fontWeight={700}
                  fontSize={{ base: 'lg', md: 'xl' }}
                  color="#131D53"
                  letterSpacing="wider"
                >
                  {user?.code || 'N/A'}
                </Text>
              </Flex>
            </Box>
          </Flex>
        </ModalBody>
        <ModalFooter px={0} pt={2}>
          <Flex w="full" gap={2} direction={{ base: 'column', md: 'row' }}>
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
              onClick={onClose}
            >
              Fechar
            </Button>
            <Button
              flex={{ base: 'none', md: 1 }}
              w={{ base: 'full', md: 'auto' }}
              size={{ base: 'sm', md: 'md' }}
              fontSize={{ base: 'xs', md: 'sm' }}
              fontWeight={500}
              color="white"
              bgGradient={
                hasCopied
                  ? undefined
                  : 'linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)'
              }
              bg={hasCopied ? 'green.500' : undefined}
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
              onClick={handleCopy}
              leftIcon={hasCopied ? <Check size={16} /> : <Copy size={16} />}
            >
              {hasCopied ? 'Código Copiado!' : 'Copiar Código'}
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
