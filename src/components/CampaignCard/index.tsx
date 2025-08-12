'use client'

import { SharedSuccessModal } from '@/components/CreateLinkModal/SharedSuccessModal'
import { ShareModal } from '@/components/CreateLinkModal/ShareModal'
import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  useDisclosure,
  Divider,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { ShimmerBadge } from '@/components/ShimmerBadge'
import { ItemsCampaignCard } from './ItemsCampaignCard'

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
}

export function CampaignCard({
  id,
  title,
  periodStart,
  periodEnd,
  imageUrl,
  products,
}: CampaignCardProps) {
  const router = useRouter()

  const maxCommission = useMemo(() => {
    if (!products || products.length === 0) return 0

    return Math.max(...products.map((product) => product.commissionPercentage))
  }, [products])

  return (
    <Box borderRadius="md" bg="white" borderWidth={1} borderColor="#DEE6F2">
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
            text="Comissões até"
            percentage={`${maxCommission}%`}
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
          <img src={imageUrl} className="h-[200px] w-auto" />
        </Flex>

        <Box>
          <Text color="#000" fontSize="sm" mb={2}>
            Alguns produtos participantes:
          </Text>
          <Box overflowX="auto">
            <HStack spacing={2} minW="max-content">
              {products.map((product) => (
                <ItemsCampaignCard
                  id={product.id}
                  image={product.image}
                  commissionPercentage={product.commissionPercentage}
                  name={product.name}
                  price={product.price}
                />
              ))}
            </HStack>
          </Box>
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
