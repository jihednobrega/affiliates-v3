import { HStack, VStack, Text, Badge } from '@chakra-ui/react'
import { MISSION_COLORS } from '../../../constants/missionTheme'

interface BadgeCounterProps {
  label: string
  count: number
  type: 'success' | 'info'
  orientation?: 'horizontal' | 'vertical'
  suffix?: string
}

export const BadgeCounter: React.FC<BadgeCounterProps> = ({
  label,
  count,
  type,
  orientation = 'horizontal',
  suffix,
}) => {
  const getBadgeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: MISSION_COLORS.backgrounds.lightGreen,
          color: MISSION_COLORS.text.success,
        }
      case 'info':
        return {
          bg: MISSION_COLORS.backgrounds.lightBlue,
          color: MISSION_COLORS.text.primary,
        }
      default:
        return {
          bg: MISSION_COLORS.backgrounds.lightBlue,
          color: MISSION_COLORS.text.primary,
        }
    }
  }

  const badgeStyles = getBadgeStyles()
  const Container = orientation === 'horizontal' ? HStack : VStack

  return (
    <Container
      spacing={orientation === 'horizontal' ? 1 : 1}
      align={orientation === 'horizontal' ? 'center' : 'start'}
    >
      <Text
        fontSize="12px"
        color={MISSION_COLORS.text.secondary}
        fontWeight="400"
      >
        {label}
      </Text>
      <Badge
        bg={badgeStyles.bg}
        color={badgeStyles.color}
        borderRadius="4px"
        px="8px"
        py="2px"
        fontSize="14px"
        fontWeight="400"
        lineHeight={'120%'}
      >
        {count}
        {suffix}
      </Badge>
    </Container>
  )
}
