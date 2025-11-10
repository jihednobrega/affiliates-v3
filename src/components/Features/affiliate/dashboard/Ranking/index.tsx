'use client'

import { ShimmerBadge } from '@/components/UI/Badges'
import { ProductTable } from './ProductTable'
import { useDashboard } from '@/hooks/useDashboard'
import { Box, Flex, Text, Skeleton } from '@chakra-ui/react'

export default function Ranking() {
  const { productsData, isLoadingProducts, productsError, hasProductsData } =
    useDashboard()

  if (isLoadingProducts) {
    return (
      <Flex
        flexDirection="column"
        gap={3}
        p={3}
        pb={4}
        border="1px solid"
        borderColor="#dee6f2"
        bg="white"
        borderRadius="xl"
        overflow="hidden"
        className="container-shadow"
      >
        <Text fontSize="sm" color="#131d53" px={3}>
          Meu Ranking
        </Text>
        <Box display="flex" justifyContent="center" py={8}>
          <Skeleton height="365px" width="100%" rounded={6} />
        </Box>
      </Flex>
    )
  }

  if (productsError) {
    return (
      <Flex
        flexDirection="column"
        gap={3}
        p={3}
        pb={4}
        border="1px solid"
        borderColor="#dee6f2"
        bg="white"
        borderRadius="xl"
        overflow="hidden"
        className="container-shadow"
      >
        <Text fontSize="sm" color="#131d53" px={3}>
          Meu Ranking
        </Text>
        <Box textAlign="center" py={8} color="red.500">
          <Text>Erro ao carregar produtos</Text>
        </Box>
      </Flex>
    )
  }

  if (!hasProductsData || productsData.length === 0) {
    return (
      <Flex
        flexDirection="column"
        gap={3}
        p={3}
        pb={4}
        border="1px solid"
        borderColor="#dee6f2"
        bg="white"
        borderRadius="xl"
        overflow="hidden"
        className="container-shadow"
      >
        <Text fontSize="sm" color="#131d53" px={3}>
          Meu Ranking
        </Text>
        <Box textAlign="center" py={8} color="gray.500">
          <Text>Ainda não há produtos no ranking</Text>
        </Box>
      </Flex>
    )
  }

  return (
    <Flex
      flexDirection="column"
      gap={3}
      p={3}
      pb={4}
      border="1px solid"
      borderColor="#dee6f2"
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      className="container-shadow"
    >
      <Text fontSize="sm" color="#131d53" px={3}>
        Meu Ranking
      </Text>
      <Flex flexDirection="column" gap={6}>
        <Box overflow="hidden" position="relative">
          <Box
            border="1px solid"
            borderRadius="md"
            borderColor="#DEE6F2"
            overflow="scroll"
          >
            <ProductTable data={productsData} />
          </Box>
        </Box>
        <Flex gap={5} px={3}>
          <Flex align="center" gap={2}>
            <ShimmerBadge
              icon="/assets/icons/commission.svg"
              text=""
              percentage=""
            />
            <Text fontSize="xs" color="#131d5399">
              Comissão
            </Text>
          </Flex>
          <Flex align="center" gap={2}>
            <ShimmerBadge
              icon="/assets/icons/extra-commission.svg"
              text=""
              percentage=""
            />
            <Text fontSize="xs" color="#131d5399">
              Comissão Extra
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}
