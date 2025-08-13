import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Grid,
  GridItem,
  useDisclosure,
  Spinner,
  Center,
  Flex,
} from '@chakra-ui/react'
import Head from 'next/head'
import { useMemo } from 'react'
import { AppLayout } from '../../../components/AppLayout'
import { PageHeader } from '../../../components/common/PageHeader'
import { BadgeCounter } from '../../../components/common/BadgeCounter'
import { useMissions } from '../../../hooks/useMissions'
import { MissionCard } from '../../../components/MissionCard'
import { MissionGridCard } from '../../../components/MissionGridCard'
import { CombosModal } from '../../../components/modals/CombosModal'
import { BoostsModal } from '../../../components/modals/BoostsModal'
import { LevelModal } from '../../../components/modals/LevelModal'
import { MissionCard as MissionCardType } from '../../../types/missions'
import {
  MISSION_COLORS,
  MISSION_SPACING,
  MISSION_SIZES,
} from '../../../constants/missionTheme'
import { Medal, Flame, Zap, Trophy } from 'lucide-react'

const MissionsPage = () => {
  const {
    missions,
    boosts,
    level,
    combo,
    loading,
    getCompletedMissions,
    getAvailableMissions,
    getActiveBoosts,
    getTotalBoosts,
    activateBoost,
    deactivateBoost,
  } = useMissions()

  const {
    isOpen: isCombosOpen,
    onOpen: onCombosOpen,
    onClose: onCombosClose,
  } = useDisclosure()

  const {
    isOpen: isBoostsOpen,
    onOpen: onBoostsOpen,
    onClose: onBoostsClose,
  } = useDisclosure()

  const {
    isOpen: isLevelOpen,
    onOpen: onLevelOpen,
    onClose: onLevelClose,
  } = useDisclosure()

  const missionCards: MissionCardType[] = useMemo(
    () => [
      {
        id: '1',
        type: 'combos',
        title: 'Combos',
        subtitle: `${combo?.streakDays || 0} dias`,
        icon: (
          <Box
            w={`${MISSION_SIZES.icon.large}px`}
            h={`${MISSION_SIZES.icon.large}px`}
            bg={MISSION_COLORS.icon.combos}
            borderRadius="4px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Flame
              size={MISSION_SIZES.icon.small}
              color={MISSION_COLORS.text.white}
            />
          </Box>
        ),
        gradient: MISSION_COLORS.gradients.combos,
      },
      {
        id: '2',
        type: 'boosts',
        title: 'Boosts',
        count: getTotalBoosts(),
        icon: (
          <Box
            w={`${MISSION_SIZES.icon.large}px`}
            h={`${MISSION_SIZES.icon.large}px`}
            bg={MISSION_COLORS.icon.boosts}
            borderRadius="4px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Zap
              size={MISSION_SIZES.icon.small}
              color={MISSION_COLORS.text.white}
            />
          </Box>
        ),
        gradient: MISSION_COLORS.gradients.boosts,
      },
      {
        id: '3',
        type: 'missions',
        title: 'Missões',
        count: missions.length,
        icon: (
          <Box
            w={`${MISSION_SIZES.icon.large}px`}
            h={`${MISSION_SIZES.icon.large}px`}
            bg={MISSION_COLORS.icon.missions}
            borderRadius="4px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Trophy
              size={MISSION_SIZES.icon.small}
              color={MISSION_COLORS.text.white}
            />
          </Box>
        ),
        gradient: MISSION_COLORS.gradients.missions,
      },
      {
        id: '4',
        type: 'level',
        title: 'Level Atual',
        subtitle: level?.title || 'Carregando...',
        icon: (
          <Box
            w={`${MISSION_SIZES.icon.large}px`}
            h={`${MISSION_SIZES.icon.large}px`}
            bg={MISSION_COLORS.icon.level}
            borderRadius="4px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Medal
              size={MISSION_SIZES.icon.small}
              color={MISSION_COLORS.text.white}
            />
          </Box>
        ),
        gradient: MISSION_COLORS.gradients.level,
      },
    ],
    [combo?.streakDays, missions.length, level?.title, getTotalBoosts],
  )

  const handleCardClick = (cardType: string) => {
    switch (cardType) {
      case 'combos':
        onCombosOpen()
        break
      case 'boosts':
        onBoostsOpen()
        break
      case 'missions':
        break
      case 'level':
        onLevelOpen()
        break
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Missões | Affiliates</title>
        </Head>
        <AppLayout>
          <Center h="100vh">
            <Spinner size="xl" color="blue.500" />
          </Center>
        </AppLayout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Missões | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader
          title="Missões"
          icon={
            <Medal
              size={MISSION_SIZES.icon.small}
              color={MISSION_COLORS.text.primary}
            />
          }
          rightContent={
            <HStack spacing={4}>
              <BadgeCounter
                label="Completas:"
                count={getCompletedMissions()}
                type="success"
              />
              <BadgeCounter
                label="Disponíveis:"
                count={getAvailableMissions()}
                type="info"
              />
            </HStack>
          }
        />

        {/* Conteúdo Principal */}
        <Box
          display="flex"
          flexDirection="column"
          gap={2.5}
          p={3}
          mt={MISSION_SPACING.content.marginTop}
        >
          {/* Grid de Cards - Mobile: 2x2, Desktop: 1x4 */}
          <Grid
            templateColumns={{
              base: MISSION_SPACING.grid.templateColumns,
              md: 'repeat(4, 1fr)',
            }}
            gap={{
              base: MISSION_SPACING.card.smallGap,
              md: '12px',
            }}
          >
            {missionCards.map((card) => (
              <GridItem key={card.id}>
                <MissionGridCard
                  card={card}
                  onClick={() => handleCardClick(card.type)}
                />
              </GridItem>
            ))}
          </Grid>

          {/* Seção Missões Disponíveis */}
          <Box
            p={3}
            borderWidth={1}
            borderColor={MISSION_COLORS.borders.default}
            rounded={12}
            bgColor={MISSION_COLORS.backgrounds.white}
          >
            {/* Mobile: Layout original */}
            <Box display={{ base: 'block', md: 'none' }}>
              <Text
                fontSize="xl"
                color={MISSION_COLORS.text.primary}
                mb={3}
                lineHeight={'120%'}
              >
                Affiliates Missions
              </Text>
              <HStack spacing={4} mb={3}>
                <BadgeCounter
                  label="Completas:"
                  count={getCompletedMissions()}
                  type="success"
                  orientation="vertical"
                />
                <BadgeCounter
                  label="Disponíveis:"
                  count={getAvailableMissions()}
                  type="info"
                  orientation="vertical"
                />
              </HStack>
            </Box>

            {/* Desktop: Layout otimizado */}
            <Box display={{ base: 'none', md: 'block' }}>
              <Flex justify="space-between" align="center" mb={3}>
                <Text
                  fontSize="xl"
                  color={MISSION_COLORS.text.primary}
                  lineHeight={'120%'}
                >
                  Affiliates Missions
                </Text>
                <HStack spacing={4}>
                  <BadgeCounter
                    label="Completas:"
                    count={getCompletedMissions()}
                    type="success"
                    orientation="horizontal"
                  />
                  <BadgeCounter
                    label="Disponíveis:"
                    count={getAvailableMissions()}
                    type="info"
                    orientation="horizontal"
                  />
                </HStack>
              </Flex>
            </Box>

            <Grid
              bg={MISSION_COLORS.backgrounds.container}
              p={3}
              templateColumns={{
                base: MISSION_SPACING.grid.autoFill,
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              }}
              rounded={12}
              gap={MISSION_SPACING.card.smallGap}
            >
              {missions.map((mission) => (
                <GridItem key={mission.id} gap={2}>
                  <MissionCard mission={mission} />
                </GridItem>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Modais */}
        <CombosModal
          isOpen={isCombosOpen}
          onClose={onCombosClose}
          combo={combo}
        />

        <BoostsModal
          isOpen={isBoostsOpen}
          onClose={onBoostsClose}
          boosts={boosts}
          activeBoosts={getActiveBoosts()}
          totalBoosts={getTotalBoosts()}
          onActivateBoost={activateBoost}
          onDeactivateBoost={deactivateBoost}
        />

        <LevelModal isOpen={isLevelOpen} onClose={onLevelClose} level={level} />
      </AppLayout>
    </>
  )
}

export default MissionsPage
