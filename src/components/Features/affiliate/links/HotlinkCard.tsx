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
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react'
import { ProductImage } from '@/components/UI'
import {
  Copy,
  Share2,
  MoreHorizontal,
  Check,
  ChartNoAxesColumnIncreasing,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

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
      onClose()
      setTimeout(() => {
        setIsSuccessModalOpen(true)
      }, 200)
    }, 500)
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
      minWidth={{ base: 'auto', md: '530px' }}
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
            <Text
              fontSize="sm"
              color="#131D53"
              height="42px"
              lineHeight="21px"
              noOfLines={2}
              display="flex"
              alignItems="center"
            >
              {title}
            </Text>
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
            noOfLines={2}
            wordBreak="break-all"
            lineHeight="1.3"
          >
            {url}
          </Link>
          <Text
            fontSize="sm"
            color="#131D5399"
            noOfLines={2}
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

          <Flex
            direction="column"
            gap={2}
            fontSize="xs"
            color="#131D53"
            display={{ base: 'flex', md: 'none' }}
          >
            <HStack gap={2.5}>
              <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                <img src="/assets/icons/commissions.svg" />
              </div>
              <Text fontSize="xs" color="#131D5399">
                Ganhos{' '}
                <strong className="text-[#131D53] font-[400]">
                  R$ {earnings}
                </strong>
              </Text>
            </HStack>
            <HStack gap={2.5}>
              <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                <img src="/assets/icons/cursor-click.svg" />
              </div>
              <Text fontSize="xs" color="#131D5399">
                Cliques{' '}
                <strong className="text-[#131D53] font-[400]">{clicks}</strong>
              </Text>
            </HStack>
            <HStack gap={2.5}>
              <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                <img src="/assets/icons/handbag-success.svg" />
              </div>
              <Text fontSize="xs" color="#131D5399">
                Pedidos{' '}
                <strong className="text-[#131D53] font-[400]">{orders}</strong>
              </Text>
            </HStack>
            <HStack gap={2.5}>
              <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                <img src="/assets/icons/percent-circle.svg" />
              </div>
              <Text fontSize="xs" color="#131D5399">
                Conversão{' '}
                <strong className="text-[#131D53] font-[400]">
                  {conversion}
                </strong>
              </Text>
            </HStack>
          </Flex>
        </Box>
      </Box>

      <Box borderTopWidth={1} borderTopColor="#E6E6E6" p={3} mt="auto">
        <HStack display={{ base: 'none', md: 'flex' }} gap={2}>
          <Button
            px={3}
            py={1.5}
            leftIcon={copied ? <Check size={12} /> : <Copy size={16} />}
            size="sm"
            fontSize="12px"
            borderRadius="md"
            color="#131D53"
            bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
            shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
            onClick={handleCopy}
          >
            {copied ? 'Copiado!' : 'Copiar Link'}
          </Button>
          <Button
            px={3}
            py={1.5}
            leftIcon={<Share2 size={16} />}
            size="sm"
            fontSize="12px"
            borderRadius="md"
            color="#131D53"
            bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
            shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
            onClick={() => setIsShareOpen(true)}
          >
            Compartilhar Link
          </Button>
          <Button
            px={3}
            py={1.5}
            leftIcon={<ChartNoAxesColumnIncreasing size={16} />}
            size="sm"
            fontSize="12px"
            borderRadius="md"
            color="#131D53"
            bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
            shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
            onClick={() => router.push(`/affiliate/hotlinks/${id}`)}
          >
            Ver Detalhes
          </Button>
          <Button
            px={3}
            py={1.5}
            leftIcon={<Trash2 size={16} />}
            size="sm"
            fontSize="12px"
            borderRadius="md"
            color="#E53E3E"
            bgGradient="linear-gradient(180deg, #fef5f5 47.86%, #fed7d7 123.81%)"
            shadow="0px 0px 0px 1px #fc8181 inset, 0px 0px 0px 2px #fff inset"
          >
            Deletar
          </Button>
        </HStack>

        <HStack justify="space-between" display={{ base: 'flex', md: 'none' }}>
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

          {isOpen && (
            <Box
              position="fixed"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.500"
              zIndex={11}
              onClick={onClose}
            />
          )}
          <Menu isOpen={isOpen}>
            <MenuButton
              as={IconButton}
              px={3}
              py={1.5}
              icon={<MoreHorizontal size={16} />}
              aria-label="Mais"
              size="sm"
              borderRadius="md"
              flex={1}
              zIndex={9}
              bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
              shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
              onClick={onOpen}
            />
            <MenuList
              color="#131d53"
              fontSize="sm"
              fontWeight={500}
              gap={5}
              onMouseLeave={onClose}
            >
              <MenuItem
                icon={<ChartNoAxesColumnIncreasing size={20} />}
                onClick={() => {
                  router.push(`/affiliate/hotlinks/${id}`)
                  onClose()
                }}
              >
                Ver Detalhes do Link
              </MenuItem>
              <MenuDivider />
              <MenuItem icon={<Trash2 size={20} />} onClick={onClose}>
                Deletar Link
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Box>
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
