'use client'

import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  Divider,
} from '@chakra-ui/react'
import { ProductImage } from '@/components/UI/ProductImage'
import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { ShimmerBadge } from '@/components/UI/Badges'
import { ItemsCampaignCard } from '../ItemsCampaignCard'
import { formatPercentage } from '@/utils/formatters'

interface CampaignCardProps {
  id: number
  title: string
  periodStart: string
  periodEnd: string
  imageUrl: string
  products: {
    id: number
    name: string
    image: string
    price: number
    commissionPercentage: number
  }[]

  creatives?: {
    id: number
    type: string
    title: string
    url: string
    thumbnail?: string
  }[]

  status?: string

  maxCommission?: number
}

export function CampaignCard({
  id,
  title,
  periodStart,
  periodEnd,
  imageUrl,
  products,
  maxCommission,
}: CampaignCardProps) {
  const router = useRouter()

  const calculatedMaxCommission = useMemo(() => {
    if (!products || products.length === 0) {
      return maxCommission || 0
    }

    const productsWithCommission = products.filter(
      (p) => p.commissionPercentage > 0
    )

    if (productsWithCommission.length === 0) {
      return maxCommission || 0
    }

    const calculatedMax = Math.max(
      ...productsWithCommission.map((p) => p.commissionPercentage)
    )

    return calculatedMax
  }, [products, maxCommission])

  return (
    <Box
      borderRadius="md"
      bg="white"
      borderWidth={1}
      borderColor="#DEE6F2"
      maxW="100%"
      w="100%"
    >
      <Box p={3} borderBottomWidth={1} borderBottomColor="#E6E6E6">
        <Flex align="center" gap={4} mb={2}>
          <Text fontSize="xl" color="#131D53">
            {title}
          </Text>
          <Badge
            bg="#DFEFFF"
            rounded={4}
            py={1}
            px={2}
            fontWeight={600}
            color="#1F70F1"
            lineHeight="14.4px"
          >
            Em Andamento
          </Badge>
        </Flex>
        <HStack gap={2.5} mb={2}>
          <Box>
            <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
              <img src="/assets/icons/calendar-in-progress.svg" />
            </div>
          </Box>
          <HStack>
            <Text fontSize="xs" color="#131D53">
              De: {periodStart}
            </Text>
            <Divider
              orientation="vertical"
              w={0.5}
              h={5}
              color="#131D5380"
              bg="#131D5380"
            />
            <Text fontSize="xs" color="#131D53">
              Até: {periodEnd}
            </Text>
          </HStack>
        </HStack>
        <HStack>
          <ShimmerBadge
            icon={'/assets/icons/extra-commission.svg'}
            text={calculatedMaxCommission > 0 ? 'Comissões até' : 'Comissões'}
            percentage={formatPercentage(calculatedMaxCommission)}
          />
        </HStack>
      </Box>

      <Box p={3}>
        <Flex
          justify="center"
          align="center"
          maxH="200px"
          overflow="hidden"
          mb={5}
        >
          <ProductImage
            src={imageUrl}
            alt={title}
            height="200px"
            width="auto"
            objectFit="contain"
          />
        </Flex>

        <Box>
          <Text color="#000" fontSize="sm" mb={2}>
            Alguns produtos participantes:
          </Text>
          {products && products.length > 0 ? (
            <Box overflowX="auto" w="100%">
              <HStack spacing={2} minW="max-content" maxW="100%">
                {products.slice(0, 4).map((product) => (
                  <ItemsCampaignCard
                    key={product.id}
                    id={product.id}
                    image={product.image}
                    commissionPercentage={product.commissionPercentage}
                    name={product.name}
                    price={product.price}
                  />
                ))}
              </HStack>
            </Box>
          ) : (
            <Box p={4} bg="gray.50" borderRadius="md" textAlign="center">
              <Text color="gray.500" fontSize="sm">
                Produtos da campanha em carregamento...
              </Text>
            </Box>
          )}
        </Box>

        <VStack mt={2} align="stretch">
          <Button
            size="md"
            fontSize="xs"
            borderRadius="md"
            color="#131D53"
            bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
            shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
            onClick={() => router.push(`/affiliate/campaigns/${id}`)}
          >
            Ver Campanha
          </Button>
        </VStack>
      </Box>
    </Box>
  )
}
