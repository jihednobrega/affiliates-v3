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
import { Calendar, Search, SlidersHorizontal, Link } from 'lucide-react'
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
      minWidth={{ base: 'auto', md: '530px' }}
    >
      <Box p={3} borderBottomWidth={1} borderBottomColor="#E6E6E6">
        <Flex justify="space-between" mb={2} gap={2}>
          <Flex align="center" gap={2}>
            <Skeleton w="32px" h="32px" borderRadius="4px" />
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
              <Skeleton w="20px" h="20px" borderRadius="sm" />
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
        <HStack display={{ base: 'none', md: 'flex' }} gap={2}>
          <Skeleton height="32px" width="100px" borderRadius="md" />
          <Skeleton height="32px" width="130px" borderRadius="md" />
          <Skeleton height="32px" width="100px" borderRadius="md" />
          <Skeleton height="32px" width="80px" borderRadius="md" />
        </HStack>

        <HStack justify="space-between" display={{ base: 'flex', md: 'none' }}>
          <Skeleton height="32px" width="100px" borderRadius="md" />
          <Skeleton height="32px" width="130px" borderRadius="md" />
          <Skeleton height="32px" width="60px" borderRadius="md" />
        </HStack>
      </Box>
    </Box>
  )
}

export default function HotLinks() {
  const { isOpen, onOpen, onClose } = useDisclosure()
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
    data: linksData,
    isLoading: isLoadingLinks,
    hasError: linksError,
    refetch: retryLinks,
  } = useLinks({
    page: currentPage,
    perpage: itemsPerPage,
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

  const hotlinks = useMemo(() => {
    if (!linksData?.links || isLoadingProducts || isLoadingFinances) {
      return []
    }

    const allLinks = linksData.links

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

    return processedLinks
  }, [
    linksData,
    financesData,
    productsMap,
    isLoadingProducts,
    isLoadingFinances,
  ])

  const hasActiveSearch = debouncedSearchTerm.trim().length > 0
  const clearSearch = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
    setCurrentPage(1)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const loading = isLoadingLinks
  const isProcessingData = isLoadingFinances || isLoadingProducts
  const isInitialLoading = loading && !linksData
  const error = linksError || ((productsError as any)?.response?.status !== 500 ? productsError : null)
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
                <Button
                  rounded={4}
                  h={8}
                  fontSize="xs"
                  fontWeight={600}
                  px={3}
                  onClick={onOpen}
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
                  Criar Link
                </Button>
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
                    placeholder="Pesquise o nome do seu produto ou do link"
                    border="none"
                    flex="1"
                    minW="fit-content"
                    _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
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
            <Box
              display="grid"
              gridTemplateColumns={{
                base: '1fr',
                md: 'repeat(auto-fit, minmax(530px, 1fr))',
              }}
              gap={{ base: 2, md: 3, lg: 4 }}
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
              description="Não foi possível carregar seus links. Verifique sua conexão e tente novamente."
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
                      {linksData?.meta?.total_items || 0}
                    </Box>
                  )}
                </HStack>
              </Flex>
              <Button
                rounded={4}
                h={8}
                fontSize="xs"
                fontWeight={600}
                px={3}
                onClick={onOpen}
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
                Criar Link
              </Button>
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
                  placeholder="Pesquise o nome do seu produto ou do link"
                  border="none"
                  flex="1"
                  minW="fit-content"
                  _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
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
          <Box minH="60vh" display="flex" flexDirection="column">
            {isProcessingData ? (
              <Box
                display="grid"
                gridTemplateColumns={{
                  base: '1fr',
                  md: 'repeat(auto-fit, minmax(530px, 1fr))',
                }}
                gap={{ base: 2, md: 3, lg: 4 }}
                flex="1"
                alignContent="start"
              >
                {Array.from({ length: Math.max(hotlinks.length, 6) }).map(
                  (_, idx) => (
                    <HotlinkCardSkeleton key={`skeleton-${idx}`} />
                  )
                )}
              </Box>
            ) : /* Empty state para busca sem resultados */ hotlinks.length ===
                0 && hasActiveSearch ? (
              <Box
                flex="1"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
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
              </Box>
            ) : hotlinks.length === 0 ? (
              <Box
                flex="1"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <EmptyState
                  icon={Link}
                  title="Nenhum link criado ainda"
                  description="Crie seu primeiro link de afiliado para começar a ganhar comissões!"
                  actionButton={{
                    label: 'Criar Primeiro Link',
                    onClick: onOpen,
                    variant: 'solid',
                  }}
                />
              </Box>
            ) : (
              /* Renderiza os links filtrados em grid responsivo */
              <Box
                display="grid"
                gridTemplateColumns={{
                  base: '1fr',
                  md:
                    hotlinks.length === 1
                      ? '1fr'
                      : 'repeat(auto-fit, minmax(530px, 1fr))',
                }}
                gap={{ base: 2, md: 3, lg: 4 }}
                maxW={hotlinks.length === 1 ? '530px' : 'none'}
                flex="1"
                alignContent="start"
              >
                {hotlinks.map((link, idx) => (
                  <HotlinkCard key={link.id || idx} {...link} />
                ))}
              </Box>
            )}

            {!isProcessingData && hotlinks.length > 0 && linksData?.meta && (
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
