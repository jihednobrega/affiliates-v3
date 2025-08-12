import { Box, VStack, Text, Icon, useColorModeValue } from '@chakra-ui/react'
import { memo, useMemo } from 'react'
import { MissionCard } from '../../types/missions'
import {
  MISSION_COLORS,
  MISSION_ASSETS,
  MISSION_SIZES,
  MISSION_SPACING,
} from '../../constants/missionTheme'

interface MissionGridCardProps {
  card: MissionCard
  onClick: () => void
}

const MissionGridCardComponent: React.FC<MissionGridCardProps> = ({
  card,
  onClick,
}) => {
  const hoverBg = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')

  const cardStyles = useMemo(() => {
    switch (card.type) {
      case 'combos':
        return {
          border: `1px solid ${MISSION_COLORS.borders.combos}`,
          background: MISSION_COLORS.gradients.combos,
          bgImage: MISSION_ASSETS.bgIcons.combos,
        }
      case 'boosts':
        return {
          border: `1px solid ${MISSION_COLORS.borders.default}`,
          background: MISSION_COLORS.gradients.boosts,
          bgImage: MISSION_ASSETS.bgIcons.boosts,
        }
      case 'missions':
        return {
          border: `1px solid ${MISSION_COLORS.borders.default}`,
          background: MISSION_COLORS.gradients.missions,
          bgImage: MISSION_ASSETS.bgIcons.missions,
        }
      case 'level':
        return {
          border: `1px solid ${MISSION_COLORS.borders.level}`,
          background: MISSION_COLORS.gradients.level,
          bgImage: MISSION_ASSETS.bgIcons.level,
        }
      default:
        return {
          border: `1px solid ${MISSION_COLORS.borders.default}`,
          background: MISSION_COLORS.gradients.combos,
          bgImage: MISSION_ASSETS.bgIcons.combos,
        }
    }
  }, [card.type])

  return (
    <Box
      as="button"
      onClick={onClick}
      display="flex"
      w={MISSION_SIZES.card.width}
      p={MISSION_SPACING.card.padding}
      flexDirection="column"
      justifyContent="center"
      alignItems="flex-start"
      gap={MISSION_SPACING.card.gap}
      borderRadius={MISSION_SPACING.card.borderRadius}
      border={cardStyles.border}
      bgGradient={cardStyles.background.replace('linear-gradient', 'linear')}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        backgroundImage: `url(${cardStyles.bgImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center right',
        backgroundSize: 'contain',
        opacity: 1,
        pointerEvents: 'none',
      }}
      cursor="pointer"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
        transition: 'all 0.2s',
      }}
      _active={{
        transform: 'translateY(0)',
        boxShadow: 'md',
      }}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg={hoverBg}
        opacity={0}
        _hover={{ opacity: 1 }}
        transition="opacity 0.2s"
      />

      <Box position="relative">{card.icon}</Box>

      <Box position="relative" textAlign="start">
        <Text
          fontSize="xs"
          color={MISSION_COLORS.text.white}
          lineHeight="12px"
          mb={1}
        >
          {card.title}
        </Text>

        {card.subtitle && (
          <Text
            fontSize="md"
            fontWeight="semibold"
            lineHeight="16px"
            color={MISSION_COLORS.text.white}
          >
            {card.subtitle}
          </Text>
        )}

        {card.count !== undefined && (
          <Text
            fontSize="md"
            fontWeight="semibold"
            lineHeight="16px"
            color={MISSION_COLORS.text.white}
          >
            {card.count}
          </Text>
        )}
      </Box>
    </Box>
  )
}

export const MissionGridCard = memo(
  MissionGridCardComponent,
  (prev, next) =>
    prev.card.id === next.card.id &&
    prev.card.title === next.card.title &&
    prev.card.subtitle === next.card.subtitle &&
    prev.card.count === next.card.count,
)
