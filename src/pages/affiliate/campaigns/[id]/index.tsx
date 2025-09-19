'use client'

import { useMemo } from 'react'
import { useCampaignById } from '@/hooks/useCampaigns'
import { useSearch } from '@/hooks/useSearch'
import { formatPercentage } from '@/utils/formatters'
import { LoadingState, EmptyState, ErrorState } from '@/components/UI'
import {
  Box,
  Text,
  HStack,
  Button,
  Grid,
  useToast,
  Flex,
  Input,
  Badge,
  Divider,
  useDisclosure,
  Collapse,
  VStack,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import {
  ChevronRight,
  Megaphone,
  Search,
  ShoppingBasket,
  SlidersHorizontal,
  Tags,
} from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { CreativesIcon } from '@/components/Icons'
import { ShimmerBadge } from '@/components/UI/Badges'

export default function CampaignDetailsPage() {
  const router = useRouter()
  const { id } = router.query
  const toast = useToast()
  const { isOpen, onToggle } = useDisclosure()

  const {
    data: campaign,
    loading: campaignsLoading,
    error: campaignsError,
    retry,
  } = useCampaignById(id as string)

  useMemo(() => {
    if (
      !campaignsLoading &&
      campaignsError &&
      campaignsError.includes('não encontrada')
    ) {
      toast({
        title: 'Campanha não encontrada',
        description: 'A campanha solicitada não existe ou foi removida.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
      setTimeout(() => router.push('/affiliate/campaigns'), 3000)
    }
  }, [campaignsError, campaignsLoading, toast, router])

  const {
    searchTerm,
    setSearchTerm,
    filteredData: filteredProducts,
    clearSearch,
    hasActiveSearch,
  } = useSearch({
    data: campaign?.products || [],
    searchFields: ['name'],
  })

  const maxCommission = campaign?.maxCommission || 0

  if (!router.isReady || campaignsLoading) {
    return (
      <>
        <Head>
          <title>Campanha | Affiliates</title>
        </Head>
        <AppLayout>
          <PageHeader>
            <Flex gap={2} align="center">
              <Megaphone size={24} color="#131D53" />
              <Text fontSize="sm" color="#131D53">
                Carregando...
              </Text>
            </Flex>
          </PageHeader>
          <PageContent>
            <LoadingState type="skeleton" count={8} />
          </PageContent>
        </AppLayout>
      </>
    )
  }

  if (campaignsError) {
    return (
      <>
        <Head>
          <title>Erro | Affiliates</title>
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
              description="Não foi possível carregar os dados da campanha. Verifique sua conexão e tente novamente."
              onRetry={retry}
            />
          </PageContent>
        </AppLayout>
      </>
    )
  }

  if (!campaign) {
    return null
  }

  return (
    <>
      <Head>
        <title>{campaign?.title || 'Campanha'} | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Box display="flex" flexDirection="column" gap={2} w="full">
            <HStack justify="space-between" mb={1}>
              <Flex gap={2} align="center" color="#131d53">
                <Megaphone size={24} color="#131D53" />

                <Text fontSize="sm">{campaign.title}</Text>

                <HStack>
                  <ShimmerBadge
                    icon={'/assets/icons/extra-commission.svg'}
                    text="Comissões até"
                    percentage={formatPercentage(maxCommission)}
                  />
                </HStack>
              </Flex>

              <HStack>
                <Button
                  size="xs"
                  w="full"
                  px={3}
                  py={1.5}
                  gap={3}
                  rounded={4}
                  fontSize="sm"
                  fontWeight={400}
                  color="#131D53"
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  onClick={onToggle}
                >
                  Detalhes
                  <ChevronRight
                    size={16}
                    style={{
                      transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </Button>
              </HStack>
            </HStack>
            <Flex
              gap={2}
              align="center"
              justify="space-between"
              color="#131d53"
              mb={isOpen ? 0 : 3}
            >
              <HStack gap={2.5}>
                <Box>
                  <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                    <img src="/assets/icons/calendar-in-progress.svg" />
                  </div>
                </Box>
                <HStack>
                  <Text fontSize="xs" color="#131D53">
                    De: {campaign.periodStart}
                  </Text>
                  <Divider
                    orientation="vertical"
                    w={0.5}
                    h={5}
                    color="#131D5380"
                    bg="#131D5380"
                  />
                  <Text fontSize="xs" color="#131D53">
                    Até: {campaign.periodEnd}
                  </Text>
                </HStack>
              </HStack>

              <Badge
                bg="#DFEFFF"
                rounded={4}
                py={1}
                px={2}
                fontWeight={600}
                color="#1F70F1"
                lineHeight="14.4px"
              >
                Em Andamento
              </Badge>
            </Flex>

            <Collapse in={isOpen} animateOpacity>
              <VStack align="stretch" spacing={2} mt={3}>
                <Text fontSize="13px" color="#131D5399">
                  {campaign.description ||
                    'Descrição não disponível para esta campanha.'}
                </Text>

                <VStack spacing={3} align="start" mb={3}>
                  <HStack>
                    <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm">
                      <Tags size={20} color="#1F70F1" strokeWidth={1.5} />
                    </Box>
                    <Text fontSize="sm" color="#131D5399">
                      Produtos em foco{' '}
                      <Text as="span" color="#131D53">
                        {campaign.products?.[0]?.name
                          ? 'Diversos produtos'
                          : 'Em carregamento...'}
                      </Text>
                    </Text>
                  </HStack>

                  <HStack>
                    <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm">
                      <ShoppingBasket
                        size={20}
                        color="#1F70F1"
                        strokeWidth={1.5}
                      />
                    </Box>
                    <Text fontSize="sm" color="#131D5399">
                      Produtos{' '}
                      <Text as="span" color="#131D53">
                        {campaign.products.length}
                      </Text>
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </Collapse>

            <Box>
              <HStack
                h="34px"
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
                  w="34px"
                  h="34px"
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
                  h={'full'}
                  minW="fit-content"
                  _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </HStack>
            </Box>

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
                isDisabled={
                  !campaign?.creatives || campaign.creatives.length === 0
                }
                onClick={() =>
                  router.push(`/affiliate/campaigns/${id}/creatives`)
                }
              >
                <CreativesIcon boxSize={6} />
                Criativos
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
        </PageHeader>

        {/* Grid de produtos */}
        <PageContent>
          <Box mb={{ base: '60px', lg: '80px' }}>
            {/* Empty state para busca sem resultados */}
            {filteredProducts.length === 0 && hasActiveSearch ? (
              <EmptyState
                icon={Search}
                title="Nenhum produto encontrado"
                description={`Não encontramos produtos para "${searchTerm}". Tente ajustar o termo de busca.`}
                actionButton={{
                  label: 'Limpar Busca',
                  onClick: clearSearch,
                  variant: 'outline',
                }}
              />
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                icon={ShoppingBasket}
                title="Nenhum produto disponível"
                description="Esta campanha não possui produtos cadastrados no momento."
              />
            ) : (
              <Grid
                templateColumns={{
                  base: 'repeat(2, 1fr)',
                  md: 'repeat(auto-fit, minmax(270px, 1fr))',
                }}
                gap={{ base: 2, md: 3, lg: 4 }}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </Grid>
            )}
          </Box>
          <Box
            position="fixed"
            bottom={{ base: '92px', lg: 4 }}
            left={{ base: 0, lg: '240px' }}
            right={0}
            p={4}
            zIndex={15}
          >
            <Button
              w="full"
              py={1.5}
              px={3}
              gap={1.5}
              size="lg"
              rounded={8}
              fontSize="sm"
              fontWeight={600}
              color="#001589"
              bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
              shadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25), 0px 0px 0px 1px #99C7FF inset, 0px 0px 0px 2px #FFF inset"
            >
              Criar Link da Campanha
            </Button>
          </Box>
        </PageContent>
      </AppLayout>
    </>
  )
}
