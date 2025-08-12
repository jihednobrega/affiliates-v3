import { Box, Flex, Text, Button, HStack } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { MISSION_COLORS, MISSION_SPACING } from '../../constants/missionTheme'

interface PageHeaderProps {
  title: string
  icon?: ReactNode
  showBackButton?: boolean
  onBackClick?: () => void
  rightContent?: ReactNode
  backButtonText?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  icon,
  showBackButton = false,
  onBackClick,
  rightContent,
  backButtonText = 'Voltar'
}) => {
  return (
    <Box
      borderBottomWidth={1}
      borderBottomColor={MISSION_COLORS.borders.header}
      bg={MISSION_COLORS.backgrounds.white}
      p={4}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      position="fixed"
      top={MISSION_SPACING.header.top}
      left={{ base: 0, lg: MISSION_SPACING.header.sidebarOffset }}
      right={0}
      zIndex={10}
      gap={2}
    >
      <Flex gap={2} align="center">
        {showBackButton && (
          <Button
            onClick={onBackClick}
            px={3}
            py={1.5}
            border={`1px solid ${MISSION_COLORS.borders.default}`}
            fontSize="xs"
            fontWeight="500"
            color={MISSION_COLORS.text.primary}
            bg={MISSION_COLORS.backgrounds.white}
            _hover={{ bg: 'gray.50' }}
            h={6}
          >
            {backButtonText}
          </Button>
        )}
        
        {icon && (
          <Text fontSize="24px">
            {icon}
          </Text>
        )}
        
        <Text fontSize="sm" color={MISSION_COLORS.text.primary}>
          {title}
        </Text>
      </Flex>

      {rightContent && (
        <HStack spacing={4}>
          {rightContent}
        </HStack>
      )}
    </Box>
  )
}