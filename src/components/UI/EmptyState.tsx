import { Box, VStack, Text, Button } from '@chakra-ui/react'
import { LucideIcon } from 'lucide-react'
import { COLORS } from '@/constants/colors'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionButton?: {
    label: string
    onClick: () => void
    variant?: 'solid' | 'outline' | 'ghost'
  }
  size?: 'sm' | 'md' | 'lg'
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionButton,
  size = 'md',
}: EmptyStateProps) => {
  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
  } as const

  const containerPadding = {
    sm: 8,
    md: 12,
    lg: 16,
  } as const

  const titleSizes = {
    sm: 'md',
    md: 'lg',
    lg: 'xl',
  } as const

  return (
    <Box
      textAlign="center"
      py={containerPadding[size]}
      bg="white"
      borderRadius="12px"
      borderWidth={1}
      borderColor="#DEE6F2"
    >
      <VStack spacing={6}>
        <Box
          w="64px"
          h="64px"
          bg="#F7FAFC"
          borderRadius="50%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon size={iconSizes[size]} color="#A0AEC0" />
        </Box>

        <VStack spacing={3}>
          <Text
            fontSize={titleSizes[size]}
            fontWeight="600"
            color={COLORS.PRIMARY}
          >
            {title}
          </Text>
          <Text
            fontSize="sm"
            color={COLORS.PRIMARY_OPACITY}
            maxW="400px"
            textAlign="center"
            lineHeight="1.5"
            px={6}
          >
            {description}
          </Text>
        </VStack>

        {actionButton && (
          <Button
            onClick={actionButton.onClick}
            size="md"
            px={4}
            py={2}
            rounded={6}
            fontSize="sm"
            fontWeight={500}
            color="#131D53"
            bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
            shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
            _hover={{
              bgGradient:
                'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
              shadow:
                '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
            }}
          >
            {actionButton.label}
          </Button>
        )}
      </VStack>
    </Box>
  )
}
