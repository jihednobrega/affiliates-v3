import {
  Box,
  Flex,
  Spinner,
  Skeleton,
  VStack,
  SkeletonText,
} from '@chakra-ui/react'

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'pulse'
  size?: 'sm' | 'md' | 'lg'
  count?: number
}

export const LoadingState = ({
  type = 'spinner',
  size = 'md',
  count = 3,
}: LoadingStateProps) => {
  const spinnerSizes = {
    sm: 'sm',
    md: 'lg',
    lg: 'xl',
  } as const

  const paddingY = {
    sm: 4,
    md: 8,
    lg: 12,
  } as const

  if (type === 'spinner') {
    return (
      <Flex justify="center" align="center" py={paddingY[size]} minH="200px">
        <Spinner size={spinnerSizes[size]} color="blue.500" thickness="3px" />
      </Flex>
    )
  }

  if (type === 'skeleton') {
    return (
      <VStack spacing={4} py={paddingY[size]}>
        {Array.from({ length: count }).map((_, i) => (
          <Box
            key={i}
            w="full"
            p={4}
            bg="white"
            borderRadius="lg"
            borderWidth={1}
            borderColor="#DEE6F2"
          >
            <VStack align="start" spacing={3}>
              <Skeleton height="20px" width="60%" />
              <SkeletonText
                mt={2}
                noOfLines={2}
                spacing={2}
                skeletonHeight="16px"
              />
              <Skeleton height="16px" width="40%" />
            </VStack>
          </Box>
        ))}
      </VStack>
    )
  }

  if (type === 'pulse') {
    return (
      <Box py={paddingY[size]}>
        <Box
          w="full"
          h="200px"
          bg="gray.100"
          borderRadius="lg"
          className="animate-pulse"
        />
      </Box>
    )
  }

  return null
}
