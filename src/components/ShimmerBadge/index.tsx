import { Box, HStack, Text } from '@chakra-ui/react'

interface ShimmerBadgeProps {
  icon: string
  text?: string
  percentage: string | number
  className?: string
}

export function ShimmerBadge({
  icon,
  text,
  percentage,
  className,
}: ShimmerBadgeProps) {
  return (
    <HStack
      w="fit-content"
      py={0.5}
      px={1}
      gap={1}
      rounded={4}
      bg="#C085FF4D"
      color="#2F0062"
      fontSize="xs"
      fontWeight="semibold"
      position="relative"
      overflow="hidden"
      className={`shimmer-badge ${className}`}
    >
      {icon && <img src={icon} alt="" className="w-5 h-5" />}
      {text && (
        <HStack gap={0}>
          <Text fontWeight={300} textTransform="uppercase">
            {text}
          </Text>
        </HStack>
      )}
      {percentage && <Text fontWeight={600}>{percentage}</Text>}

      <Box
        position="absolute"
        top="-50%"
        left="-100%"
        w="50%"
        h="200%"
        bg="linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)"
        transform="skewX(-25deg)"
        className="shimmer"
      />
    </HStack>
  )
}
