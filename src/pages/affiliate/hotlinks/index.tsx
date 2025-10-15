'use client'

import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import Head from 'next/head'
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Text,
  useDisclosure,
  Skeleton,
} from '@chakra-ui/react'
import { LinkEditIcon } from '@/components/Icons'
import { CreateLinkDrawer } from '@/components/Features/affiliate/links'
import { Search, Link } from 'lucide-react'
import { HotlinkCard } from '@/components/Features/affiliate/links'
import { useLinks } from '@/hooks/useLinks'
import { useFinances } from '@/hooks/useFinances'
import { useProducts } from '@/hooks/useProducts'
import { EmptyState, ErrorState, Pagination } from '@/components/UI'
import { useMemo, useState, useEffect } from 'react'
import { formatCurrency } from '@/utils/currency'
import { AppLayout } from '@/components/Layout'

type Hotlink = {
  id: string
  title: string
  price: string
  commission: string
  url: string
  externalUrl: string
  earnings: string
  clicks: string
  orders: string
  conversion: string

  imageUrl: string
}

function HotlinkCardSkeleton() {
  return (
    <Box
      borderRadius="md"
      bg="white"
      borderWidth={1}
      borderColor="#DEE6F2"
      height="fit-content"
      display="flex"
      flexDirection="column"
      minW={{ base: '220px', md: '320px' }}
      maxW="500px"
      mx={{ base: 'auto', md: 'unset' }}
    >
      <Box p={3} borderBottomWidth={1} borderBottomColor="#E6E6E6">
        <Flex justify="space-between" mb={2} gap={2}>
          <Flex align="center" gap={2}>
            <Skeleton
              w={{ base: '32px', md: '40px' }}
              h={{ base: '32px', md: '40px' }}
              borderRadius="4px"
            />
            <Skeleton height="16px" width="120px" />
          </Flex>
        </Flex>

        <HStack>
          <Skeleton height="16px" width="80px" />
          <Skeleton height="24px" width="140px" borderRadius="md" />
        </HStack>
      </Box>

      <Box p={3}>
        <Box mb={4}>
          <Skeleton height="14px" width="150px" mb={1} />
          <Skeleton height="12px" width="200px" />
        </Box>

        <Box
          display={{ base: 'none', md: 'grid' }}
          gridTemplateColumns="repeat(2, 1fr)"
          gap={2}
          mb={6}
        >
          {[1, 2, 3, 4].map((i) => (
            <HStack key={i} gap={2}>
              <Skeleton w="28px" h="28px" borderRadius="sm" />
              <Box flex={1}>
                <Skeleton height="10px" width="40px" mb={1} />
                <Skeleton height="12px" width="60px" />
              </Box>
            </HStack>
          ))}
        </Box>

        <Box
          display={{ base: 'flex', md: 'none' }}
          flexDirection="column"
          gap={2}
          mb={6}
        >
          {[1, 2, 3, 4].map((i) => (
            <HStack key={i} gap={2.5}>
              <Skeleton w="24px" h="24px" borderRadius="sm" />
              <Skeleton height="12px" width="100px" />
            </HStack>
          ))}
        </Box>
      </Box>

      <Box borderTopWidth={1} borderTopColor="#E6E6E6" p={3} mt="auto">
        <HStack
          display={{ base: 'none', md: 'flex' }}
          justify="flex-end"
          gap={2}
        >
          <Skeleton height="32px" width="100px" borderRadius="md" />
          <Skeleton height="32px" width="130px" borderRadius="md" />
          <Skeleton height="32px" width="40px" borderRadius="md" />
        </HStack>

        <HStack
          justify="flex-end"
          display={{ base: 'flex', md: 'none' }}
          gap={2}
        >
          <Skeleton height="32px" width="100px" borderRadius="md" />
          <Skeleton height="32px" width="130px" borderRadius="md" />
          <Skeleton height="32px" width="40px" borderRadius="md" />
        </HStack>
      </Box>
    </Box>
  )
}

export default function HotLinks() {
  const { isOpen, onClose } = useDisclosure()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active')
  const itemsPerPage = 12

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const {
    data: linksData,
    isLoading: isLoadingLinks,
    hasError: linksError,
    refetch: retryLinks,
  } = useLinks({
    page: currentPage,
    perpage: itemsPerPage,
    product: debouncedSearchTerm || undefined,
    view: activeTab === 'expired' ? 'bin' : undefined,
  })

  const { data: expiredLinksData, isLoading: isLoadingExpired } = useLinks({
    page: 1,
    perpage: 1,
    view: 'bin',
    product: debouncedSearchTerm || undefined,
  })

  const { data: activeLinksData, isLoading: isLoadingActive } = useLinks({
    page: 1,
    perpage: 1,

    product: debouncedSearchTerm || undefined,
  })

  const { data: financesData, isLoading: isLoadingFinances } = useFinances({
    page: 1,
    perPage: 12,
  })

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useProducts({
    page: 1,
    perpage: 12,
  })

  const productsMap = useMemo(() => {
    if (!productsData?.products) return new Map()

    const map = new Map()
    productsData.products.forEach((product) => {
      map.set(product.id, product)
    })
    return map
  }, [productsData])

  const allHotlinks = useMemo(() => {
    if (!linksData?.links || isLoadingProducts || isLoadingFinances) {
      return []
    }

    console.log('🔍 DEBUG Links:', {
      totalLinks: linksData.links.length,
      meta: linksData.meta,
      productsCount: productsData?.products?.length || 0,
      financesCount: financesData?.commissions?.length || 0,
    })

    const deletedCount = linksData.links.filter(
      (link) => link.deleted_at !== null
    ).length
    console.log('🔍 DEBUG Deleted links:', deletedCount)

    const allLinks = linksData.links

    console.log('🔍 DEBUG All links:', allLinks.length)

    const financesMap = new Map()
    const productStatsMap = new Map()

    if (financesData?.commissions) {
      financesData.commissions.forEach((commission) => {
        const productKey = commission.name.toLowerCase().trim()

        if (!financesMap.has(productKey)) {
          financesMap.set(productKey, commission)
        }

        if (!productStatsMap.has(productKey)) {
          productStatsMap.set(productKey, {
            totalEarnings: 0,
            orderCount: 0,
          })
        }

        const stats = productStatsMap.get(productKey)
        stats.totalEarnings += parseFloat(commission.commission) || 0
        stats.orderCount += 1
      })
    }

    const processedLinks = allLinks
      .map((link): Hotlink | null => {
        const productData = productsMap.get(link.product_id)

        const productKey = link.product.toLowerCase().trim()
        const financeData = financesMap.get(productKey)
        const productStats = productStatsMap.get(productKey) || {
          totalEarnings: 0,
          orderCount: 0,
        }

        const clicks = link.total_views || 0
        const orders = productStats.orderCount
        const conversionRate = clicks > 0 ? (orders / clicks) * 100 : 0

        const productPrice =
          productData?.price ||
          (financeData ? parseFloat(financeData.product_price) : 0) ||
          0
        const commissionPercentage =
          productData?.commission ||
          (financeData ? parseFloat(financeData.commission_percentage) : 0) ||
          0
        const commissionValue = (productPrice * commissionPercentage) / 100

        return {
          id: link.id.toString(),
          title: productData?.name || link.product,
          price: formatCurrency(productPrice),
          commission: formatCurrency(commissionValue),
          url: link.url,
          externalUrl: link.destination_url,
          earnings: productStats.totalEarnings.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          clicks: link.total_views.toLocaleString('pt-BR'),
          orders: orders.toString(),
          conversion: `${conversionRate.toFixed(1)}%`,

          imageUrl:
            productData?.image ||
            financeData?.image ||
            link.image ||
            '/assets/no-image.png',
        }
      })
      .filter((item): item is Hotlink => item !== null)

    console.log('🔍 DEBUG Final hotlinks:', processedLinks.length)
    return processedLinks
  }, [
    linksData,
    financesData,
    productsMap,
    isLoadingProducts,
    isLoadingFinances,
  ])

  const hotlinks = allHotlinks

  const totalActiveLinks = activeLinksData?.meta?.total_items || 0
  const totalExpiredLinks = expiredLinksData?.meta?.total_items || 0
  const totalLinks = totalActiveLinks + totalExpiredLinks

  const hasActiveSearch = debouncedSearchTerm.trim().length > 0
  const clearSearch = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
    setCurrentPage(1)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const loading = isLoadingLinks
  const isProcessingData = isLoadingFinances || isLoadingProducts
  const isInitialLoading = loading && !linksData

  const error =
    linksError ||
    (productsError?.response?.status !== 500 ? productsError : null)
  const retry = retryLinks

  if (isInitialLoading) {
    return (
      <>
        <Head>
          <title>Meus Links | Affiliates</title>
        </Head>
        <AppLayout>
          <PageHeader>
            <Box display="flex" flexDirection="column" gap={4} w="full">
              <Flex justifyContent="space-between">
                <Flex gap={2} align="center">
                  <LinkEditIcon boxSize={6} color="#131D53" />
                  <HStack fontSize="sm" color="#131D53">
                    <Text>Meus Links:</Text>
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
                    placeholder="Pesquise o nome do seu produto ou do link"
                    border="none"
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
                    placeholder="Pesquise o nome do seu produto ou do link"
                    border="none"
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
            <Box
              display="grid"
              gridTemplateColumns={{
                base: '1fr',
                md: 'repeat(auto-fit, minmax(320px, 1fr))',
              }}
              sx={{
                '@media (min-width: 700px)': {
                  gridTemplateColumns: 'repeat(2, 1fr)',
                },
                '@media (min-width: 768px)': {
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                },
              }}
              gap={3}
              flex="1"
              alignContent="start"
            >
              {Array.from({ length: 6 }).map((_, idx) => (
                <HotlinkCardSkeleton key={`skeleton-${idx}`} />
              ))}
            </Box>
          </PageContent>
        </AppLayout>
      </>
    )
  }

  if (error) {
    const isProductsError = productsError && !linksError
    const isServerError = error?.response?.status === 500

    return (
      <>
        <Head>
          <title>Erro | Affiliates</title>
        </Head>
        <AppLayout>
          <PageHeader>
            <Flex gap={2} align="center">
              <LinkEditIcon boxSize={6} color="#131D53" />
              <Text fontSize="sm" color="#131D53">
                Meus Links
              </Text>
            </Flex>
          </PageHeader>
          <PageContent>
            <ErrorState
              description={
                isProductsError && isServerError
                  ? 'Erro no servidor ao carregar produtos. Nossa equipe técnica foi notificada. Tente novamente em alguns minutos.'
                  : isProductsError
                  ? 'Não foi possível carregar informações dos produtos. Alguns dados podem estar limitados.'
                  : 'Não foi possível carregar seus links. Verifique sua conexão e tente novamente.'
              }
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
        <title>Meus Links | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Box display="flex" flexDirection="column" gap={4} w="full">
            <Flex justifyContent="space-between">
              <Flex gap={2} align="center">
                <LinkEditIcon boxSize={6} color="#131D53" />
                <HStack fontSize="sm" color="#131D53">
                  <Text>Meus Links:</Text>
                  {isInitialLoading ? (
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
                      {totalLinks}
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
                  placeholder="Pesquise o nome do seu produto ou do link"
                  border="none"
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
                  placeholder="Pesquise o nome do seu produto ou do link"
                  border="none"
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
          <Box w="full" h="32px">
            <Flex
              w="full"
              bg="#F7FAFC"
              borderRadius={6}
              border="1px solid #DEE6F2"
              overflow="hidden"
            >
              <Button
                flex={1}
                h="32px"
                py="6px"
                borderRadius={6}
                border="none"
                fontSize="sm"
                fontWeight={400}
                lineHeight="120%"
                fontFamily="Geist"
                color="#131D53"
                bg={activeTab === 'active' ? undefined : 'transparent'}
                bgGradient={
                  activeTab === 'active'
                    ? 'linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)'
                    : undefined
                }
                shadow={
                  activeTab === 'active'
                    ? '0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset'
                    : undefined
                }
                _hover={
                  activeTab === 'active'
                    ? {
                        bgGradient:
                          'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                        shadow:
                          '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                      }
                    : { bg: '#E6F3FF' }
                }
                onClick={() => setActiveTab('active')}
                transition="all 0.2s ease"
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
              >
                <Text
                  color="#131D53"
                  fontSize="sm"
                  fontWeight={400}
                  lineHeight="120%"
                  fontFamily="Geist"
                >
                  Links Ativos
                </Text>
                <Box
                  px={1.5}
                  py={0.5}
                  borderRadius="4px"
                  border="1px solid #37B24D"
                  bg="#F2FBF3"
                >
                  <Text
                    color="#49694C"
                    fontFamily="Geist"
                    fontSize="sm"
                    fontWeight={600}
                    lineHeight="16px"
                    letterSpacing="-0.15px"
                  >
                    {totalActiveLinks}
                  </Text>
                </Box>
              </Button>

              <Button
                flex={1}
                h="32px"
                py="6px"
                borderRadius={6}
                border="none"
                fontSize="sm"
                fontWeight={400}
                lineHeight="120%"
                fontFamily="Geist"
                color="#131D53"
                isDisabled={totalExpiredLinks === 0}
                bg={activeTab === 'expired' ? undefined : 'transparent'}
                bgGradient={
                  activeTab === 'expired'
                    ? 'linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)'
                    : undefined
                }
                shadow={
                  activeTab === 'expired'
                    ? '0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset'
                    : undefined
                }
                _hover={
                  activeTab === 'expired'
                    ? {
                        bgGradient:
                          'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                        shadow:
                          '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                      }
                    : { bg: '#E6F3FF' }
                }
                onClick={() => setActiveTab('expired')}
                transition="all 0.2s ease"
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
              >
                <Text
                  color="#131D53"
                  fontSize="sm"
                  fontWeight={400}
                  lineHeight="120%"
                  fontFamily="Geist"
                >
                  Expirados
                </Text>
                <Box
                  px={1.5}
                  py={0.5}
                  borderRadius="4px"
                  border="1px solid #FF7878"
                  bg="#FFEAEA"
                >
                  <Text
                    color="#620000"
                    fontFamily="Geist"
                    fontSize="14px"
                    fontWeight={600}
                    lineHeight="16px"
                    letterSpacing="-0.15px"
                  >
                    {totalExpiredLinks}
                  </Text>
                </Box>
              </Button>
            </Flex>
          </Box>

          <Box minH="60vh" display="flex" flexDirection="column">
            {isProcessingData ? (
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
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(320px, 1fr))',
                  },
                }}
                gap={3}
                flex="1"
                alignContent="start"
              >
                {Array.from({ length: Math.max(hotlinks.length, 6) }).map(
                  (_, idx) => (
                    <HotlinkCardSkeleton key={`skeleton-${idx}`} />
                  )
                )}
              </Box>
            ) : hotlinks.length === 0 && hasActiveSearch ? (
              <EmptyState
                icon={Search}
                title="Nenhum link encontrado"
                description={`Não encontramos links para "${debouncedSearchTerm}". Tente ajustar o termo de busca.`}
                actionButton={{
                  label: 'Limpar Busca',
                  onClick: clearSearch,
                  variant: 'outline',
                }}
              />
            ) : hotlinks.length === 0 ? (
              <EmptyState
                icon={Link}
                title="Nenhum link criado"
                description="Crie seu primeiro link de afiliado para começar a ganhar comissões!"
              />
            ) : (
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
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(320px, 1fr))',
                  },
                }}
                gap={3}
                flex="1"
                alignContent="start"
              >
                {hotlinks.map((link, idx) => (
                  <HotlinkCard key={link.id || idx} {...link} />
                ))}
              </Box>
            )}

            {!isProcessingData &&
              hotlinks.length > 0 &&
              linksData?.meta &&
              linksData.meta.last_page > 1 && (
                <Box
                  mt={3}
                  pb={4}
                  bg="white"
                  borderRadius="12px"
                  borderWidth={1}
                  borderColor="#DEE6F2"
                >
                  <Pagination
                    currentPage={currentPage}
                    totalPages={linksData.meta.last_page || 1}
                    onPageChange={setCurrentPage}
                    isLoading={isLoadingLinks}
                    align={{ base: 'center', md: 'flex-end' }}
                  />
                </Box>
              )}
          </Box>
        </PageContent>
      </AppLayout>
      <CreateLinkDrawer isOpen={isOpen} onClose={onClose} />
    </>
  )
}
