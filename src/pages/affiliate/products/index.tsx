'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { EmptyState, ErrorState, Pagination } from '@/components/UI'
import {
  Box,
  Text,
  HStack,
  Grid,
  Flex,
  Input,
  Skeleton,
  Button,
} from '@chakra-ui/react'
import Head from 'next/head'
import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import { Search, PackageSearch } from 'lucide-react'
import { ProductCard } from '@/components/UI/ProductCard'

function ProductsLoadingSkeleton() {
  return (
    <Grid
      templateColumns={{
        base: 'repeat(2, 1fr)',
        md: 'repeat(auto-fill, minmax(270px, 1fr))',
      }}
      gap={3}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <Box
          key={i}
          bg="white"
          borderRadius="md"
          borderWidth={1}
          borderColor="#DEE6F2"
          overflow="hidden"
          h="fit-content"
        >
          <Box p={3}>
            <HStack justify="space-between" mb={2}>
              <Skeleton height="16px" width="60%" />
              <Skeleton height="20px" width="60px" borderRadius="4px" />
            </HStack>
            <Skeleton height="14px" width="80%" mb={3} />
          </Box>

          <Skeleton height="200px" />

          <Box p={3}>
            <Skeleton height="14px" width="40%" mb={2} />
            <Skeleton height="20px" width="70%" mb={3} />
            <Skeleton height="32px" width="100%" borderRadius="6px" />
          </Box>
        </Box>
      ))}
    </Grid>
  )
}

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'featured' | 'all'>('featured')
  const itemsPerPage = 12

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, activeTab])

  const {
    data: allProductsData,
    isLoading: isLoadingAllProducts,
    hasError: allProductsError,
    refetch: refetchAllProducts,
  } = useProducts({
    page: currentPage,
    perpage: itemsPerPage,
    product: debouncedSearchTerm.trim() || undefined,
  })

  const {
    data: featuredProductsData,
    isLoading: isLoadingFeaturedProducts,
    hasError: featuredProductsError,
    refetch: refetchFeaturedProducts,
  } = useProducts({
    page: currentPage,
    perpage: itemsPerPage,
    product: debouncedSearchTerm.trim() || undefined,
    featured: 'true',
    orderBy: 'random',
  })

  const {
    totalPages,
    hasActiveSearch,
    totalItems,
    totalFeaturedItems,
    featuredProducts,
    allProducts,
  } = useMemo(() => {
    const allProductsList = allProductsData?.products || []
    const featuredProductsList = featuredProductsData?.products || []
    const meta =
      activeTab === 'featured'
        ? featuredProductsData?.meta
        : allProductsData?.meta

    return {
      featuredProducts: featuredProductsList,
      allProducts: allProductsList,
      totalPages: meta?.last_page || 1,
      hasActiveSearch: debouncedSearchTerm.trim().length > 0,
      totalItems: allProductsData?.meta?.total_items || 0,
      totalFeaturedItems: featuredProductsData?.meta?.total_items || 0,
    }
  }, [allProductsData, featuredProductsData, debouncedSearchTerm, activeTab])

  const displayProducts = useMemo(() => {
    return activeTab === 'featured' ? featuredProducts : allProducts
  }, [activeTab, featuredProducts, allProducts])

  useEffect(() => {
    if (
      !isLoadingFeaturedProducts &&
      featuredProductsData &&
      totalFeaturedItems === 0 &&
      activeTab === 'featured' &&
      !isLoadingAllProducts
    ) {
      setActiveTab('all')
    }
  }, [
    isLoadingFeaturedProducts,
    featuredProductsData,
    totalFeaturedItems,
    isLoadingAllProducts,
  ])

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
  }, [])

  const productsLoading =
    activeTab === 'featured' ? isLoadingFeaturedProducts : isLoadingAllProducts

  const productsError =
    activeTab === 'featured' ? featuredProductsError : allProductsError

  const refetch =
    activeTab === 'featured' ? refetchFeaturedProducts : refetchAllProducts

  const productsData =
    activeTab === 'featured' ? featuredProductsData : allProductsData

  const isInitialLoading = productsLoading && !productsData

  const pageHeaderContent = useMemo(
    () => (
      <PageHeader>
        <Box display="flex" flexDirection="column" gap={2} w="full">
          <Flex gap={2} align="center" color="#131d53" mb={1}>
            <PackageSearch size={24} color="#131D53" />
            <HStack fontSize="sm" color="#131D53">
              <Text>Produtos:</Text>
              {isLoadingAllProducts ? (
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
                  {totalItems}
                </Box>
              )}
            </HStack>
          </Flex>

          <Box>
            <HStack
              h={{ base: '40px', md: '34px' }}
              position="relative"
              rounded={4}
              borderWidth={1}
              borderColor="#DEE6F2"
              gap={0}
              transition="all 0.2s"
              _focusWithin={{
                borderColor: '#1F70F1',
                boxShadow: '0 0 0 1px #1F70F1',
                bg: 'white',
              }}
            >
              <HStack
                justify="center"
                p={2}
                w={{ base: '40px', md: '34px' }}
                h={{ base: '40px', md: '34px' }}
                borderRightWidth={1}
                borderRightColor="#dee6f2"
              >
                <Search color="#C5CDDC" size={20} />
              </HStack>
              <Input
                p={2}
                variant="unstyled"
                placeholder="Pesquisar produto"
                border="none"
                flex="1"
                h="full"
                minW="fit-content"
                _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </HStack>
          </Box>
        </Box>
      </PageHeader>
    ),
    [searchTerm, handleSearchChange, isLoadingAllProducts, totalItems]
  )

  if (isInitialLoading) {
    return (
      <>
        <Head>
          <title>Produtos | Affiliates</title>
        </Head>
        <AppLayout>
          {pageHeaderContent}
          <PageContent>
            <Box mb={{ base: '60px', lg: '80px' }}>
              <ProductsLoadingSkeleton />
            </Box>
          </PageContent>
        </AppLayout>
      </>
    )
  }

  if (productsError) {
    return (
      <>
        <Head>
          <title>Erro | Affiliates</title>
        </Head>
        <AppLayout>
          {pageHeaderContent}
          <PageContent>
            <ErrorState
              description="Não foi possível carregar os produtos. Verifique sua conexão e tente novamente."
              onRetry={refetch}
            />
          </PageContent>
        </AppLayout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Produtos | Affiliates</title>
      </Head>
      <AppLayout>
        {pageHeaderContent}

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
                bg={activeTab === 'featured' ? undefined : 'transparent'}
                bgGradient={
                  activeTab === 'featured'
                    ? 'linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)'
                    : undefined
                }
                shadow={
                  activeTab === 'featured'
                    ? '0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset'
                    : undefined
                }
                _hover={
                  activeTab === 'featured'
                    ? {
                        bgGradient:
                          'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                        shadow:
                          '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                      }
                    : { bg: '#E6F3FF' }
                }
                onClick={() => setActiveTab('featured')}
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
                  Em Destaque
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
                    {totalFeaturedItems}
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
                bg={activeTab === 'all' ? undefined : 'transparent'}
                bgGradient={
                  activeTab === 'all'
                    ? 'linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)'
                    : undefined
                }
                shadow={
                  activeTab === 'all'
                    ? '0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset'
                    : undefined
                }
                _hover={
                  activeTab === 'all'
                    ? {
                        bgGradient:
                          'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                        shadow:
                          '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                      }
                    : { bg: '#E6F3FF' }
                }
                onClick={() => setActiveTab('all')}
                transition="all 0.2s ease"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  color="#131D53"
                  fontSize="sm"
                  fontWeight={400}
                  lineHeight="120%"
                  fontFamily="Geist"
                >
                  Ver Todos
                </Text>
              </Button>
            </Flex>
          </Box>

          <Box>
            {productsLoading ? (
              <ProductsLoadingSkeleton />
            ) : displayProducts.length === 0 && hasActiveSearch ? (
              <EmptyState
                icon={Search}
                title="Nenhum produto encontrado"
                description={`Não encontramos produtos para "${debouncedSearchTerm}". Tente ajustar o termo de busca.`}
                actionButton={{
                  label: 'Limpar Busca',
                  onClick: clearSearch,
                  variant: 'outline',
                }}
              />
            ) : displayProducts.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title={
                  activeTab === 'featured'
                    ? 'Nenhum produto em destaque'
                    : 'Nenhum produto disponível'
                }
                description={
                  activeTab === 'featured'
                    ? 'A marca ainda não destacou nenhum produto. Enquanto isso, você pode criar links para qualquer produto da aba "Ver Todos".'
                    : 'Não há produtos cadastrados no momento.'
                }
              />
            ) : (
              <Grid
                templateColumns={{
                  base: 'repeat(2, 1fr)',
                  md: 'repeat(auto-fill, minmax(270px, 1fr))',
                }}
                gap={3}
              >
                {displayProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      name: product.name,
                      image: product.image,
                      price: product.price,
                      commissionPercentage: product.commission,
                      link: product.short_url || product.utm_url || '',
                    }}
                  />
                ))}
              </Grid>
            )}

            {!productsLoading &&
              displayProducts.length > 0 &&
              totalPages > 1 && (
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
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    isLoading={productsLoading}
                    align={{ base: 'center', md: 'flex-end' }}
                  />
                </Box>
              )}
          </Box>
        </PageContent>
      </AppLayout>
    </>
  )
}
