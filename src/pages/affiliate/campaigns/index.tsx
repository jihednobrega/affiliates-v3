'use client'

import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import Head from 'next/head'
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Text,
  Skeleton,
  VStack,
} from '@chakra-ui/react'
import { Calendar, Megaphone, Search, SlidersHorizontal } from 'lucide-react'
import { CampaignCard } from '@/components/Features/affiliate/campaigns'
import { useCampaigns } from '@/hooks/useCampaigns'
import { useSearch } from '@/hooks/useSearch'
import { EmptyState, ErrorState } from '@/components/UI'

function CampaignsLoadingSkeleton() {
  return (
    <>
      <VStack spacing={5} display={{ base: 'flex', md: 'none' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Box
            key={i}
            w="full"
            bg="white"
            borderRadius="xl"
            borderWidth={1}
            borderColor="#DEE6F2"
            overflow="hidden"
            className="container-shadow"
          >
            <Box p={4}>
              <HStack justify="space-between" align="start" mb={3}>
                <VStack align="start" spacing={1} flex={1}>
                  <Skeleton height="20px" width="80%" />
                  <Skeleton height="14px" width="60%" />
                </VStack>
                <Skeleton width="60px" height="24px" borderRadius="6px" />
              </HStack>
            </Box>

            <Skeleton height="200px" />

            <Box p={4}>
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Skeleton height="12px" width="80px" />
                  <Skeleton height="16px" width="100px" />
                </VStack>
                <Skeleton height="32px" width="120px" borderRadius="6px" />
              </HStack>
            </Box>
          </Box>
        ))}
      </VStack>

      <Box
        display={{ base: 'none', md: 'grid' }}
        gridTemplateColumns={{
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        }}
        gap={4}
        maxW="100%"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Box
            key={i}
            bg="white"
            borderRadius="xl"
            borderWidth={1}
            borderColor="#DEE6F2"
            overflow="hidden"
            className="container-shadow"
          >
            <Box p={4}>
              <HStack justify="space-between" align="start" mb={3}>
                <VStack align="start" spacing={1} flex={1}>
                  <Skeleton height="18px" width="80%" />
                  <Skeleton height="14px" width="60%" />
                </VStack>
                <Skeleton width="50px" height="20px" borderRadius="6px" />
              </HStack>
            </Box>

            <Skeleton height="160px" />

            <Box p={4}>
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Skeleton height="12px" width="60px" />
                  <Skeleton height="14px" width="80px" />
                </VStack>
                <Skeleton height="28px" width="100px" borderRadius="6px" />
              </HStack>
            </Box>
          </Box>
        ))}
      </Box>
    </>
  )
}

export default function Campaigns() {
  const { data: campaigns, loading, error, retry } = useCampaigns()

  const {
    searchTerm,
    setSearchTerm,
    filteredData,
    clearSearch,
    hasActiveSearch,
  } = useSearch({
    data: campaigns,
    searchFields: ['title'],
  })

  const isInitialLoading = loading && campaigns.length === 0

  const formatDate = (dateString: string) => {
    if (dateString.includes('/')) {
      return dateString
    }

    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (isInitialLoading) {
    return (
      <>
        <Head>
          <title>Campanhas | Affiliates</title>
        </Head>
        <AppLayout>
          <PageHeader>
            <Box display="flex" flexDirection="column" gap={2} w="full">
              <Flex justifyContent="space-between">
                <Flex gap={2} align="center">
                  <Megaphone size={24} color="#131D53" />
                  <HStack fontSize="sm" color="#131D53">
                    <Text>Campanhas:</Text>
                    <Skeleton height="24px" width="40px" borderRadius="4px" />
                  </HStack>
                </Flex>
              </Flex>

              <Box display={{ base: 'block', md: 'none' }}>
                <Skeleton height="40px" borderRadius="4px" mb={2} />
                <HStack gap={2}>
                  <Skeleton height="32px" flex={1} borderRadius="4px" />
                  <Skeleton height="32px" flex={1} borderRadius="4px" />
                </HStack>
              </Box>

              <HStack display={{ base: 'none', md: 'flex' }} gap={3}>
                <Skeleton height="32px" flex={1} borderRadius="4px" />
                <Skeleton height="32px" width="140px" borderRadius="4px" />
                <Skeleton height="32px" width="80px" borderRadius="4px" />
              </HStack>
            </Box>
          </PageHeader>
          <PageContent>
            <CampaignsLoadingSkeleton />
          </PageContent>
        </AppLayout>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Campanhas | Affiliates</title>
        </Head>
        <AppLayout>
          <PageHeader>
            <Flex gap={2} align="center">
              <Megaphone size={24} color="#131D53" />
              <Text fontSize="sm" color="#131D53">
                Campanhas
              </Text>
            </Flex>
          </PageHeader>
          <PageContent>
            <ErrorState
              description="Não foi possível carregar as campanhas. Verifique sua conexão e tente novamente."
              onRetry={retry}
            />
          </PageContent>
        </AppLayout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Campanhas | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Box display="flex" flexDirection="column" gap={4} w="full">
            <Flex justifyContent="space-between">
              <Flex gap={2} align="center">
                <Megaphone size={24} color="#131D53" />
                <HStack fontSize="sm" color="#131D53">
                  <Text>Campanhas:</Text>
                  {loading ? (
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
                      {hasActiveSearch ? filteredData.length : campaigns.length}
                    </Box>
                  )}
                </HStack>
              </Flex>
            </Flex>

            <Box display={{ base: 'block', md: 'none' }}>
              <HStack
                h={10}
                position="relative"
                rounded={4}
                borderWidth={1}
                borderColor="#DEE6F2"
                gap={0}
                transition="all 0.2s"
                mb={2}
                _focusWithin={{
                  borderColor: '#1F70F1',
                  boxShadow: '0 0 0 1px #1F70F1',
                  bg: 'white',
                }}
              >
                <HStack
                  justify="center"
                  p={2}
                  w="38px"
                  h="38px"
                  borderRightWidth={1}
                  borderRightColor="#dee6f2"
                >
                  <Search color="#C5CDDC" size={20} />
                </HStack>
                <Input
                  p={2}
                  variant="unstyled"
                  placeholder="Pesquisar campanhas"
                  flex="1"
                  minW="fit-content"
                  _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </HStack>
              <HStack gap={2} justify="space-between">
                <Button
                  rounded={4}
                  size="sm"
                  fontSize="xs"
                  fontWeight={500}
                  px={3}
                  py={1.5}
                  w="full"
                  gap={1.5}
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  color="#131D53"
                >
                  <Calendar size={16} />
                  Filtrar por Data
                </Button>
                <Button
                  rounded={4}
                  size="sm"
                  fontSize="xs"
                  fontWeight={500}
                  px={3}
                  py={1.5}
                  w="full"
                  gap={1.5}
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  color="#131D53"
                >
                  <SlidersHorizontal size={16} />
                  Filtrar
                </Button>
              </HStack>
            </Box>

            <HStack
              display={{ base: 'none', md: 'flex' }}
              gap={3}
              align="center"
            >
              <HStack
                h={8}
                position="relative"
                rounded={4}
                borderWidth={1}
                borderColor="#DEE6F2"
                gap={0}
                transition="all 0.2s"
                flex={1}
                _focusWithin={{
                  borderColor: '#1F70F1',
                  boxShadow: '0 0 0 1px #1F70F1',
                  bg: 'white',
                }}
              >
                <HStack
                  justify="center"
                  p={2}
                  w="32px"
                  h="32px"
                  borderRightWidth={1}
                  borderRightColor="#dee6f2"
                >
                  <Search color="#C5CDDC" size={16} />
                </HStack>
                <Input
                  py={1}
                  px={2}
                  variant="unstyled"
                  placeholder="Pesquisar campanhas"
                  flex="1"
                  minW="fit-content"
                  _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </HStack>
              <Button
                rounded={4}
                size="sm"
                fontSize="xs"
                fontWeight={500}
                px={3}
                py={1.5}
                gap={1.5}
                bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                color="#131D53"
                flexShrink={0}
              >
                <Calendar size={16} />
                Filtrar por Data
              </Button>
              <Button
                rounded={4}
                size="sm"
                fontSize="xs"
                fontWeight={500}
                px={3}
                py={1.5}
                gap={1.5}
                bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                color="#131D53"
                flexShrink={0}
              >
                <SlidersHorizontal size={16} />
                Filtrar
              </Button>
            </HStack>
          </Box>
        </PageHeader>

        <PageContent>
          {loading && !isInitialLoading ? (
            <CampaignsLoadingSkeleton />
          ) : filteredData.length === 0 && hasActiveSearch ? (
            <EmptyState
              icon={Search}
              title="Nenhuma campanha encontrada"
              description={`Não encontramos campanhas para "${searchTerm}". Tente ajustar o termo de busca.`}
              actionButton={{
                label: 'Limpar Busca',
                onClick: clearSearch,
                variant: 'outline',
              }}
            />
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="Nenhuma campanha disponível"
              description="Novas campanhas aparecerão aqui quando forem disponibilizadas. Acompanhe regularmente para não perder oportunidades!"
            />
          ) : (
            <>
              <Box
                display={{ base: 'flex', md: 'none' }}
                flexDirection="column"
                gap={5}
              >
                {filteredData.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    id={campaign.id}
                    title={campaign.title}
                    periodStart={campaign.periodStart}
                    periodEnd={campaign.periodEnd}
                    imageUrl={campaign.imageUrl}
                    products={campaign.products}
                    creatives={campaign.creatives || []}
                    status={campaign.status || 'active'}
                    maxCommission={campaign.maxCommission}
                  />
                ))}
              </Box>

              <Box
                display={{ base: 'none', md: 'grid' }}
                gridTemplateColumns={{
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                }}
                gap={4}
                maxW="100%"
              >
                {filteredData.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    id={campaign.id}
                    title={campaign.title}
                    periodStart={campaign.periodStart}
                    periodEnd={campaign.periodEnd}
                    imageUrl={campaign.imageUrl}
                    products={campaign.products}
                    creatives={campaign.creatives || []}
                    status={campaign.status || 'active'}
                    maxCommission={campaign.maxCommission}
                  />
                ))}
              </Box>
            </>
          )}
        </PageContent>
      </AppLayout>
    </>
  )
}
