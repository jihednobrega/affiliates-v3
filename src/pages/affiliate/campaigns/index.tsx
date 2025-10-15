'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import Head from 'next/head'
import { Box, Flex, HStack, Input, Text, Skeleton } from '@chakra-ui/react'
import { Megaphone, Search } from 'lucide-react'
import { CampaignCard } from '@/components/Features/affiliate/campaigns'
import { useCampaigns } from '@/hooks/useCampaigns'
import { EmptyState, ErrorState, Pagination } from '@/components/UI'

function CampaignsLoadingSkeleton() {
  return (
    <>
      <Box
        display={{ base: 'flex', md: 'none' }}
        flexDirection="column"
        gap={3}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <Box
            key={i}
            borderRadius="md"
            bg="white"
            borderWidth={1}
            borderColor="#DEE6F2"
            maxW="100%"
            w="100%"
          >
            <Box p={3} borderBottomWidth={1} borderBottomColor="#E6E6E6">
              <Flex align="center" gap={4} mb={2}>
                <Skeleton height="24px" width="60%" />
                <Skeleton width="80px" height="20px" borderRadius="4px" />
              </Flex>
              <HStack gap={2.5} mb={2}>
                <Skeleton w="24px" h="24px" borderRadius="4px" />
                <Skeleton height="16px" width="200px" />
              </HStack>
              <Skeleton height="24px" width="120px" borderRadius="4px" />
            </Box>

            <Box p={3}>
              <Skeleton height="200px" mb={5} borderRadius="4px" />

              <Skeleton height="16px" width="180px" mb={2} />
              <HStack spacing={2}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton
                    key={j}
                    height="220px"
                    width="120px"
                    borderRadius="4px"
                  />
                ))}
              </HStack>

              <Skeleton height="32px" width="100%" borderRadius="4px" mt={2} />
            </Box>
          </Box>
        ))}
      </Box>

      <Box
        display={{ base: 'none', md: 'grid' }}
        gridTemplateColumns={{
          base: '1fr',
          md: 'repeat(auto-fill, minmax(320px, 1fr))',
        }}
        sx={{
          '@media (min-width: 700px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
          },
          '@media (min-width: 768px)': {
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          },
        }}
        gap={3}
        flex="1"
        alignContent="start"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <Box
            key={i}
            borderRadius="md"
            bg="white"
            borderWidth={1}
            borderColor="#DEE6F2"
            maxW="100%"
            w="100%"
          >
            <Box p={3} borderBottomWidth={1} borderBottomColor="#E6E6E6">
              <Flex align="center" gap={4} mb={2}>
                <Skeleton height="20px" width="60%" />
                <Skeleton width="70px" height="18px" borderRadius="4px" />
              </Flex>
              <HStack gap={2.5} mb={2}>
                <Skeleton w="20px" h="20px" borderRadius="4px" />
                <Skeleton height="14px" width="160px" />
              </HStack>
              <Skeleton height="20px" width="100px" borderRadius="4px" />
            </Box>

            <Box p={3}>
              <Skeleton height="200px" mb={4} borderRadius="4px" />

              <Skeleton height="14px" width="150px" mb={2} />
              <HStack spacing={2}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton
                    key={j}
                    height="220px"
                    width="120px"
                    borderRadius="4px"
                  />
                ))}
              </HStack>

              <Skeleton height="28px" width="100%" borderRadius="4px" mt={2} />
            </Box>
          </Box>
        ))}
      </Box>
    </>
  )
}

export default function Campaigns() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const itemsPerPage = 12

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const {
    data: campaigns,
    loading,
    error,
    retry,
    meta,
  } = useCampaigns({
    page: currentPage,
    perpage: itemsPerPage,
    name: debouncedSearchTerm || undefined,
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const clearSearch = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
  }

  const hasActiveSearch = debouncedSearchTerm.trim().length > 0

  const isInitialLoading = loading && campaigns.length === 0

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
                <HStack
                  h={10}
                  position="relative"
                  rounded={4}
                  borderWidth={1}
                  borderColor="#DEE6F2"
                  gap={0}
                  mb={2}
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
                  <Skeleton height="20px" flex={1} mx={2} />
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
                  flex={1}
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
                  <Skeleton height="16px" flex={1} mx={2} />
                </HStack>
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
                      {meta?.total_items || campaigns.length}
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
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
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
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </HStack>
            </HStack>
          </Box>
        </PageHeader>

        <PageContent>
          {loading && !isInitialLoading ? (
            <Box
              display="grid"
              gridTemplateColumns={{
                base: '1fr',
                md: 'repeat(auto-fill, minmax(320px, 1fr))',
              }}
              sx={{
                '@media (min-width: 700px)': {
                  gridTemplateColumns: 'repeat(2, 1fr)',
                },
                '@media (min-width: 768px)': {
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                },
              }}
              gap={3}
              flex="1"
              alignContent="start"
            >
              {Array.from({ length: Math.max(campaigns.length, 6) }).map(
                (_, idx) => (
                  <Box
                    key={`skeleton-${idx}`}
                    borderRadius="md"
                    bg="white"
                    borderWidth={1}
                    borderColor="#DEE6F2"
                    height="fit-content"
                    display="flex"
                    flexDirection="column"
                    minW={{ base: '220px', md: '320px' }}
                    maxW={{ base: '100%', sm: '530px' }}
                    mx={{ base: 'auto', md: 'unset' }}
                    w={{ base: '100%', sm: 'auto' }}
                  >
                    <Box
                      p={3}
                      borderBottomWidth={1}
                      borderBottomColor="#E6E6E6"
                    >
                      <Flex align="center" gap={4} mb={2}>
                        <Skeleton height="20px" width="60%" />
                        <Skeleton
                          width="70px"
                          height="18px"
                          borderRadius="4px"
                        />
                      </Flex>
                      <HStack gap={2.5} mb={2}>
                        <Skeleton w="20px" h="20px" borderRadius="4px" />
                        <Skeleton height="14px" width="160px" />
                      </HStack>
                      <Skeleton
                        height="20px"
                        width="100px"
                        borderRadius="4px"
                      />
                    </Box>

                    <Box p={3}>
                      <Skeleton height="200px" mb={4} borderRadius="4px" />

                      <Skeleton height="14px" width="150px" mb={2} />
                      <HStack spacing={2}>
                        {Array.from({ length: 4 }).map((_, j) => (
                          <Skeleton
                            key={j}
                            height="220px"
                            width="120px"
                            borderRadius="4px"
                          />
                        ))}
                      </HStack>

                      <Skeleton
                        height="28px"
                        width="100%"
                        borderRadius="4px"
                        mt={2}
                      />
                    </Box>
                  </Box>
                )
              )}
            </Box>
          ) : campaigns.length === 0 && hasActiveSearch ? (
            <EmptyState
              icon={Search}
              title="Nenhuma campanha encontrada"
              description={`Não encontramos campanhas para "${debouncedSearchTerm}". Tente ajustar o termo de busca.`}
              actionButton={{
                label: 'Limpar Busca',
                onClick: clearSearch,
                variant: 'outline',
              }}
            />
          ) : campaigns.length === 0 ? (
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
                gap={3}
              >
                {campaigns.map((campaign) => (
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
                    commission={campaign.commission}
                  />
                ))}
              </Box>

              <Box
                display={{ base: 'none', md: 'grid' }}
                gridTemplateColumns={{
                  base: '1fr',
                  md: 'repeat(auto-fill, minmax(320px, 1fr))',
                }}
                sx={{
                  '@media (min-width: 700px)': {
                    gridTemplateColumns: 'repeat(2, 1fr)',
                  },
                  '@media (min-width: 768px)': {
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(320px, 1fr))',
                  },
                }}
                gap={3}
                flex="1"
                alignContent="start"
              >
                {campaigns.map((campaign) => (
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
                    commission={campaign.commission}
                  />
                ))}
              </Box>

              {!loading &&
                campaigns.length > 0 &&
                meta &&
                meta.last_page > 1 && (
                  <Box
                    pb={4}
                    bg="white"
                    borderRadius="12px"
                    borderWidth={1}
                    borderColor="#DEE6F2"
                  >
                    <Pagination
                      currentPage={currentPage}
                      totalPages={meta.last_page || 1}
                      onPageChange={setCurrentPage}
                      isLoading={loading}
                      align={{ base: 'center', md: 'flex-end' }}
                    />
                  </Box>
                )}
            </>
          )}
        </PageContent>
      </AppLayout>
    </>
  )
}
