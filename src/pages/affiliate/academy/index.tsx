'use client'

import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import Head from 'next/head'
import {
  Box,
  Button,
  Flex,
  HStack,
  VStack,
  Text,
  Image,
  Skeleton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  AspectRatio,
  Progress,
} from '@chakra-ui/react'
import { GraduationCap, Play, Check } from 'lucide-react'
import { AppLayout } from '@/components/Layout'
import { useCategories, useTrainings } from '@/hooks/useAcademy'
import { AcademyService } from '@/services/academy'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EmptyState, ErrorState } from '@/components/UI'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Training } from '@/services/types/academy.types'
import dynamic from 'next/dynamic'
import { getYouTubeThumbnail } from '@/utils/getYouTubeThumbnail'
import { BadgeCounter } from '@/components/UI/Badges'

const ReactPlayer = dynamic(() => import('react-player'), {
  ssr: false,
  loading: () => (
    <Box
      w="100%"
      h="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Text>Carregando player...</Text>
    </Box>
  ),
}) as any

function TrainingsLoadingSkeleton() {
  return (
    <Box
      p={3}
      borderWidth={1}
      borderColor="#DEE6F2"
      rounded={12}
      bgColor="white"
    >
      <Box display={{ base: 'block', md: 'none' }}>
        <Skeleton height="28px" width="150px" mb={3} />
        <HStack spacing={4} mb={3}>
          <VStack align="start" spacing={1}>
            <Skeleton height="12px" width="40px" />
            <Skeleton height="20px" width="30px" />
          </VStack>
          <VStack align="start" spacing={1}>
            <Skeleton height="12px" width="60px" />
            <Skeleton height="20px" width="40px" />
          </VStack>
        </HStack>
      </Box>

      <Box display={{ base: 'none', md: 'block' }}>
        <Flex justify="space-between" align="center" mb={3}>
          <Skeleton height="28px" width="150px" />
          <HStack spacing={4}>
            <HStack spacing={2}>
              <Skeleton height="16px" width="40px" />
              <Skeleton height="20px" width="30px" />
            </HStack>
            <HStack spacing={2}>
              <Skeleton height="16px" width="60px" />
              <Skeleton height="20px" width="40px" />
            </HStack>
          </HStack>
        </Flex>
      </Box>

      <Box
        bg="#EEF2FD"
        p={3}
        rounded={12}
        borderWidth={1}
        borderColor="#E6E6E6"
      >
        <VStack spacing={2} display={{ base: 'flex', md: 'none' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Box
              key={i}
              w="full"
              bg="white"
              borderRadius="md"
              borderWidth={1}
              borderColor="#DEE6F2"
              overflow="hidden"
            >
              <AspectRatio ratio={16 / 9}>
                <Skeleton />
              </AspectRatio>

              <Box p={3}>
                <VStack align="start" spacing={3}>
                  <Skeleton height="16px" width="80%" />
                  <Skeleton height="14px" width="60%" />
                  <Box w="full" mt={4}>
                    <Skeleton height="12px" width="70px" mb={1} />
                    <Skeleton height="20px" width="100%" borderRadius="full" />
                  </Box>
                </VStack>
              </Box>
            </Box>
          ))}
        </VStack>

        <Box
          display={{ base: 'none', md: 'grid' }}
          gridTemplateColumns={{
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          }}
          gap={2}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Box
              key={i}
              bg="white"
              borderRadius="md"
              borderWidth={1}
              borderColor="#DEE6F2"
              overflow="hidden"
            >
              <AspectRatio ratio={16 / 9}>
                <Skeleton />
              </AspectRatio>

              <Box p={3}>
                <VStack align="start" spacing={3}>
                  <Skeleton height="16px" width="80%" />
                  <Skeleton height="14px" width="60%" />
                  <Box w="full" mt={4}>
                    <Skeleton height="12px" width="70px" mb={1} />
                    <Skeleton height="20px" width="100%" borderRadius="full" />
                  </Box>
                </VStack>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

function TrainingCard({
  training,
  onPlayVideo,
}: {
  training: Training
  onPlayVideo: (training: Training) => void
}) {
  const progressValue = parseFloat(training.progress)
  const isCompleted = progressValue >= 100

  const getBorderColor = () => {
    if (isCompleted) return '#10B981'
    if (progressValue > 0) return '#60A5FA'
    return '#DEE6F2'
  }

  return (
    <>
      <Box
        bg="white"
        borderRadius="md"
        borderWidth={2}
        borderColor={getBorderColor()}
        overflow="hidden"
        cursor="pointer"
        transition="all 0.2s"
        _hover={{
          borderColor: isCompleted ? '#059669' : '#3B82F6',
          shadow: isCompleted
            ? '0 4px 12px rgba(16, 185, 129, 0.15)'
            : '0 4px 12px rgba(31, 112, 241, 0.15)',
          transform: 'translateY(-2px)',
        }}
        onClick={() => onPlayVideo(training)}
        position="relative"
        display="flex"
        flexDirection="column"
      >
        {isCompleted && (
          <Box
            position="absolute"
            top={2}
            right={2}
            zIndex={1}
            bg="green.500"
            color="white"
            borderRadius="full"
            p={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            shadow="0 2px 4px rgba(0,0,0,0.1)"
          >
            <Check size={16} />
          </Box>
        )}

        <AspectRatio ratio={16 / 9}>
          <Image
            src={getYouTubeThumbnail(training.content_url) || undefined}
            fallback={
              <Box
                bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
              >
                <Box
                  position="absolute"
                  inset={0}
                  bg="blackAlpha.300"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Box
                    bg="whiteAlpha.900"
                    borderRadius="full"
                    p={3}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Play size={24} color="#131D53" />
                  </Box>
                </Box>
              </Box>
            }
            alt={`Thumbnail: ${training.name}`}
            objectFit="cover"
            w="full"
            h="full"
            loading="lazy"
            onError={(e) => {}}
          />
        </AspectRatio>

        <Box p={3} flex={1} display="flex" flexDirection="column">
          <VStack align="start" spacing={3} flex={1}>
            <Box w="full">
              <HStack justify="space-between" align="start" spacing={2}>
                <Text
                  fontWeight="semibold"
                  fontSize="sm"
                  color="#131D53"
                  lineHeight="1.3"
                  noOfLines={2}
                  flex={1}
                >
                  {training.name}
                </Text>
              </HStack>
              {training.description && (
                <Text fontSize="sm" color="gray.600" mt={1} noOfLines={2}>
                  {training.description}
                </Text>
              )}
            </Box>

            <Box flex={1} />

            <Box w="full" mt="auto">
              <HStack mb={1}>
                <Text fontSize="sm" color="#131D5399">
                  Progresso:
                </Text>
              </HStack>

              <Box position="relative">
                <Box p={1} bg="#D7E4FF" rounded="full">
                  <Progress
                    value={progressValue}
                    size="lg"
                    h="20px"
                    borderRadius="full"
                    bg="#B5C6EB"
                    sx={{
                      '& > div': {
                        background: isCompleted
                          ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                          : 'linear-gradient(90deg, #60A5FA 0%, #3B82F6 100%)',
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
                  {Math.round(progressValue)}%
                </Text>
              </Box>
            </Box>
          </VStack>
        </Box>
      </Box>
    </>
  )
}

function VideoPlayerModal({
  isOpen,
  onClose,
  training,
  moduleTrainings,
  onTrainingChange,
}: {
  isOpen: boolean
  onClose: () => void
  training: Training | null
  moduleTrainings: Training[]
  onTrainingChange: (training: Training) => void
}) {
  const [videoPlayerProgress, setVideoPlayerProgress] = useState<
    Record<number, number>
  >({})
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoDuration, setVideoDuration] = useState<number>(0)

  const currentByIdRef = useRef<Record<number, number>>({})
  const durationByIdRef = useRef<Record<number, number>>({})

  const sentMilestonesRef = useRef<Record<number, Set<number>>>({})

  const lastSentAtRef = useRef<Record<number, number>>({})

  const queryClient = useQueryClient()
  const academyService = new AcademyService()

  const convertYouTubeUrl = (url: string) => {
    if (!url) return url
    if (url.includes('youtube.com/watch')) return url
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      if (videoId) {
        const fullUrl = `https://www.youtube.com/watch?v=${videoId}`
        return fullUrl
      }
    }
    return url
  }

  const { mutate: updateVideoProgress } = useMutation({
    mutationFn: ({
      videoId,
      progress,
    }: {
      videoId: number
      progress: string
    }) => academyService.updateTrainingProgress(videoId, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
    },
  })

  const handleDurationChange = useCallback(
    (seconds: number) => {
      const id = training?.id
      if (!id || !Number.isFinite(seconds)) return
      durationByIdRef.current[id] = seconds
      setVideoDuration(seconds)
    },
    [training?.id]
  )

  const handleTimeUpdate = useCallback(
    (currentSeconds: number) => {
      const id = training?.id
      if (!id || !Number.isFinite(currentSeconds)) return

      currentByIdRef.current[id] = currentSeconds
      const duration = durationByIdRef.current[id] ?? 0
      if (!duration || !Number.isFinite(duration) || duration <= 0) return

      const percent = Math.max(
        0,
        Math.min(100, (currentSeconds / duration) * 100)
      )

      setVideoPlayerProgress((prev) => {
        if (Math.abs((prev[id] ?? 0) - percent) < 0.25) {
          return prev
        }
        return { ...prev, [id]: percent }
      })

      const serverProgress = Number(training?.progress ?? 0)
      const milestones = [30, 60, 90]
      const sent = (sentMilestonesRef.current[id] ??= new Set<number>())

      const now = Date.now()
      const last = lastSentAtRef.current[id] ?? 0
      const canSend = now - last > 5000

      for (const m of milestones) {
        if (percent > m && !sent.has(m) && percent >= serverProgress) {
          if (canSend) {
            updateVideoProgress({
              videoId: id,
              progress: (Math.round(percent * 100) / 100).toFixed(2),
            })
            sent.add(m)
            lastSentAtRef.current[id] = Date.now()
          }
          break
        }
      }
    },
    [training?.id, training?.progress, updateVideoProgress]
  )

  const sortedTrainings = useMemo(
    () => moduleTrainings.sort((a, b) => a.position - b.position),
    [moduleTrainings]
  )

  const handleVideoEnd = useCallback(() => {
    if (!training) return

    updateVideoProgress({
      videoId: training.id,
      progress: (100).toFixed(2),
    })

    setVideoPlayerProgress((prev) => ({
      ...prev,
      [training.id]: 100,
    }))
  }, [training, updateVideoProgress])

  const handleVideoProgress = useCallback(
    (trainingId: number) => {
      const selectedTraining = sortedTrainings?.find(
        (training) => training.id === trainingId
      )
      if (!selectedTraining) return

      const selectedTrainingStoredProgress =
        videoPlayerProgress[selectedTraining.id]

      if (
        !selectedTrainingStoredProgress ||
        Number(selectedTraining.progress) >= selectedTrainingStoredProgress
      ) {
        return
      }

      updateVideoProgress({
        videoId: trainingId,
        progress: selectedTrainingStoredProgress.toFixed(2),
      })
    },
    [sortedTrainings, videoPlayerProgress, updateVideoProgress]
  )

  const handleVideoSelect = useCallback(
    (selectedTraining: Training) => {
      if (training) {
        handleVideoProgress(training.id)
      }
      onTrainingChange(selectedTraining)

      sentMilestonesRef.current[selectedTraining.id] = new Set<number>()
    },
    [training, handleVideoProgress, onTrainingChange]
  )

  if (!training) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: '6xl', md: '6xl' }}
      closeOnOverlayClick={true}
      isCentered
    >
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent
        mx={{ base: 4, md: 8 }}
        my={{ base: 4, md: 8 }}
        maxH={{ base: '95vh', md: '90vh' }}
        borderRadius={{ base: 12, md: 12 }}
        overflow="hidden"
      >
        <ModalHeader p={{ base: 2, md: 4 }} pb={2}>
          <HStack justify="space-between">
            <VStack align="start" spacing={0} pl={2} flex={1}>
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                fontWeight="semibold"
                color="#131D53"
                lineHeight="1.3"
                noOfLines={1}
              >
                {training.name}
              </Text>
              <Text fontSize="sm" color="#131D5399" noOfLines={1}>
                {training.category}
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>

        <ModalBody p={{ base: 2, md: 4 }} pt={0}>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={4}
            h="full"
            align="stretch"
          >
            <Box
              w={{ base: 'full', md: '65%' }}
              aspectRatio={16 / 9}
              bg="black"
              borderRadius="lg"
              overflow="hidden"
              position="relative"
              flexShrink={0}
              shadow="lg"
            >
              {training.content_url ? (
                <ReactPlayer
                  width="100%"
                  height="100%"
                  controls
                  playing={isPlaying}
                  src={convertYouTubeUrl(training.content_url)}
                  progressInterval={1000}
                  key={training.id}
                  onReady={() => {}}
                  onStart={() => {}}
                  onPlay={() => {
                    setIsPlaying(true)
                  }}
                  onPause={() => {
                    setIsPlaying(false)
                    if (training) {
                      handleVideoProgress(training.id)
                    }
                  }}
                  onDurationChange={(event: any) => {
                    const duration = event?.target?.duration || 0

                    if (Number.isFinite(duration) && duration > 0) {
                      handleDurationChange(duration)
                    }
                  }}
                  onTimeUpdate={(event: any) => {
                    const currentTime = event?.target?.currentTime || 0
                    const id = training?.id

                    if (
                      !id ||
                      !Number.isFinite(currentTime) ||
                      !Number.isFinite(videoDuration) ||
                      videoDuration === 0 ||
                      currentTime < 0
                    ) {
                      return
                    }

                    handleTimeUpdate(currentTime)
                  }}
                  onEnded={handleVideoEnd}
                  onError={(error: any) => {}}
                />
              ) : (
                <Box
                  w="full"
                  h="full"
                  bg="gray.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text>URL do vídeo não disponível</Text>
                </Box>
              )}
            </Box>

            <Box
              w={{ base: 'full', md: '35%' }}
              bg="white"
              borderWidth={1}
              borderColor="#DEE6F2"
              borderRadius="lg"
              maxH={{ base: '300px', md: 'full' }}
              overflow="hidden"
              shadow="sm"
            >
              <Box
                p={{ base: 2, md: 3 }}
                bg="#F8FAFC"
                borderBottom="1px solid"
                borderColor="#DEE6F2"
              >
                <Text fontSize="sm" fontWeight="medium" color="#131D53">
                  Vídeos do Módulo ({sortedTrainings.length})
                </Text>
              </Box>
              <Box
                p={{ base: 2, md: 3 }}
                maxH={{ base: '250px', md: '400px' }}
                overflowY="auto"
              >
                <VStack spacing={1} align="stretch">
                  {sortedTrainings.map((t) => {
                    const isCurrentVideo = t.id === training.id
                    const videoProgress = Math.round(
                      Math.max(
                        parseFloat(t.progress),
                        videoPlayerProgress[Number(t.id)] || 0
                      )
                    )
                    const isCompleted = videoProgress >= 100

                    return (
                      <HStack
                        key={t.id}
                        p={2}
                        borderRadius="md"
                        bg={isCurrentVideo ? 'blue.50' : 'white'}
                        borderWidth={1}
                        borderColor={
                          isCurrentVideo
                            ? '#60A5FA'
                            : isCompleted
                            ? '#10B981'
                            : 'gray.200'
                        }
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{
                          borderColor: isCompleted ? '#059669' : '#3B82F6',
                          bg: isCompleted ? 'green.50' : 'blue.50',
                        }}
                        onClick={() => handleVideoSelect(t)}
                      >
                        <Box flexShrink={0}>
                          {isCurrentVideo ? (
                            <Play size={16} color="#3182CE" fill="#3182CE" />
                          ) : isCompleted ? (
                            <Check size={16} color="#38A169" />
                          ) : (
                            <Play size={16} color="#718096" />
                          )}
                        </Box>
                        <VStack align="start" spacing={1} flex={1}>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="#131D53"
                            lineHeight="1.3"
                            noOfLines={1}
                          >
                            {t.name}
                          </Text>
                          <Box w="full">
                            <Progress
                              value={videoProgress}
                              size="sm"
                              h="6px"
                              borderRadius="full"
                              bg="gray.200"
                              sx={{
                                '& > div': {
                                  background: isCompleted
                                    ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                                    : 'linear-gradient(90deg, #60A5FA 0%, #3B82F6 100%)',
                                },
                              }}
                            />
                          </Box>
                        </VStack>
                      </HStack>
                    )
                  })}
                </VStack>
              </Box>
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

function ModuleSelector({
  categories,
  selectedModule,
  onSelectModule,
  trainingsData,
}: {
  categories: string[]
  selectedModule: string
  onSelectModule: (module: string) => void
  trainingsData?: any
}) {
  const getModuleProgress = (category: string) => {
    if (!trainingsData) return 0

    const moduleTrainings =
      trainingsData.list?.filter((t: any) => t.category === category) || []
    if (moduleTrainings.length === 0) return 0

    const totalProgress = moduleTrainings.reduce(
      (acc: number, t: any) => acc + parseFloat(t.progress),
      0
    )
    return Math.round(totalProgress / moduleTrainings.length)
  }

  return (
    <Box>
      <HStack
        spacing={2}
        overflowX="auto"
        display={{ base: 'flex', md: 'none' }}
        css={{
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
        }}
      >
        {categories.map((category) => {
          const moduleProgress = getModuleProgress(category)
          const isCompleted = moduleProgress >= 100
          const isSelected = selectedModule === category

          return (
            <Button
              key={category}
              size="sm"
              variant={isSelected ? 'solid' : 'outline'}
              colorScheme={isCompleted ? 'green' : 'blue'}
              onClick={() => onSelectModule(category)}
              flexShrink={0}
            >
              {category}
            </Button>
          )
        })}
      </HStack>

      <Box display={{ base: 'none', md: 'block' }}>
        <HStack spacing={2} flexWrap="wrap">
          {categories.map((category) => {
            const moduleProgress = getModuleProgress(category)
            const isCompleted = moduleProgress >= 100
            const isSelected = selectedModule === category

            return (
              <Button
                key={category}
                size="md"
                variant={isSelected ? 'solid' : 'outline'}
                colorScheme={isCompleted ? 'green' : 'blue'}
                onClick={() => onSelectModule(category)}
              >
                {category}
              </Button>
            )
          })}
        </HStack>
      </Box>
    </Box>
  )
}

export default function Academy() {
  const [selectedModule, setSelectedModule] = useState('Módulo 0')
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null
  )
  const [hasInitializedModule, setHasInitializedModule] = useState(false)
  const {
    isOpen: isVideoModalOpen,
    onOpen: onVideoModalOpen,
    onClose: onVideoModalClose,
  } = useDisclosure()

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories()

  const {
    data: trainingsData,
    isLoading: trainingsLoading,
    error: trainingsError,
  } = useTrainings(selectedModule)

  const { data: allTrainingsData, isLoading: allTrainingsLoading } =
    useTrainings()

  const trainings = trainingsData?.list || []

  const getFirstIncompleteModule = (
    allTrainings: Training[],
    categories: string[]
  ) => {
    for (const category of categories.sort()) {
      const moduleTrainings = allTrainings.filter(
        (t) => t.category === category
      )
      if (moduleTrainings.length === 0) continue

      const totalProgress = moduleTrainings.reduce(
        (acc, t) => acc + parseFloat(t.progress),
        0
      )
      const moduleProgress = Math.round(totalProgress / moduleTrainings.length)

      if (moduleProgress < 100) {
        return category
      }
    }

    return null
  }

  useEffect(() => {
    if (allTrainingsData?.list && categories && !hasInitializedModule) {
      const firstIncompleteModule = getFirstIncompleteModule(
        allTrainingsData.list,
        categories
      )
      if (firstIncompleteModule) {
        setSelectedModule(firstIncompleteModule)
      }
      setHasInitializedModule(true)
    }
  }, [allTrainingsData, categories, hasInitializedModule])

  const handlePlayVideo = (training: Training) => {
    setSelectedTraining(training)
    onVideoModalOpen()
  }

  const handleTrainingChange = (training: Training) => {
    setSelectedTraining(training)
  }

  const handleCloseVideoModal = () => {
    setSelectedTraining(null)
    onVideoModalClose()
  }

  const isInitialLoading = categoriesLoading && !categories
  const isTrainingsLoading = trainingsLoading
  const error = categoriesError || trainingsError

  if (isInitialLoading) {
    return (
      <>
        <Head>
          <title>Affiliates Academy | Affiliates</title>
        </Head>
        <AppLayout>
          <PageHeader>
            <Box display="flex" flexDirection="column" gap={3} w="full">
              <Flex justifyContent="space-between" align="center">
                <Flex gap={2} align="center">
                  <GraduationCap size={24} color="#131D53" />
                  <HStack fontSize="sm" color="#131D53">
                    <Text>Affiliates Academy:</Text>
                    <Skeleton height="24px" width="40px" borderRadius="4px" />
                  </HStack>
                </Flex>

                <Button
                  as="a"
                  href="https://drive.google.com/drive/folders/1QuzLcCCA9wsa3Siz5LmZVJdnkIlfAEsR"
                  target="_blank"
                  rel="noopener noreferrer"
                  rounded={4}
                  h={8}
                  fontSize="xs"
                  fontWeight={600}
                  px={3}
                  color="#fff"
                  bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%);"
                  shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                  }}
                  transition="all 0.2s ease"
                >
                  Acessar Criativos
                </Button>
              </Flex>
            </Box>
          </PageHeader>
          <PageContent>
            <VStack spacing="10px" align="stretch">
              <HStack
                spacing={2}
                overflowX="auto"
                display={{ base: 'flex', md: 'none' }}
              >
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    height="32px"
                    width="80px"
                    borderRadius="4px"
                    flexShrink={0}
                  />
                ))}
              </HStack>

              <Box display={{ base: 'none', md: 'block' }}>
                <HStack spacing={2} flexWrap="wrap">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      height="40px"
                      width="100px"
                      borderRadius="4px"
                    />
                  ))}
                </HStack>
              </Box>

              <TrainingsLoadingSkeleton />
            </VStack>
          </PageContent>
        </AppLayout>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Affiliates Academy | Affiliates</title>
        </Head>
        <AppLayout>
          <PageHeader>
            <Flex gap={2} align="center">
              <GraduationCap size={24} color="#131D53" />
              <Text fontSize="sm" color="#131D53">
                Affiliates Academy
              </Text>
            </Flex>
          </PageHeader>
          <PageContent>
            <ErrorState
              description="Não foi possível carregar o conteúdo da Academy. Verifique sua conexão e tente novamente."
              onRetry={() => window.location.reload()}
            />
          </PageContent>
        </AppLayout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Affiliates Academy | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Box display="flex" flexDirection="column" gap={3} w="full">
            <Flex justifyContent="space-between" align="center">
              <Flex gap={2} align="center">
                <GraduationCap size={24} color="#131D53" />
                <HStack fontSize="sm" color="#131D53">
                  <Text>Affiliates Academy:</Text>
                  {allTrainingsLoading ? (
                    <Skeleton height="24px" width="40px" borderRadius="4px" />
                  ) : (
                    <Box
                      alignContent="center"
                      justifyContent="center"
                      bgColor="#DFEFFF"
                      px={2}
                      py={0.5}
                      rounded={4}
                      lineHeight="120%"
                    >
                      {allTrainingsData?.meta?.total_items || 0}
                    </Box>
                  )}
                </HStack>
              </Flex>

              <Button
                as="a"
                href="https://drive.google.com/drive/folders/1QuzLcCCA9wsa3Siz5LmZVJdnkIlfAEsR"
                target="_blank"
                rel="noopener noreferrer"
                rounded={4}
                h={8}
                fontSize="xs"
                fontWeight={600}
                px={3}
                color="#fff"
                bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%);"
                shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                _hover={{
                  bgGradient:
                    'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                  shadow:
                    '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                }}
                transition="all 0.2s ease"
              >
                Acessar Criativos
              </Button>
            </Flex>
          </Box>
        </PageHeader>

        <PageContent>
          <VStack spacing="10px" align="stretch">
            {categories && categories.length > 0 && (
              <ModuleSelector
                categories={categories}
                selectedModule={selectedModule}
                onSelectModule={setSelectedModule}
                trainingsData={allTrainingsData}
              />
            )}

            {isTrainingsLoading ? (
              <TrainingsLoadingSkeleton />
            ) : trainings.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title={
                  selectedModule
                    ? `Nenhuma aula encontrada no ${selectedModule}`
                    : 'Nenhuma aula disponível'
                }
                description={
                  selectedModule
                    ? 'Este módulo ainda não possui aulas disponíveis. Selecione outro módulo ou aguarde novos conteúdos.'
                    : 'As aulas da Academy aparecerão aqui quando forem disponibilizadas pela marca.'
                }
                actionButton={
                  selectedModule
                    ? {
                        label: 'Ver Todos os Módulos',
                        onClick: () => setSelectedModule(''),
                        variant: 'outline',
                      }
                    : undefined
                }
              />
            ) : (
              <Box
                p={3}
                borderWidth={1}
                borderColor="#DEE6F2"
                rounded={12}
                bgColor="white"
              >
                <Box display={{ base: 'block', md: 'none' }}>
                  <Text fontSize="xl" color="#131D53" mb={3} lineHeight="120%">
                    {selectedModule}
                  </Text>
                  <HStack spacing={4} mb={3}>
                    <BadgeCounter
                      label="Aulas:"
                      count={trainings.length}
                      type="info"
                      orientation="vertical"
                    />
                    <BadgeCounter
                      label="Progresso:"
                      count={Math.round(
                        trainings.reduce(
                          (acc, t) => acc + parseFloat(t.progress),
                          0
                        ) / trainings.length
                      )}
                      type="success"
                      orientation="vertical"
                      suffix="%"
                    />
                  </HStack>
                </Box>

                <Box display={{ base: 'none', md: 'block' }}>
                  <Flex justify="space-between" align="center" mb={3}>
                    <Text fontSize="xl" color="#131D53" lineHeight="120%">
                      {selectedModule}
                    </Text>
                    <HStack spacing={4}>
                      <BadgeCounter
                        label="Aulas:"
                        count={trainings.length}
                        type="info"
                        orientation="horizontal"
                      />
                      <BadgeCounter
                        label="Progresso:"
                        count={Math.round(
                          trainings.reduce(
                            (acc, t) => acc + parseFloat(t.progress),
                            0
                          ) / trainings.length
                        )}
                        type="success"
                        orientation="horizontal"
                        suffix="%"
                      />
                    </HStack>
                  </Flex>
                </Box>

                <Box
                  bg="#EEF2FD"
                  p={3}
                  rounded={12}
                  borderWidth={1}
                  borderColor="#E6E6E6"
                >
                  <Box
                    display={{ base: 'flex', md: 'none' }}
                    flexDirection="column"
                    gap={2}
                  >
                    {trainings.map((training) => (
                      <TrainingCard
                        key={training.id}
                        training={training}
                        onPlayVideo={handlePlayVideo}
                      />
                    ))}
                  </Box>

                  <Box
                    display={{ base: 'none', md: 'grid' }}
                    gridTemplateColumns={{
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)',
                    }}
                    gap={2}
                  >
                    {trainings.map((training) => (
                      <TrainingCard
                        key={training.id}
                        training={training}
                        onPlayVideo={handlePlayVideo}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </VStack>
        </PageContent>

        <VideoPlayerModal
          isOpen={isVideoModalOpen}
          onClose={handleCloseVideoModal}
          training={selectedTraining}
          moduleTrainings={trainings}
          onTrainingChange={handleTrainingChange}
        />
      </AppLayout>
    </>
  )
}
