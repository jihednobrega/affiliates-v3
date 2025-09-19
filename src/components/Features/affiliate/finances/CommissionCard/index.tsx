import {
  Box,
  HStack,
  Text,
  Badge,
  Image,
  VStack,
  Flex,
  Divider,
  Grid,
  Skeleton,
} from '@chakra-ui/react'
import { CommissionAffiliateList } from '@/services/types/finances.types'
import { formatCurrency } from '@/utils/currency'

interface CommissionCardProps {
  commission: CommissionAffiliateList
}

export function CommissionCard({ commission }: CommissionCardProps) {
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()

    if (statusLower.includes('delivered') || statusLower.includes('paid')) {
      return 'green'
    }
    if (statusLower.includes('shipped') || statusLower.includes('invoiced')) {
      return 'blue'
    }
    if (statusLower.includes('canceled') || statusLower.includes('cancelled')) {
      return 'red'
    }
    if (statusLower.includes('pending') || statusLower.includes('handling')) {
      return 'yellow'
    }
    return 'gray'
  }

  const productPrice = formatCurrency(parseFloat(commission.product_price))
  const commissionValue = formatCurrency(parseFloat(commission.commission))
  const commissionPercentage = parseFloat(
    commission.commission_percentage
  ).toFixed(1)
  const formattedDate = new Date(commission.updated_at).toLocaleDateString(
    'pt-BR'
  )

  return (
    <Box
      bg="white"
      p={4}
      borderRadius="12px"
      borderWidth={1}
      borderColor="#DEE6F2"
      shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
      _hover={{ shadow: '0px 2px 4px 0px rgba(0, 13, 53, 0.1)' }}
      transition="box-shadow 0.2s"
    >
      <VStack spacing={4} align="stretch">
        <Flex justify="space-between" align="start">
          <HStack spacing={3} flex={1}>
            <Box
              w="48px"
              h="48px"
              borderRadius="8px"
              overflow="hidden"
              bg="gray.100"
              flexShrink={0}
            >
              <Image
                src={commission.image}
                alt={commission.name}
                w="full"
                h="full"
                objectFit="cover"
                fallback={
                  <Box
                    w="full"
                    h="full"
                    bg="gray.200"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="xs" color="gray.500">
                      IMG
                    </Text>
                  </Box>
                }
              />
            </Box>
            <VStack align="start" spacing={1} flex={1} minW={0}>
              <Text
                fontSize="sm"
                fontWeight="600"
                color="#131D53"
                noOfLines={2}
                lineHeight="1.3"
              >
                {commission.name}
              </Text>
              <Text fontSize="xs" color="#131D5399">
                SKU: {commission.sku}
              </Text>
            </VStack>
          </HStack>

          <Badge
            colorScheme={getStatusColor(commission.vendor_status)}
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="6px"
            textTransform="none"
            fontWeight="500"
            flexShrink={0}
          >
            {commission.vendor_status}
          </Badge>
        </Flex>

        <Divider borderColor="#F0F4F8" />

        <Grid templateColumns="1fr 1fr 1fr" gap={4}>
          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color="#131D5399" fontWeight="400">
              Preço do Produto
            </Text>
            <Text fontSize="sm" fontWeight="600" color="#131D53">
              {productPrice}
            </Text>
          </VStack>

          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color="#131D5399" fontWeight="400">
              Comissão ({commissionPercentage}%)
            </Text>
            <Text fontSize="sm" fontWeight="600" color="#10B981">
              {commissionValue}
            </Text>
          </VStack>

          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color="#131D5399" fontWeight="400">
              Data
            </Text>
            <Text fontSize="sm" fontWeight="600" color="#131D53">
              {formattedDate}
            </Text>
          </VStack>
        </Grid>

        <Box>
          <HStack spacing={4} fontSize="xs" color="#131D5399">
            <Text>
              <Text as="span" fontWeight="500">
                Cliente:
              </Text>{' '}
              {commission.customer}
            </Text>
            <Text>
              <Text as="span" fontWeight="500">
                Pedido:
              </Text>{' '}
              #{commission.vendor_order_id}
            </Text>
          </HStack>

          {commission.commission_origin && (
            <Text fontSize="xs" color="#131D5399" mt={1}>
              <Text as="span" fontWeight="500">
                Origem:
              </Text>{' '}
              {commission.commission_origin}
            </Text>
          )}
        </Box>
      </VStack>
    </Box>
  )
}

export function CommissionCardSkeleton() {
  return (
    <Box
      bg="white"
      p={4}
      borderRadius="12px"
      borderWidth={1}
      borderColor="#DEE6F2"
    >
      <VStack spacing={4} align="stretch">
        <HStack spacing={3}>
          <Skeleton w="48px" h="48px" borderRadius="8px" />
          <VStack align="start" spacing={2} flex={1}>
            <Skeleton height="16px" width="70%" />
            <Skeleton height="12px" width="40%" />
          </VStack>
          <Skeleton height="20px" width="60px" borderRadius="6px" />
        </HStack>

        <Divider />

        <HStack spacing={4}>
          <Skeleton height="12px" width="80px" />
          <Skeleton height="12px" width="80px" />
          <Skeleton height="12px" width="60px" />
        </HStack>

        <Skeleton height="12px" width="90%" />
      </VStack>
    </Box>
  )
}
