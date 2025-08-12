'use client'

import {
  Box,
  Text,
  Input,
  Image,
  Button,
  HStack,
  VStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useToast,
  Flex,
} from '@chakra-ui/react'
import { useState, useRef } from 'react'
import { ImageUpload, MenuIcon } from '../CustomIcons'
import { Info } from 'lucide-react'

export default function ImageUploadBox() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImageSrc(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const confirmRemoveImage = () => {
    setImageSrc(null)
    onClose()
    toast({
      title: 'Imagem removida.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  return (
    <Box bg="white">
      <HStack mb={3} pl={2}>
        <Flex p={0.5} alignContent={'center'} justifyContent={'center'}>
          <MenuIcon color="#131D5399" />
        </Flex>

        <Text
          fontSize="sm"
          fontWeight="semibold"
          lineHeight="120%"
          color="#131d53"
        >
          Foto de Apoio
        </Text>
      </HStack>

      <Box
        p={2}
        borderWidth={1}
        borderColor="#DFEFFF"
        rounded={4}
        position="relative"
        bgColor="#EFF7FF"
      >
        {imageSrc ? (
          <HStack justify="space-between" align="center">
            <HStack>
              <Image
                src={imageSrc}
                alt="Imagem enviada"
                boxSize="32px"
                objectFit="cover"
                borderRadius="md"
              />
              <label style={{ cursor: 'pointer', color: '#3182ce' }}>
                <Text fontSize="sm" color="#131D5399">
                  Clique aqui{' '}
                  <Text as="span" color="#1F70F1">
                    Alterar a Imagem
                  </Text>
                </Text>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  display="none"
                />
              </label>
            </HStack>
            <Button
              size="sm"
              variant="ghost"
              fontWeight={400}
              color="#FE5B80"
              onClick={onOpen}
              px={0}
            >
              Remover
            </Button>
          </HStack>
        ) : (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              minHeight: '32px',
            }}
          >
            <ImageUpload color="#717798" boxSize={5} />
            <Text fontSize="sm" color="#131D5399">
              Clique para fazer o{' '}
              <Text as="span" color="#1F70F1">
                upload da imagem
              </Text>
            </Text>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              display="none"
            />
          </label>
        )}
      </Box>

      <Box
        p={2}
        borderWidth={1}
        borderColor="#DBE1EA"
        rounded={4}
        bgColor="#F4F6F9"
        mt={4}
      >
        <Box display="flex" gap={1} mt={1}>
          <Info color="#131D5399" size={16} />
          <Text lineHeight={4} fontSize="sm" color="#131D5399" flex={1}>
            As fotos de apoio só serão compartilhadas na seleção da ação de
            compartilhar link na próxima etapa
          </Text>
        </Box>
      </Box>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent mx={6}>
            <AlertDialogHeader fontSize="md" fontWeight="medium">
              Tem certeza que deseja remover a imagem?
            </AlertDialogHeader>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={confirmRemoveImage} ml={3}>
                Remover
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}
