import {
  Box,
  Text,
  HStack,
  Button,
  Flex,
  useToast,
  Badge,
} from '@chakra-ui/react'
import { Check, Copy, Share2, Loader2 } from 'lucide-react'
import { memo, useState, useEffect } from 'react'
import { formatPercentage, formatCurrency } from '@/utils/formatters'
import { LinksService } from '@/services/links'
import { ProductImage } from '../ProductImage'
import { ShimmerBadge } from '../Badges'
import { LinkAddIcon } from '@/components/Icons'

interface ProductCardProps {
  product: {
    id: number
    name: string
    image: string
    price: number
    commissionPercentage: number
    link: string
  }
}

export const ProductCard = memo(({ product }: ProductCardProps) => {
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const [currentLink, setCurrentLink] = useState(product.link)
  const [isCreatingLink, setIsCreatingLink] = useState(false)
  const linksService = new LinksService()
  const hasExistingLink = Boolean(currentLink && currentLink.trim() !== '')

  useEffect(() => {
    setCurrentLink(product.link)
  }, [product.link])

  const handleCopyLink = async () => {
    if (!hasExistingLink) {
      toast({
        title: 'Link não encontrado',
        description: 'Não há link gerado para este produto.',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    try {
      await navigator.clipboard.writeText(currentLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)

      toast({
        title: 'Link copiado!',
        description: 'Link de afiliado copiado para a área de transferência.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link.',
        status: 'error',
        duration: 2000,
      })
    }
  }

  const handleCreateLink = async () => {
    setIsCreatingLink(true)
    try {
      const { response } = await linksService.createAffiliateLink(product.id)

      if (response?.success && response.data?.url) {
        setCurrentLink(response.data.url)
        toast({
          title: 'Link criado!',
          description: 'Link de afiliado criado com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        throw new Error(response?.message || 'Erro ao criar link')
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao criar link',
        description:
          error.message || 'Não foi possível criar o link de afiliado.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsCreatingLink(false)
    }
  }

  const handleShare = async () => {
    if (!hasExistingLink) {
      toast({
        title: 'Sem link para compartilhar',
        description:
          'Crie um link de afiliado primeiro para poder compartilhar.',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    const shareData = {
      title: product.name,
      text: `Confira: ${product.name}`,
      url: currentLink,
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        handleCopyLink()
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Erro ao compartilhar:', error)
      }
    }
  }

  const calculateEarnings = (
    price: number,
    commissionPercentage: number
  ): number => {
    return (price * commissionPercentage) / 100
  }

  return (
    <Box
      bg="white"
      borderWidth={1}
      borderColor="#E6EEFA"
      borderRadius="md"
      overflow="hidden"
      minW={{ base: 'auto', md: '270px' }}
    >
      <Flex justify="center" align="center" h="120px" py={3}>
        <ProductImage
          src={product.image}
          alt={product.name}
          maxHeight="100%"
          width="auto"
          objectFit="contain"
        />
      </Flex>

      <Box
        key={product.id}
        h="200px"
        p={3}
        shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        borderTopWidth={1}
        borderTopColor="#E6EEFA"
      >
        <ShimmerBadge
          icon="/assets/icons/extra-commission.svg"
          percentage={formatPercentage(product.commissionPercentage)}
          className="mb-3"
        />

        <Box flex="1" mb={2} overflow="hidden">
          <Text
            fontSize="xs"
            color="#131D5399"
            noOfLines={2}
            lineHeight="1.3"
            display="-webkit-box"
            overflow="hidden"
            textOverflow="ellipsis"
            sx={{
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {product.name}
          </Text>
        </Box>

        <Box display={{ base: 'block', md: 'none' }} mb={3}>
          <Text fontSize="sm" color="#131D53" mb={2} fontWeight={500}>
            {formatCurrency(product.price)}
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
            maxW="fit-content"
          >
            Aprox.{' '}
            <Text fontWeight={600}>
              {formatCurrency(
                calculateEarnings(product.price, product.commissionPercentage)
              )}
            </Text>
          </Badge>
        </Box>

        <Flex
          display={{ base: 'none', md: 'flex' }}
          align="center"
          mb={3}
          gap={2}
        >
          <Text fontSize="sm" color="#131D53" fontWeight={500} flexShrink={0}>
            {formatCurrency(product.price)}
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
            flexShrink={0}
          >
            Aprox.{' '}
            <Text fontWeight={600}>
              {formatCurrency(
                calculateEarnings(product.price, product.commissionPercentage)
              )}
            </Text>
          </Badge>
        </Flex>

        <HStack maxH={{ base: 7, md: 8 }} justify="space-between" gap={2}>
          <Button
            w="full"
            h="full"
            px={3}
            py={1.5}
            size="sm"
            fontSize="xs"
            borderRadius="md"
            color="#131D53"
            bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
            shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
            onClick={hasExistingLink ? handleCopyLink : handleCreateLink}
            isLoading={isCreatingLink}
            isDisabled={isCreatingLink}
            gap={{ base: 0, md: 1 }}
          >
            {copied ? (
              <>
                <Check size={16} />
                <Text display={{ base: 'none', md: 'block' }} fontSize="xs">
                  Copiado!
                </Text>
              </>
            ) : hasExistingLink ? (
              <>
                <Copy size={16} />
                <Text display={{ base: 'none', md: 'block' }} fontSize="xs">
                  Copiar Link
                </Text>
              </>
            ) : isCreatingLink ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <Text display={{ base: 'none', md: 'block' }} fontSize="xs">
                  Criando...
                </Text>
              </>
            ) : (
              <>
                <LinkAddIcon boxSize={4} />
                <Text display={{ base: 'none', md: 'block' }} fontSize="xs">
                  Criar Link
                </Text>
              </>
            )}
          </Button>

          <Button
            w="full"
            h="full"
            px={3}
            py={1.5}
            size="sm"
            fontSize="xs"
            borderRadius="md"
            color="#131D53"
            bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
            shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
            onClick={handleShare}
            isDisabled={!hasExistingLink || isCreatingLink}
            gap={{ base: 0, md: 1 }}
          >
            <Share2 size={16} />
            <Text display={{ base: 'none', md: 'block' }} fontSize="xs">
              Compartilhar
            </Text>
          </Button>
        </HStack>
      </Box>
    </Box>
  )
})

ProductCard.displayName = 'ProductCard'
