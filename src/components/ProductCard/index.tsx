import { ShimmerBadge } from '@/components/ShimmerBadge'
import {
  Box,
  Text,
  HStack,
  Button,
  Flex,
  useToast,
  Badge,
} from '@chakra-ui/react'
import { Check, Copy, Share2 } from 'lucide-react'
import { memo, useState } from 'react'

interface ProductCardProps {
  product: {
    id: number
    name: string
    image: string
    price: number
    commissionPercentage: number
  }
}

export const ProductCard = memo(({ product }: ProductCardProps) => {
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      const affiliateLink = `${window.location.origin}/go/${product.id}`
      await navigator.clipboard.writeText(affiliateLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)

      toast({
        title: 'Link copiado!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Erro ao copiar link:', error)
      toast({
        title: 'Erro ao copiar',
        status: 'error',
        duration: 2000,
      })
    }
  }

  function calculateEarnings(
    price: number,
    commissionPercentage: number,
  ): number {
    return (price * commissionPercentage) / 100
  }

  function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <Box
      bg="white"
      borderWidth={1}
      borderColor="#E6EEFA"
      borderRadius="md"
      overflow="hidden"
    >
      <Flex justify="center" align="center" h="120px" py={3}>
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full w-auto object-contain"
          loading="lazy"
        />
      </Flex>

      <Box
        key={product.id}
        h="200px"
        p={2}
        shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        borderTopWidth={1}
        borderTopColor="#E6EEFA"
      >
        <ShimmerBadge
          icon="/assets/icons/extra-commission.svg"
          percentage={`${product.commissionPercentage}%`}
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

        <Text fontSize="sm" color="#131D53" mb={3} fontWeight={500}>
          R$ {formatCurrency(product.price)}
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
          mb={3}
        >
          Aprox.{' '}
          <Text fontWeight={600}>
            R${' '}
            {formatCurrency(
              calculateEarnings(product.price, product.commissionPercentage),
            )}
          </Text>
        </Badge>

        <HStack maxH={7} justify="space-between" gap={2}>
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
            onClick={handleCopyLink}
          >
            {copied ? <Check size={20} /> : <Copy size={16} />}
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
          >
            <Share2 size={16} />
          </Button>
        </HStack>
      </Box>
    </Box>
  )
})

ProductCard.displayName = 'ProductCard'
