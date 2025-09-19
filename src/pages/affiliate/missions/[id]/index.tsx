import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  Button,
  Spinner,
  Center,
} from '@chakra-ui/react'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import { useMissions } from '@/hooks/useMissions'
import { useCountdown } from '@/hooks/useCountdown'
import { MISSION_COLORS, MISSION_SPACING } from '@/constants/missionTheme'
import { ChevronLeft, Zap } from 'lucide-react'
import { AppLayout } from '@/components/Layout'
import { ProductImage } from '@/components/UI'

const MissionDetailsPage = () => {
  const router = useRouter()
  const { id } = router.query
  const { missions, loading } = useMissions()

  const mission = missions.find((m) => m.id === id)
  const timeLeft = useCountdown(mission?.expiresIn, mission?.id)

  if (loading) {
    return (
      <>
        <Head>
          <title>Detalhes da Missão | Affiliates</title>
        </Head>
        <AppLayout>
          <Center h="100vh">
            <Spinner size="xl" color="blue.500" />
          </Center>
        </AppLayout>
      </>
    )
  }

  if (!mission) {
    return (
      <>
        <Head>
          <title>Missão não encontrada | Affiliates</title>
        </Head>
        <AppLayout>
          <Box display="flex" flexDirection="column" gap={4} p={3}>
            <VStack spacing={4}>
              <Text fontSize="lg" color="gray.600">
                Missão não encontrada
              </Text>
              <Button
                leftIcon={<ChevronLeft />}
                onClick={() => router.push('/affiliate/missions')}
                colorScheme="blue"
                variant="outline"
              >
                Voltar para Missões
              </Button>
            </VStack>
          </Box>
        </AppLayout>
      </>
    )
  }

  const progressPercentage = (mission.progress / mission.total) * 100

  return (
    <>
      <Head>
        <title>{mission.title} | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <HStack spacing={3} align="center">
            <Button
              variant="ghost"
              onClick={() => router.push('/affiliate/missions')}
              p={2}
              minW="auto"
              h="auto"
              _hover={{ bg: 'gray.100' }}
            >
              <ChevronLeft size={20} />
            </Button>
            {mission.badgeImage && (
              <Box
                w="32px"
                h="32px"
                rounded={4}
                overflow="hidden"
                bg={MISSION_COLORS.backgrounds.white}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
                borderWidth={1}
                borderColor={MISSION_COLORS.borders.card}
              >
                <ProductImage
                  src={mission.badgeImage}
                  alt={mission.title}
                  height="30px"
                />
              </Box>
            )}
            <Text
              fontSize="lg"
              fontWeight="semibold"
              color={MISSION_COLORS.text.primary}
            >
              {mission.title}
            </Text>
          </HStack>
        </PageHeader>

        <PageContent>
          <Box
            borderRadius={MISSION_SPACING.card.borderRadius}
            border={`1px solid ${MISSION_COLORS.borders.default}`}
            bg={MISSION_COLORS.backgrounds.white}
          >
            <Box
              p={MISSION_SPACING.card.padding}
              borderBottom={`1px solid ${MISSION_COLORS.borders.default}`}
            >
              <HStack spacing="6px" justify="center" align="center">
                <VStack
                  w="full"
                  gap={0}
                  bg={MISSION_COLORS.backgrounds.lightBlue}
                  p={MISSION_SPACING.card.padding}
                  borderRadius="4px"
                >
                  <Text
                    color={MISSION_COLORS.text.primary}
                    mt={0.5}
                    fontSize="32px"
                    lineHeight={5}
                    fontWeight="500"
                  >
                    {timeLeft.days.toString().padStart(1, '0')}
                  </Text>
                  <Text
                    mt={1.5}
                    fontSize="12px"
                    fontWeight="400"
                    color={MISSION_COLORS.text.secondary}
                  >
                    Dias
                  </Text>
                </VStack>

                <Text
                  fontSize="24px"
                  fontWeight="bold"
                  color={MISSION_COLORS.text.primary}
                >
                  :
                </Text>

                <VStack
                  w="full"
                  gap={0}
                  bg={MISSION_COLORS.backgrounds.lightBlue}
                  p={MISSION_SPACING.card.padding}
                  borderRadius="4px"
                >
                  <Text
                    color={MISSION_COLORS.text.primary}
                    mt={0.5}
                    fontSize="32px"
                    lineHeight={5}
                    fontWeight="500"
                  >
                    {timeLeft.hours.toString().padStart(2, '0')}
                  </Text>
                  <Text
                    mt={1.5}
                    fontSize="12px"
                    fontWeight="400"
                    color={MISSION_COLORS.text.secondary}
                  >
                    Horas
                  </Text>
                </VStack>

                <Text
                  fontSize="24px"
                  fontWeight="bold"
                  color={MISSION_COLORS.text.primary}
                >
                  :
                </Text>

                <VStack
                  w="full"
                  gap={0}
                  bg={MISSION_COLORS.backgrounds.lightBlue}
                  p={MISSION_SPACING.card.padding}
                  borderRadius="4px"
                >
                  <Text
                    color={MISSION_COLORS.text.primary}
                    mt={0.5}
                    fontSize="32px"
                    lineHeight={5}
                    fontWeight="500"
                  >
                    {timeLeft.minutes.toString().padStart(2, '0')}
                  </Text>
                  <Text
                    mt={1.5}
                    fontSize="12px"
                    fontWeight="400"
                    color={MISSION_COLORS.text.secondary}
                  >
                    Minutos
                  </Text>
                </VStack>

                <Text
                  fontSize="24px"
                  fontWeight="bold"
                  color={MISSION_COLORS.text.primary}
                >
                  :
                </Text>

                <VStack
                  w="full"
                  gap={0}
                  bg={MISSION_COLORS.backgrounds.lightBlue}
                  p={MISSION_SPACING.card.padding}
                  borderRadius="4px"
                >
                  <Text
                    color={MISSION_COLORS.text.primary}
                    mt={0.5}
                    fontSize="32px"
                    lineHeight={5}
                    fontWeight="500"
                  >
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </Text>
                  <Text
                    mt={1.5}
                    fontSize="12px"
                    fontWeight="400"
                    color={MISSION_COLORS.text.secondary}
                  >
                    Segundos
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box p="12px">
              <Text textAlign="center" color="#131D5399">
                Restantes para finalizar missão
              </Text>
            </Box>
          </Box>

          <Box borderRadius="12px" border="1px solid #dee6f2" bg="white">
            <Box
              px="12px"
              py="16px"
              display="flex"
              flexDirection="column"
              gap="20px"
            >
              <Box py={3} display="flex" justifyContent="center">
                {mission.badgeImage && (
                  <Box
                    w="120px"
                    h="120px"
                    rounded={8}
                    overflow="hidden"
                    bg="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <ProductImage
                      src={mission.badgeImage}
                      alt={mission.title}
                      width="full"
                      height="full"
                      objectFit="cover"
                    />
                  </Box>
                )}
              </Box>

              <VStack spacing="12px" align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="#131D5399">
                    Progresso da missão
                  </Text>
                  <Text fontSize="sm" fontWeight="medium" color="#131D53">
                    {mission.progress}/{mission.total} vendas
                  </Text>
                </HStack>

                <Box position="relative">
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
              </VStack>
            </Box>

            <Box borderTop="1px solid #dee6f2">
              <Box p="12px">
                <Text fontSize="14px" fontWeight="500" color="#131d53" mb="8px">
                  Missão
                </Text>
                <Text
                  fontSize="14px"
                  fontWeight="400"
                  color="#131D5399"
                  mb="32px"
                >
                  {mission.description}
                </Text>

                <Text fontSize="14px" fontWeight="500" color="#131D53" mb="8px">
                  Recompensa
                </Text>
                <Badge
                  borderRadius="4px"
                  bg="#C085FF4D"
                  p="8px"
                  display="flex"
                  alignItems="center"
                  gap="4px"
                  w="fit-content"
                >
                  <Zap size={20} color="#2F0062" />
                  <Text color="#2F0062" fontSize="14px">
                    {mission.reward}
                  </Text>
                </Badge>
              </Box>
            </Box>
          </Box>
        </PageContent>
      </AppLayout>
    </>
  )
}

export default MissionDetailsPage
