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
  Badge,
  Skeleton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  AspectRatio,
  Progress,
} from '@chakra-ui/react'
import { GraduationCap, Play, BookOpen } from 'lucide-react'
import { AppLayout } from '@/components/Layout'
import { useCategories, useTrainings } from '@/hooks/useAcademy'
import { EmptyState, ErrorState } from '@/components/UI'
import { BadgeCounter } from '@/components/UI/Badges'
import { useState } from 'react'
import { Training } from '@/services/types/academy.types'

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

function TrainingCard({ training }: { training: Training }) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const progressValue = parseFloat(training.progress)
  const isCompleted = progressValue >= 100

  return (
    <>
      <Box
        bg="white"
        borderRadius="md"
        borderWidth={1}
        borderColor="#DEE6F2"
        overflow="hidden"
        cursor="pointer"
        transition="all 0.2s"
        _hover={{
          borderColor: '#1F70F1',
          shadow: '0 4px 12px rgba(31, 112, 241, 0.15)',
          transform: 'translateY(-2px)',
        }}
        onClick={onOpen}
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
          >
            <BookOpen size={16} />
          </Box>
        )}

        <AspectRatio ratio={16 / 9}>
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

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader>
            <HStack>
              <Text>{training.name}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="start" spacing={4}>
              {training.description && (
                <Box>
                  <Text fontWeight="semibold" mb={2}>
                    Descrição:
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {training.description}
                  </Text>
                </Box>
              )}

              <Box w="full">
                <Text fontWeight="semibold" mb={2}>
                  Progresso:
                </Text>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.600">
                    {progressValue.toFixed(1)}% concluído
                  </Text>
                  {isCompleted && <Badge colorScheme="green">Completo</Badge>}
                </HStack>
                <Progress
                  value={progressValue}
                  size="md"
                  borderRadius="full"
                  colorScheme={isCompleted ? 'green' : 'blue'}
                />
              </Box>

              <HStack spacing={2} flexWrap="wrap">
                <Box
                  bg="#DFEFFF"
                  px={2}
                  py={1}
                  borderRadius="4px"
                  fontSize="xs"
                  fontWeight="medium"
                  color="#131D53"
                >
                  {training.category}
                </Box>
                <Box
                  bg="#F5F5F5"
                  px={2}
                  py={1}
                  borderRadius="4px"
                  fontSize="xs"
                  fontWeight="medium"
                  color="#666666"
                >
                  ID: {training.id}
                </Box>
                {training.average_rating && (
                  <Box
                    bg="#FFF4E6"
                    px={2}
                    py={1}
                    borderRadius="4px"
                    fontSize="xs"
                    fontWeight="medium"
                    color="#B7791F"
                  >
                    ⭐ {training.average_rating}
                  </Box>
                )}
              </HStack>

              <Text fontSize="xs" color="gray.500">
                Criado em:{' '}
                {new Date(training.created_at).toLocaleString('pt-BR')}
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              as="a"
              href={training.content_url}
              target="_blank"
              rel="noopener noreferrer"
              colorScheme="blue"
              leftIcon={<Play size={16} />}
              mr={3}
            >
              {progressValue > 0 ? 'Continuar Aula' : 'Assistir Aula'}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

function ModuleSelector({
  categories,
  selectedModule,
  onSelectModule,
}: {
  categories: string[]
  selectedModule: string
  onSelectModule: (module: string) => void
}) {
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
        {categories.map((category) => (
          <Button
            key={category}
            size="sm"
            variant={selectedModule === category ? 'solid' : 'outline'}
            colorScheme="blue"
            onClick={() => onSelectModule(category)}
            flexShrink={0}
          >
            {category}
          </Button>
        ))}
      </HStack>

      <Box display={{ base: 'none', md: 'block' }}>
        <HStack spacing={2} flexWrap="wrap">
          {categories.map((category) => (
            <Button
              key={category}
              size="md"
              variant={selectedModule === category ? 'solid' : 'outline'}
              colorScheme="blue"
              onClick={() => onSelectModule(category)}
            >
              {category}
            </Button>
          ))}
        </HStack>
      </Box>
    </Box>
  )
}

export default function Academy() {
  const [selectedModule, setSelectedModule] = useState('Módulo 0')

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
                      <TrainingCard key={training.id} training={training} />
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
                      <TrainingCard key={training.id} training={training} />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </VStack>
        </PageContent>
      </AppLayout>
    </>
  )
}
