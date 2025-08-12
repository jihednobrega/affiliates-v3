import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  Button,
  Image,
  Flex,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { memo, useMemo } from 'react'
import { Mission } from '../../types/missions'
import { MISSION_COLORS } from '../../constants/missionTheme'

interface MissionCardProps {
  mission: Mission
}

const MissionCardComponent: React.FC<MissionCardProps> = ({ mission }) => {
  const router = useRouter()

  const progressPercentage = useMemo(
    () => (mission.progress / mission.total) * 100,
    [mission.progress, mission.total],
  )

  const handleViewDetails = () => {
    router.push(`/affiliate/missions/${mission.id}`)
  }

  return (
    <Box
      bg={MISSION_COLORS.backgrounds.white}
      borderRadius="md"
      boxShadow="sm"
      borderWidth={1}
      borderColor={MISSION_COLORS.borders.default}
      w="full"
    >
      <VStack align="stretch" gap={0}>
        <Flex
          justify="space-between"
          align="center"
          borderBottomWidth={1}
          borderBottomColor={MISSION_COLORS.borders.default}
          p={3}
        >
          <HStack spacing={2}>
            <Box
              w="32px"
              h="32px"
              rounded={4}
              overflow="hidden"
              bg="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              borderWidth={1}
              borderColor="#E6E6E6"
            >
              {mission.badgeImage && (
                <Image
                  src={mission.badgeImage}
                  alt={mission.badge}
                  w="full"
                  h="full"
                  objectFit="cover"
                />
              )}
            </Box>

            <Text
              fontSize="xs"
              fontWeight={700}
              color="#131D53"
              lineHeight="1.2"
            >
              {mission.title}
            </Text>
          </HStack>

          {mission.expiresIn && (
            <Badge
              bg="#FFE1CD"
              color="#AA4100"
              fontSize="xs"
              borderWidth={1}
              borderColor="#DCD0C5"
              lineHeight={4}
              px={3}
              py={1}
              borderRadius="full"
              textTransform="initial"
              fontWeight={400}
            >
              Encerra em {mission.expiresIn}
            </Badge>
          )}
        </Flex>

        <Box p={3} borderBottomWidth={1} borderBottomColor="#DEE6F2">
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" color="#131D5399">
              Progresso da missão
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="#131D53">
              {mission.progress}/{mission.total} vendas
            </Text>
          </HStack>

          <Box position="relative" mb={5}>
            <Box p={1} bg="#D7E4FF" rounded="full">
              <Progress
                value={progressPercentage}
                size="lg"
                h="20px"
                borderRadius="full"
                bg="#B5C6EB"
                sx={{
                  '& > div': {
                    background:
                      'linear-gradient(90deg, #60A5FA 0%, #3B82F6 100%)',
                  },
                }}
              />
            </Box>

            <Text
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              fontSize="sm"
              fontWeight="semibold"
              color="white"
              textShadow="0 1px 2px rgba(0,0,0,0.1)"
            >
              {Math.round(progressPercentage)}%
            </Text>
          </Box>

          <Text fontSize="sm" mb={3} color="#131D5399" lineHeight="1.4">
            {mission.description}
          </Text>

          <HStack spacing={1}>
            <Text fontSize="sm" fontWeight={500} color="#131D53">
              Recompensa:
            </Text>
            <Box
              bg="#F4F6F9"
              px={3}
              py={0.5}
              borderRadius="full"
              borderWidth={1}
              borderColor="#C5CDDC"
            >
              <Text fontSize="xs" color="#676B8C">
                {mission.reward}
              </Text>
            </Box>
          </HStack>
        </Box>

        <Box p={3}>
          <Button
            w="full"
            size="md"
            fontSize="xs"
            fontWeight={400}
            borderRadius="md"
            color="#131D53"
            bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
            shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
            onClick={handleViewDetails}
          >
            Ver detalhes
          </Button>
        </Box>
      </VStack>
    </Box>
  )
}

export const MissionCard = memo(
  MissionCardComponent,
  (prev, next) =>
    prev.mission.progress === next.mission.progress &&
    prev.mission.total === next.mission.total &&
    prev.mission.id === next.mission.id,
)
