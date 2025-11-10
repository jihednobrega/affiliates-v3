import { Box, Flex, Text } from '@chakra-ui/react'
import { formatPercentage, formatCurrency } from '@/utils/formatters'
import { ProductImage } from '@/components/UI'
import { ShimmerBadge } from '@/components/UI/Badges'

interface ItemsCampaignCardProps {
  id: number
  image: string
  name: string
  commissionPercentage: number
  price: number
}

export function ItemsCampaignCard({
  id,
  image,
  name,
  commissionPercentage,
  price,
}: ItemsCampaignCardProps) {
  return (
    <Box
      key={id}
      w="120px"
      h="220px"
      borderWidth={1}
      borderColor="#DEE6F2"
      rounded={6}
      p={1.5}
      pb={3}
      shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Flex
        justify="center"
        align="center"
        h="92px"
        mb={3}
        pointerEvents={'none'}
      >
        <ProductImage
          src={image}
          alt={name}
          maxHeight="92px"
          width="auto"
          objectFit="contain"
        />
      </Flex>

      <ShimmerBadge
        icon="/assets/icons/extra-commission.svg"
        percentage={formatPercentage(commissionPercentage)}
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
          {name}
        </Text>
      </Box>

      <Text fontSize="sm" color="#131D53" fontWeight={500}>
        {formatCurrency(price)}
      </Text>
    </Box>
  )
}
