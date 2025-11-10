'use client'

import { useMemo, useState, useEffect } from 'react'
import { useCampaignById } from '@/hooks/useCampaigns'
import { formatPercentage, formatCurrency } from '@/utils/formatters'
import { EmptyState, ErrorState, Pagination } from '@/components/UI'
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
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
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
  Tags,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { ProductImage } from '@/components/UI'
import { CampaignsService } from '@/services/campaigns'
import { ShimmerBadge } from '@/components/UI/Badges'

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
          borderColor="#E6EEFA"
          overflow="hidden"
        >
          <Flex justify="center" align="center" h="120px" py={3}>
            <Skeleton height="100px" width="80%" />
          </Flex>

          <Box
            h="200px"
            p={2}
            shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            borderTopWidth={1}
            borderTopColor="#E6EEFA"
          >
            <Skeleton height="24px" width="100px" borderRadius="4px" mb={3} />

            <Box flex="1" mb={2} overflow="hidden">
              <Skeleton height="14px" width="100%" mb={1} />
              <Skeleton height="14px" width="80%" />
            </Box>

            <Box display={{ base: 'block', md: 'none' }} mb={3}>
              <Skeleton height="16px" width="80px" mb={2} />
              <Skeleton height="20px" width="120px" borderRadius="4px" />
            </Box>

            <Box display={{ base: 'none', md: 'flex' }} gap={2} mb={3}>
              <Box flex={1}>
                <Skeleton height="16px" width="80px" mb={1} />
                <Skeleton height="20px" width="100%" borderRadius="4px" />
              </Box>
            </Box>

            <Skeleton height="32px" width="100%" borderRadius="6px" />
          </Box>
        </Box>
      ))}
    </Grid>
  )
}

interface BrandProductCardProps {
  product: {
    id: number
    name: string
    image: string
    price: number
    commissionPercentage: number
    link: string
  }
}

function BrandProductCard({ product }: BrandProductCardProps) {
  const handleViewProduct = () => {
    if (product.link) {
      window.open(product.link, '_blank', 'noopener,noreferrer')
    }
  }

  const calculateEarnings = (
    price: number,
    commissionPercentage: number
  ): number => {
    return (price * commissionPercentage) / 100
  }

  return (
    <Box
      bg="white"
      borderWidth={1}
      borderColor="#E6EEFA"
      borderRadius="md"
      overflow="hidden"
    >
      <Flex justify="center" align="center" h="120px" py={3}>
        <ProductImage
          src={product.image}
          alt={product.name}
          maxHeight="100%"
          width="auto"
          objectFit="contain"
        />
      </Flex>

      <Box
        h="200px"
        p={2}
        shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        borderTopWidth={1}
        borderTopColor="#E6EEFA"
      >
        <ShimmerBadge
          icon="/assets/icons/extra-commission.svg"
          percentage={formatPercentage(product.commissionPercentage)}
          className="mb-3"
        />

        <Box flex="1" mb={2} overflow="hidden">
          <Text
            fontSize="xs"
            color="#131D5399"
            noOfLines={2}
            lineHeight="1.3"
            display="-webkit-box"
            overflow="hidden"
            textOverflow="ellipsis"
            sx={{
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {product.name || 'Produto sem nome'}
          </Text>
        </Box>

        <Box display={{ base: 'block', md: 'none' }} mb={3}>
          <Text fontSize="sm" color="#131D53" mb={2} fontWeight={500}>
            {formatCurrency(product.price)}
          </Text>
          <Badge
            colorScheme="green"
            bg="#9FFF854D"
            color="#104C00"
            fontSize="xs"
            fontWeight="regular"
            px={2}
            py={1.5}
            borderRadius="md"
            display="flex"
            gap={1}
            lineHeight="14.4px"
            textTransform="none"
            maxW="fit-content"
          >
            Aprox.{' '}
            <Text fontWeight={600}>
              {formatCurrency(
                calculateEarnings(product.price, product.commissionPercentage)
              )}
            </Text>
          </Badge>
        </Box>

        <Flex
          display={{ base: 'none', md: 'flex' }}
          align="center"
          mb={3}
          gap={2}
        >
          <Text fontSize="sm" color="#131D53" fontWeight={500} flexShrink={0}>
            {formatCurrency(product.price)}
          </Text>
          <Badge
            colorScheme="green"
            bg="#9FFF854D"
            color="#104C00"
            fontSize="xs"
            fontWeight="regular"
            px={2}
            py={1.5}
            borderRadius="md"
            display="flex"
            gap={1}
            lineHeight="14.4px"
            textTransform="none"
            flexShrink={0}
          >
            Aprox.{' '}
            <Text fontWeight={600}>
              {formatCurrency(
                calculateEarnings(product.price, product.commissionPercentage)
              )}
            </Text>
          </Badge>
        </Flex>

        <Button
          w="full"
          maxH={7}
          px={3}
          py={1.5}
          size="sm"
          fontSize="xs"
          borderRadius="md"
          color="#131D53"
          bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
          shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
          _hover={{
            bgGradient:
              'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
            shadow: '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
          }}
          _active={{
            bgGradient:
              'linear-gradient(180deg, #c5ddff 47.86%, #99c7ff 123.81%)',
          }}
          transition="all 0.2s ease"
          onClick={handleViewProduct}
          isDisabled={!product.link}
          leftIcon={<ExternalLink size={16} />}
        >
          Ver Produto
        </Button>
      </Box>
    </Box>
  )
}

export default function BrandCampaignDetailsPage() {
  const router = useRouter()
  const { id } = router.query
  const toast = useToast()
  const { isOpen, onToggle } = useDisclosure()
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure()

  const campaignsService = new CampaignsService()

  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const itemsPerPage = 12

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm])

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
      setTimeout(() => router.push('/brand/campaigns'), 3000)
    }
  }, [campaignsError, campaignsLoading, toast, router])

  const { filteredProducts, totalPages, hasActiveSearch } = useMemo(() => {
    const allProducts = campaign?.products || []

    const filtered = debouncedSearchTerm.trim()
      ? allProducts.filter((product) =>
          product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
      : allProducts

    const total = Math.ceil(filtered.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginated = filtered.slice(startIndex, endIndex)

    return {
      filteredProducts: paginated,
      totalPages: total,
      hasActiveSearch: debouncedSearchTerm.trim().length > 0,
      totalItems: filtered.length,
    }
  }, [campaign?.products, debouncedSearchTerm, currentPage, itemsPerPage])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const clearSearch = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
  }

  const handleEditCampaign = () => {
    if (id) {
      router.push(`/brand/campaigns/${id}/edit`)
    }
  }

  const handleDeleteCampaign = async () => {
    try {
      setIsDeleting(true)
      const result = await campaignsService.removeCampaign({ id: Number(id) })

      if (result.response?.success) {
        toast({
          title: 'Campanha deletada!',
          description: 'A campanha foi removida com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

        onDeleteModalClose()
        router.push('/brand/campaigns')
      } else {
        throw new Error(result.response?.message || 'Erro ao deletar campanha')
      }
    } catch (error: any) {
      console.error('❌ Erro ao deletar campanha:', error)
      toast({
        title: 'Erro ao deletar',
        description: error.message || 'Não foi possível deletar a campanha.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const campaignCommission = useMemo(() => {
    if (!campaign?.commission) return 0
    const commission =
      typeof campaign.commission === 'string'
        ? parseFloat(campaign.commission)
        : campaign.commission
    return isNaN(commission) ? 0 : commission
  }, [campaign?.commission])

  if (!router.isReady || campaignsLoading) {
    return (
      <>
        <Head>
          <title>Campanha | Affiliates</title>
        </Head>
        <AppLayout>
          <PageHeader>
            <Box display="flex" flexDirection="column" gap={2} w="full">
              <Flex justify="space-between" align="center" gap={2}>
                <Flex gap={2} align="center" flex="1" minW={0}>
                  <Skeleton height="24px" width="24px" borderRadius="4px" />
                  <Skeleton height="16px" width="200px" />
                  <Skeleton height="24px" width="120px" borderRadius="4px" />
                </Flex>
                <HStack>
                  <Skeleton height="32px" width="80px" borderRadius="4px" />
                  <Skeleton height="32px" width="90px" borderRadius="4px" />
                  <Skeleton height="32px" width="100px" borderRadius="4px" />
                </HStack>
              </Flex>

              <Flex gap={2} align="center" justify="space-between">
                <HStack gap={2.5}>
                  <Skeleton height="24px" width="24px" borderRadius="4px" />
                  <Skeleton height="14px" width="250px" />
                </HStack>
                <Skeleton height="28px" width="100px" borderRadius="4px" />
              </Flex>

              <Flex gap={2} align="center">
                <Skeleton height="34px" flex="1" borderRadius="4px" />
                <Skeleton height="32px" width="90px" borderRadius="6px" />
              </Flex>
            </Box>
          </PageHeader>
          <PageContent>
            <Box mb={{ base: '60px', lg: '80px' }}>
              <ProductsLoadingSkeleton />
            </Box>
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
            <Flex justify="space-between" align="center" gap={2} mb={1}>
              <Flex gap={2} align="center" color="#131d53" flex="1" minW={0}>
                <Box flexShrink={0}>
                  <Megaphone size={24} color="#131D53" />
                </Box>
                <Text fontSize="sm" noOfLines={1}>
                  {campaign.title}
                </Text>
                <Box flexShrink={0}>
                  <ShimmerBadge
                    icon={'/assets/icons/extra-commission.svg'}
                    text="Comissões de"
                    percentage={formatPercentage(campaignCommission)}
                  />
                </Box>
              </Flex>

              <HStack flexShrink={0}>
                <Button
                  size="xs"
                  px={3}
                  py={1.5}
                  gap={0}
                  rounded={4}
                  fontSize="sm"
                  fontWeight={400}
                  color="#131D53"
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  onClick={onToggle}
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                  }}
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
            </Flex>

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
                    <img
                      src="/assets/icons/calendar-in-progress.svg"
                      alt="Calendário"
                    />
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

            <Flex gap={2} align="center">
              <HStack
                h="34px"
                position="relative"
                rounded={4}
                borderWidth={1}
                borderColor="#DEE6F2"
                gap={0}
                flex={1}
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
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </HStack>

              <HStack flexShrink={0}>
                <Button
                  size="sm"
                  px={3}
                  py={1.5}
                  rounded={4}
                  fontSize="sm"
                  fontWeight={400}
                  color="#131D53"
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  leftIcon={<Edit2 size={16} />}
                  onClick={handleEditCampaign}
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                  }}
                >
                  Editar
                </Button>

                <Button
                  size="sm"
                  px={3}
                  py={1.5}
                  rounded={4}
                  fontSize="sm"
                  fontWeight={400}
                  color="red.500"
                  bg="white"
                  border="1px solid #DEE6F2"
                  leftIcon={<Trash2 size={16} />}
                  onClick={onDeleteModalOpen}
                  _hover={{
                    bg: '#FEE',
                    border: '1px solid #feb2b2',
                  }}
                >
                  Deletar
                </Button>
              </HStack>
            </Flex>
          </Box>
        </PageHeader>

        <PageContent>
          <Box>
            {filteredProducts.length === 0 && hasActiveSearch ? (
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
                  md: 'repeat(auto-fill, minmax(270px, 1fr))',
                }}
                gap={3}
              >
                {filteredProducts.map((product) => (
                  <BrandProductCard key={product.id} product={product} />
                ))}
              </Grid>
            )}

            {!campaignsLoading &&
              filteredProducts.length > 0 &&
              totalPages > 1 && (
                <Box
                  mt={6}
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
                    isLoading={false}
                    align={{ base: 'center', md: 'flex-end' }}
                  />
                </Box>
              )}
          </Box>
        </PageContent>

        <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              fontSize="md"
              fontWeight="600"
              color="#131D53"
              borderBottom="1px solid #DEE6F2"
            >
              Deletar Campanha
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={6}>
              <Text fontSize="sm" color="#131D53">
                Tem certeza que deseja deletar a campanha{' '}
                <strong>"{campaign.title}"</strong>? Esta ação não pode ser
                desfeita.
              </Text>
            </ModalBody>
            <ModalFooter gap={3}>
              <Button
                variant="ghost"
                onClick={onDeleteModalClose}
                fontSize="sm"
                color="#131D53"
                _hover={{ bg: '#F7FAFC' }}
                isDisabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteCampaign}
                fontSize="sm"
                color="#fff"
                bg="#E53E3E"
                _hover={{
                  bg: '#C53030',
                }}
                isLoading={isDeleting}
                loadingText="Deletando..."
              >
                Deletar Campanha
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </AppLayout>
    </>
  )
}
