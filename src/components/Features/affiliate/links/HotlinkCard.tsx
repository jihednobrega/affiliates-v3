'use client'

import { SharedSuccessModal } from './CreateLinkModal/SharedSuccessModal'
import { ShareModal } from './CreateLinkModal/ShareModal'
import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  IconButton,
  Link,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import { ProductImage } from '@/components/UI'
import { Copy, Share2, Check, Trash2 } from 'lucide-react'
import { useState, useRef } from 'react'
import { useDeleteLink } from '@/hooks/useLinks'

interface HotlinkCardProps {
  id: string
  title: string
  price: string
  commission: string
  url: string
  externalUrl: string
  earnings: string
  clicks: string
  orders: string
  conversion: string
  imageUrl: string
}

export function HotlinkCard({
  id,
  title,
  price,
  commission,
  url,
  externalUrl,
  earnings,
  clicks,
  orders,
  conversion,
  imageUrl,
}: HotlinkCardProps) {
  const [copied, setCopied] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const {
    isOpen: isDeleteAlertOpen,
    onOpen: onDeleteAlertOpen,
    onClose: onDeleteAlertClose,
  } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const toast = useToast()
  const deleteLink = useDeleteLink()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch (err) {
      console.error('Erro ao copiar o link:', err)
    }
  }

  function handleShareSuccess() {
    setIsShareOpen(false)
    setTimeout(() => {
      setIsSuccessModalOpen(true)
    }, 500)
  }

  const handleDeleteLink = async () => {
    try {
      await deleteLink.mutateAsync(Number(id))

      onDeleteAlertClose()

      toast({
        title: 'Link deletado',
        description: 'O link foi removido com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error: any) {
      onDeleteAlertClose()

      toast({
        title: 'Erro ao deletar link',
        description: error.message || 'Não foi possível deletar o link.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Box
      borderRadius="md"
      bg="white"
      borderWidth={1}
      borderColor="#DEE6F2"
      height="fit-content"
      display="flex"
      flexDirection="column"
      minW={{ base: '220px', md: '320px' }}
      maxW="500px"
      mx={{ base: 'auto', md: 'unset' }}
    >
      <Box p={3} borderBottomWidth={1} borderBottomColor="#E6E6E6">
        <Flex justify="space-between" mb={2} gap={2}>
          <Flex align="center" gap={2}>
            <Box
              w={{ base: '32px', md: '40px' }}
              h={{ base: '32px', md: '40px' }}
              border="1px solid #E6E6E6"
              rounded={4}
              overflow="hidden"
              bg="white"
              className="flex items-center justify-center"
              flexShrink={0}
            >
              <ProductImage
                src={imageUrl}
                alt={title}
                width="100%"
                height="100%"
                objectFit="contain"
              />
            </Box>
            <Box height="42px" display="flex" alignItems="center">
              <Text
                fontSize="sm"
                color="#131D53"
                lineHeight="21px"
                noOfLines={2}
                wordBreak="break-all"
                overflow="hidden"
                textOverflow="ellipsis"
                sx={{
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  display: '-webkit-box',
                }}
              >
                {title}
              </Text>
            </Box>
          </Flex>
        </Flex>

        <HStack>
          <Text fontSize="sm" color="#131D53">
            {price}
          </Text>
          <Badge
            colorScheme="green"
            bg="#9FFF854D"
            color="#104C00"
            fontSize="xs"
            fontWeight="regular"
            px={2}
            py={1.5}
            borderRadius="md"
            display="flex"
            gap={1}
            lineHeight="14.4px"
            textTransform="none"
          >
            Comissão Aprox. <Text fontWeight={600}>{commission}</Text>
          </Badge>
        </HStack>
      </Box>

      <Box p={3}>
        <VStack align="start" spacing={0.5} mb={4}>
          <Link
            href={url}
            color="#1F70F1"
            fontWeight="semibold"
            fontSize="sm"
            isExternal
            noOfLines={1}
            wordBreak="break-all"
            lineHeight="1.3"
          >
            {url}
          </Link>
          <Text
            fontSize="sm"
            color="#131D5399"
            noOfLines={1}
            wordBreak="break-all"
            lineHeight="1.3"
          >
            {externalUrl}
          </Text>
        </VStack>

        <Box mb={6}>
          <Box
            display={{ base: 'none', md: 'grid' }}
            gridTemplateColumns="repeat(2, 1fr)"
            gap={2}
            fontSize="xs"
            color="#131D53"
          >
            <HStack gap={2}>
              <div className="bg-[#dfefff] w-7 h-7 flex items-center justify-center rounded-sm p-0.5">
                <img src="/assets/icons/commissions.svg" />
              </div>
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="10px" color="#131D5399">
                  Ganhos
                </Text>
                <Text fontSize="xs" fontWeight={500}>
                  R$ {earnings}
                </Text>
              </VStack>
            </HStack>
            <HStack gap={2}>
              <div className="bg-[#dfefff] w-7 h-7 flex items-center justify-center rounded-sm p-0.5">
                <img src="/assets/icons/cursor-click.svg" />
              </div>
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="10px" color="#131D5399">
                  Cliques
                </Text>
                <Text fontSize="xs" fontWeight={500}>
                  {clicks}
                </Text>
              </VStack>
            </HStack>
            <HStack gap={2}>
              <div className="bg-[#dfefff] w-7 h-7 flex items-center justify-center rounded-sm p-0.5">
                <img src="/assets/icons/handbag-success.svg" />
              </div>
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="10px" color="#131D5399">
                  Pedidos
                </Text>
                <Text fontSize="xs" fontWeight={500}>
                  {orders}
                </Text>
              </VStack>
            </HStack>
            <HStack gap={2}>
              <div className="bg-[#dfefff] w-7 h-7 flex items-center justify-center rounded-sm p-0.5">
                <img src="/assets/icons/percent-circle.svg" />
              </div>
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="10px" color="#131D5399">
                  Conversão
                </Text>
                <Text fontSize="xs" fontWeight={500}>
                  {conversion}
                </Text>
              </VStack>
            </HStack>
          </Box>

          <Box
            display={{ base: 'grid', md: 'none' }}
            gridTemplateColumns="repeat(2, 1fr)"
            gap={2}
            fontSize="xs"
            color="#131D53"
          >
            <HStack gap={2}>
              <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                <img src="/assets/icons/commissions.svg" />
              </div>
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="10px" color="#131D5399">
                  Ganhos
                </Text>
                <Text fontSize="xs" fontWeight={500}>
                  R$ {earnings}
                </Text>
              </VStack>
            </HStack>
            <HStack gap={2}>
              <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                <img src="/assets/icons/cursor-click.svg" />
              </div>
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="10px" color="#131D5399">
                  Cliques
                </Text>
                <Text fontSize="xs" fontWeight={500}>
                  {clicks}
                </Text>
              </VStack>
            </HStack>
            <HStack gap={2}>
              <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                <img src="/assets/icons/handbag-success.svg" />
              </div>
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="10px" color="#131D5399">
                  Pedidos
                </Text>
                <Text fontSize="xs" fontWeight={500}>
                  {orders}
                </Text>
              </VStack>
            </HStack>
            <HStack gap={2}>
              <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                <img src="/assets/icons/percent-circle.svg" />
              </div>
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="10px" color="#131D5399">
                  Conversão
                </Text>
                <Text fontSize="xs" fontWeight={500}>
                  {conversion}
                </Text>
              </VStack>
            </HStack>
          </Box>
        </Box>
      </Box>

      <Box borderTopWidth={1} borderTopColor="#E6E6E6" p={3} mt="auto">
        <HStack
          display={{ base: 'none', md: 'flex' }}
          justify="flex-end"
          gap={2}
        >
          <Button
            px={3}
            py={1.5}
            leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
            size="sm"
            fontSize="xs"
            borderRadius="md"
            color="#131D53"
            bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
            shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
            onClick={handleCopy}
          >
            {copied ? 'Link Copiado!' : 'Copiar Link'}
          </Button>

          <Button
            px={3}
            py={1.5}
            leftIcon={<Share2 size={16} />}
            size="sm"
            fontSize="xs"
            borderRadius="md"
            color="#131D53"
            bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
            shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
            onClick={() => setIsShareOpen(true)}
          >
            Compartilhar Link
          </Button>

          <IconButton
            px={3}
            py={1.5}
            icon={<Trash2 size={16} />}
            aria-label="Deletar Link"
            size="sm"
            borderRadius="md"
            minW="40px"
            color="#E53E3E"
            bgGradient="linear-gradient(180deg, #fef5f5 47.86%, #fed7d7 123.81%)"
            shadow="0px 0px 0px 1px #f56565 inset, 0px 0px 0px 2px #fff inset"
            _hover={{
              bgGradient:
                'linear-gradient(180deg, #fed7d7 47.86%, #feb2b2 123.81%)',
              shadow:
                '0px 0px 0px 1px #e53e3e inset, 0px 0px 0px 2px #fff inset',
            }}
            _active={{
              bgGradient:
                'linear-gradient(180deg, #feb2b2 47.86%, #fc8181 123.81%)',
            }}
            onClick={onDeleteAlertOpen}
          />
        </HStack>

        <HStack justify="flex-end" display={{ base: 'flex', md: 'none' }}>
          <Button
            px={3}
            py={1.5}
            leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
            size="sm"
            fontSize="xs"
            borderRadius="md"
            color="#131D53"
            bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
            shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
            onClick={handleCopy}
          >
            {copied ? 'Link Copiado!' : 'Copiar Link'}
          </Button>

          <Button
            px={3}
            py={1.5}
            leftIcon={<Share2 size={16} />}
            size="sm"
            fontSize="xs"
            borderRadius="md"
            color="#131D53"
            bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
            shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
            onClick={() => setIsShareOpen(true)}
          >
            Compartilhar Link
          </Button>

          <IconButton
            px={3}
            py={1.5}
            icon={<Trash2 size={16} />}
            aria-label="Deletar Link"
            size="sm"
            borderRadius="md"
            minW="40px"
            color="#E53E3E"
            bgGradient="linear-gradient(180deg, #fef5f5 47.86%, #fed7d7 123.81%)"
            shadow="0px 0px 0px 1px #f56565 inset, 0px 0px 0px 2px #fff inset"
            _hover={{
              bgGradient:
                'linear-gradient(180deg, #fed7d7 47.86%, #feb2b2 123.81%)',
              shadow:
                '0px 0px 0px 1px #e53e3e inset, 0px 0px 0px 2px #fff inset',
            }}
            _active={{
              bgGradient:
                'linear-gradient(180deg, #feb2b2 47.86%, #fc8181 123.81%)',
            }}
            onClick={onDeleteAlertOpen}
          />
        </HStack>
      </Box>

      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAlertClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Deletar Link
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja deletar este link? Esta ação não pode ser
              desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteAlertClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteLink}
                ml={3}
                isLoading={deleteLink.isPending}
                isDisabled={deleteLink.isPending}
              >
                Deletar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onShareSuccess={handleShareSuccess}
      />
      <SharedSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </Box>
  )
}
