'use client'

import { useState, useMemo } from 'react'
import {
  Box,
  Text,
  VStack,
  Spinner,
  Image,
  Flex,
  HStack,
  Badge,
  Link,
  Button,
  Grid,
  Stack,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import { LinkIcon } from '@/components/Icons'
import { Check, Copy, Share2, Trash2 } from 'lucide-react'
import {
  ShareModal,
  SharedSuccessModal,
} from '@/components/Features/affiliate/links'
import { OrderChart } from '@/components/Features/affiliate/dashboard/Orders/OrderChart'
import { AppLayout } from '@/components/Layout'
import { useLinkById } from '@/hooks/useLinks'
import { formatCurrency } from '@/utils/currency'
import { useFinances } from '@/hooks/useFinances'
import { useProducts } from '@/hooks/useProducts'
import { ProductImage } from '@/components/UI'

export default function LinkDetailsPage() {
  const router = useRouter()
  const { id } = router.query
  const [copied, setCopied] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const {
    data: linkData,
    isLoading,
    error,
  } = useLinkById(Array.isArray(id) ? id[0] : id)

  const { data: financesData, isLoading: isLoadingFinances } = useFinances({
    page: 1,
    perPage: 12,
  })

  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
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

  const enrichedLink = useMemo(() => {
    if (!linkData?.response?.data || isLoadingProducts || isLoadingFinances) {
      return null
    }

    const link = linkData.response.data

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

    const productData = productsMap.get(link.product_id)
    const productKey = link.product.toLowerCase().trim()
    const financeData = financesMap.get(productKey)
    const productStats = productStatsMap.get(productKey) || {
      totalEarnings: 0,
      orderCount: 0,
    }

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
      ...link,
      enrichedData: {
        productPrice,
        commissionPercentage,
        commissionValue,
        productStats,
        productData,
      },
    }
  }, [
    linkData,
    financesData,
    productsMap,
    isLoadingProducts,
    isLoadingFinances,
  ])

  if (isLoading || isLoadingFinances || isLoadingProducts) {
    return (
      <>
        <Head>
          <title>Carregando Link | Affiliates</title>
        </Head>
        <AppLayout>
          <PageHeader>
            <Flex gap={2} align="center" color="#131d53">
              <LinkIcon boxSize={6} />
              <Text fontSize="sm">Carregando...</Text>
            </Flex>
          </PageHeader>
          <PageContent>
            <Box p={10} textAlign="center">
              <Spinner size="lg" />
              <Text mt={4}>Carregando detalhes do link...</Text>
            </Box>
          </PageContent>
        </AppLayout>
      </>
    )
  }

  if (error || !linkData?.response?.success) {
    return (
      <>
        <Head>
          <title>Link não encontrado | Affiliates</title>
        </Head>
        <AppLayout>
          <PageHeader>
            <Flex gap={2} align="center" color="#131d53">
              <LinkIcon boxSize={6} />
              <Text fontSize="sm">Link não encontrado</Text>
            </Flex>
          </PageHeader>
          <PageContent>
            <Box p={10} textAlign="center">
              <Text>
                Link não encontrado ou você não tem permissão para visualizá-lo.
              </Text>
              <Button mt={4} onClick={() => router.push('/affiliate/hotlinks')}>
                Voltar para Meus Links
              </Button>
            </Box>
          </PageContent>
        </AppLayout>
      </>
    )
  }

  const link = enrichedLink

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch (err) {
      console.error('Erro ao copiar o link:', err)
    }
  }

  function handleShareSuccess() {
    setIsShareOpen(false)
    setTimeout(() => {
      setIsSuccessModalOpen(true)
    }, 500)
  }

  return (
    <>
      <Head>
        <title>{link.name || 'Detalhes do Link'} | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Flex gap={2} align="center" color="#131d53">
            <LinkIcon boxSize={6} />
            <Text fontSize="sm">{link.product || 'Produto'}</Text>
          </Flex>
          <Flex
            gap={1.5}
            align="center"
            px={3}
            py={1.5}
            borderWidth={1}
            borderColor="#d1d7eb"
            borderRadius="md"
            className="container-shadow"
          >
            <Image
              src="/assets/icons/calendar.svg"
              alt="calendario"
              width={5}
              height={5}
            />
            <Text fontSize="xs" fontWeight="medium" color="#131d53">
              Mês Atual - Junho
            </Text>
          </Flex>
        </PageHeader>

        <PageContent>
          <Box
            display={{ base: 'block', md: 'none' }}
            borderRadius="md"
            bg="white"
            borderWidth={1}
            borderColor="#DEE6F2"
          >
            <Box p={3} borderBottomWidth={1} borderBottomColor="#E6E6E6">
              <Flex align="center" gap={3} mb={3}>
                <Box
                  w="40px"
                  h="40px"
                  border="1px solid #E6E6E6"
                  rounded="base"
                  overflow="hidden"
                  bg="white"
                  className="flex items-center justify-center"
                >
                  <ProductImage
                    src={link.image}
                    alt={link.name}
                    width="100%"
                    height="100%"
                    objectFit="contain"
                  />
                </Box>
                <Text
                  fontSize="sm"
                  color="#131D53"
                  height="42px"
                  lineHeight="21px"
                  noOfLines={2}
                  display="flex"
                  alignItems="center"
                >
                  {link.product}
                </Text>
              </Flex>
              <HStack gap={2} mb={2}>
                <Text fontSize="sm" color="#131D53">
                  {formatCurrency(link.enrichedData.productPrice)}
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
                >
                  Comissão Aprox.{' '}
                  <Text fontWeight={600}>
                    {formatCurrency(link.enrichedData.commissionValue)}
                  </Text>
                </Badge>
              </HStack>
            </Box>

            <Box p={3}>
              <VStack align="start" spacing={0.5} mb={4}>
                <Link
                  href={link.url}
                  color="#1F70F1"
                  fontWeight="semibold"
                  fontSize="sm"
                  isExternal
                  noOfLines={2}
                  wordBreak="break-all"
                  lineHeight="1.3"
                >
                  {link.url}
                </Link>
                <Text fontSize="sm" color="#131D5399">
                  {link.destination_url}
                </Text>
              </VStack>
            </Box>
            <HStack
              justify="space-between"
              borderTopWidth={1}
              borderTopColor="#E6E6E6"
              p={3}
              gap={2}
            >
              <Button
                px={3}
                py={1.5}
                leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
                size="sm"
                fontSize="xs"
                borderRadius="md"
                color="#131D53"
                bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                onClick={handleCopy}
                flex={1}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>

              <Button
                px={3}
                py={1.5}
                leftIcon={<Share2 size={16} />}
                size="sm"
                fontSize="xs"
                borderRadius="md"
                color="#131D53"
                bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                onClick={() => setIsShareOpen(true)}
                flex={1}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                Compartilhar
              </Button>

              <Button
                px={3}
                py={1.5}
                leftIcon={<Trash2 size={16} />}
                size="sm"
                fontSize="xs"
                borderRadius="md"
                color="#ff4757"
                bg="white"
                borderWidth={1}
                borderColor="#ff4757"
                _hover={{ bg: '#ff4757', color: 'white' }}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                Deletar
              </Button>
            </HStack>
          </Box>

          <Grid
            display={{ base: 'grid', md: 'none' }}
            templateColumns="repeat(2, 1fr)"
            gap={2}
            fontSize="xs"
            color="#131D53"
          >
            <Stack
              gap={3}
              bg="white"
              p={3}
              borderWidth={1}
              borderColor="#dfefff"
              rounded={12}
              shadow="0px 1px 1px 0px #000d3526"
              fontSize="xs"
            >
              <HStack>
                <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                  <img src="/assets/icons/commissions.svg" />
                </div>
                <Text color="#131D5399">Ganhos</Text>
              </HStack>
              <HStack>
                <Text color="#131D53">
                  {link.enrichedData.productStats.totalEarnings.toLocaleString(
                    'pt-BR',
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </Text>
              </HStack>
            </Stack>
            <Stack
              gap={3}
              bg="white"
              p={3}
              borderWidth={1}
              borderColor="#dfefff"
              rounded={12}
              shadow="0px 1px 1px 0px #000d3526"
              fontSize="xs"
            >
              <HStack>
                <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                  <img src="/assets/icons/cursor-click.svg" />
                </div>
                <Text color="#131D5399">Cliques</Text>
              </HStack>
              <HStack>
                <Text color="#131D53">
                  {link.total_views?.toLocaleString('pt-BR') || '0'}
                </Text>
              </HStack>
            </Stack>
            <Stack
              gap={3}
              bg="white"
              p={3}
              borderWidth={1}
              borderColor="#dfefff"
              rounded={12}
              shadow="0px 1px 1px 0px #000d3526"
              fontSize="xs"
            >
              <HStack>
                <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                  <img src="/assets/icons/handbag-success.svg" />
                </div>
                <Text color="#131D5399">Pedidos</Text>
              </HStack>
              <HStack>
                <Text color="#131D53">
                  {link.enrichedData.productStats.orderCount || '0'}
                </Text>
              </HStack>
            </Stack>
            <Stack
              gap={3}
              bg="white"
              p={3}
              borderWidth={1}
              borderColor="#dfefff"
              rounded={12}
              shadow="0px 1px 1px 0px #000d3526"
              fontSize="xs"
            >
              <HStack>
                <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                  <img src="/assets/icons/percent-circle.svg" />
                </div>
                <Text color="#131D5399">Taxa Conversão</Text>
              </HStack>
              <HStack>
                <Text color="#131D53">
                  {(() => {
                    const clicks = link.total_views || 0
                    const orders =
                      link.enrichedData.productStats.orderCount || 0
                    const conversionRate =
                      clicks > 0 ? (orders / clicks) * 100 : 0
                    return `${conversionRate.toFixed(1)}%`
                  })()}
                </Text>
              </HStack>
            </Stack>
          </Grid>

          <Flex display={{ base: 'none', md: 'flex' }} gap={4}>
            <Box
              borderRadius="md"
              bg="white"
              borderWidth={1}
              borderColor="#DEE6F2"
              flex="3"
            >
              <Box p={3} borderBottomWidth={1} borderBottomColor="#E6E6E6">
                <Flex align="center" gap={3} mb={3}>
                  <Box
                    w="40px"
                    h="40px"
                    border="1px solid #E6E6E6"
                    rounded="base"
                    overflow="hidden"
                    bg="white"
                    className="flex items-center justify-center"
                  >
                    <ProductImage
                      src={link.image}
                      alt={link.name}
                      width="100%"
                      height="100%"
                      objectFit="contain"
                    />
                  </Box>
                  <Text
                    fontSize="sm"
                    color="#131D53"
                    height="42px"
                    lineHeight="21px"
                    noOfLines={2}
                    display="flex"
                    alignItems="center"
                  >
                    {link.product}
                  </Text>
                </Flex>
                <HStack gap={2} mb={2}>
                  <Text fontSize="sm" color="#131D53">
                    {formatCurrency(link.enrichedData.productPrice)}
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
                  >
                    Comissão Aprox.{' '}
                    <Text fontWeight={600}>
                      {formatCurrency(link.enrichedData.commissionValue)}
                    </Text>
                  </Badge>
                </HStack>
              </Box>

              <Box p={3}>
                <VStack align="start" spacing={0.5} mb={4}>
                  <Link
                    href={link.url}
                    color="#1F70F1"
                    fontWeight="semibold"
                    fontSize="sm"
                    isExternal
                    noOfLines={2}
                    wordBreak="break-all"
                    lineHeight="1.3"
                  >
                    {link.url}
                  </Link>
                  <Text fontSize="sm" color="#131D5399">
                    {link.destination_url}
                  </Text>
                </VStack>
              </Box>

              <HStack
                justify="flex-start"
                borderTopWidth={1}
                borderTopColor="#E6E6E6"
                p={3}
                gap={2}
              >
                <Button
                  px={3}
                  py={1.5}
                  leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
                  size="sm"
                  fontSize="xs"
                  borderRadius="md"
                  color="#131D53"
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  onClick={handleCopy}
                  minWidth="fit-content"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {copied ? 'Link Copiado!' : 'Copiar Link'}
                </Button>

                <Button
                  px={3}
                  py={1.5}
                  leftIcon={<Share2 size={16} />}
                  size="sm"
                  fontSize="xs"
                  borderRadius="md"
                  color="#131D53"
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  onClick={() => setIsShareOpen(true)}
                  minWidth="fit-content"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  Compartilhar Link
                </Button>

                <Button
                  px={3}
                  py={1.5}
                  leftIcon={<Trash2 size={16} />}
                  size="sm"
                  fontSize="xs"
                  borderRadius="md"
                  color="#ff4757"
                  bg="white"
                  borderWidth={1}
                  borderColor="#ff4757"
                  _hover={{ bg: '#ff4757', color: 'white' }}
                  minWidth="fit-content"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  Deletar
                </Button>
              </HStack>
            </Box>

            <Grid
              templateColumns="repeat(2, 1fr)"
              templateRows="repeat(2, 1fr)"
              gap={2}
              fontSize="xs"
              color="#131D53"
              flex="2"
              height="100%"
            >
              <Stack
                gap={3}
                bg="white"
                p={3}
                borderWidth={1}
                borderColor="#dfefff"
                rounded={12}
                shadow="0px 1px 1px 0px #000d3526"
                fontSize="xs"
                justify="space-between"
                height="100%"
              >
                <HStack>
                  <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                    <img src="/assets/icons/commissions.svg" />
                  </div>
                  <Text color="#131D5399">Ganhos</Text>
                </HStack>
                <HStack>
                  <Text color="#131D53">
                    {link.enrichedData.productStats.totalEarnings.toLocaleString(
                      'pt-BR',
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </Text>
                </HStack>
              </Stack>
              <Stack
                gap={3}
                bg="white"
                p={3}
                borderWidth={1}
                borderColor="#dfefff"
                rounded={12}
                shadow="0px 1px 1px 0px #000d3526"
                fontSize="xs"
                justify="space-between"
                height="100%"
              >
                <HStack>
                  <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                    <img src="/assets/icons/cursor-click.svg" />
                  </div>
                  <Text color="#131D5399">Cliques</Text>
                </HStack>
                <HStack>
                  <Text color="#131D53">
                    {link.total_views?.toLocaleString('pt-BR') || '0'}
                  </Text>
                </HStack>
              </Stack>
              <Stack
                gap={3}
                bg="white"
                p={3}
                borderWidth={1}
                borderColor="#dfefff"
                rounded={12}
                shadow="0px 1px 1px 0px #000d3526"
                fontSize="xs"
                justify="space-between"
                height="100%"
              >
                <HStack>
                  <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                    <img src="/assets/icons/handbag-success.svg" />
                  </div>
                  <Text color="#131D5399">Pedidos</Text>
                </HStack>
                <HStack>
                  <Text color="#131D53">
                    {link.enrichedData.productStats.orderCount || '0'}
                  </Text>
                </HStack>
              </Stack>
              <Stack
                gap={3}
                bg="white"
                p={3}
                borderWidth={1}
                borderColor="#dfefff"
                rounded={12}
                shadow="0px 1px 1px 0px #000d3526"
                fontSize="xs"
                justify="space-between"
                height="100%"
              >
                <HStack>
                  <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                    <img src="/assets/icons/percent-circle.svg" />
                  </div>
                  <Text color="#131D5399">Taxa Conversão</Text>
                </HStack>
                <HStack>
                  <Text color="#131D53">
                    {(() => {
                      const clicks = link.total_views || 0
                      const orders =
                        link.enrichedData.productStats.orderCount || 0
                      const conversionRate =
                        clicks > 0 ? (orders / clicks) * 100 : 0
                      return `${conversionRate.toFixed(1)}%`
                    })()}
                  </Text>
                </HStack>
              </Stack>
            </Grid>
          </Flex>
          <Stack
            gap={3}
            p={3}
            pb={4}
            borderWidth={1}
            borderColor="#dee6f2"
            bg="white"
            rounded={12}
          >
            <Text fontSize="sm" color="#131d53" px={3}>
              Engajamento do Link
            </Text>
            <Stack gap={3}>
              <HStack px={2} gap={3}>
                <HStack gap={1.5} align="center" fontSize="xs">
                  <Box
                    borderWidth={1}
                    borderColor="#99adff"
                    bg="#d9e7ff"
                    rounded={4}
                    w={5}
                    h={3.5}
                  />
                  <Text color="#131d5399">Cliques</Text>
                  <Text color="#131d53">{link.total_views || 0}</Text>
                </HStack>

                <HStack gap={1.5} align="center" fontSize="xs">
                  <Box
                    borderWidth={1}
                    borderColor="#99adff"
                    bgGradient="linear-gradient(180deg, #5898FF 0%, #9EC3FF 100%)"
                    rounded={4}
                    w={5}
                    h={3.5}
                  />
                  <Text color="#131d5399">Pedidos</Text>
                  <Text color="#131d53">--</Text>
                </HStack>
              </HStack>
              <Box overflowX="scroll">
                <Box minW="774px">
                  <OrderChart />
                </Box>
              </Box>
            </Stack>
          </Stack>

          <ShareModal
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            onShareSuccess={handleShareSuccess}
          />
          <SharedSuccessModal
            isOpen={isSuccessModalOpen}
            onClose={() => setIsSuccessModalOpen(false)}
          />
        </PageContent>
      </AppLayout>
    </>
  )
}
