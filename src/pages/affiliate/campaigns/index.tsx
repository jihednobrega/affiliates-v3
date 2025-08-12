'use client'

import { AppLayout } from '@/components/AppLayout'
import { PageHeader, PageContent } from '@/components/PageHeader'
import Head from 'next/head'
import { Box, Button, Flex, HStack, Input, Text } from '@chakra-ui/react'
import { Calendar, Megaphone, Search, SlidersHorizontal } from 'lucide-react'
import { CampaignCard } from '@/components/CampaignCard'
import { useMockData } from '@/hooks/useMockData'
import { useSearch } from '@/hooks/useSearch'
import { LoadingState, EmptyState, ErrorState } from '@/components/ui'

interface Campaign {
  id: number
  title: string
  periodStart: string
  periodEnd: string
  price: number
  commission: number
  url: string
  externalUrl: string
  imageUrl: string
  products: Product[]
}

interface Product {
  id: number
  name: string
  image: string
  price: number
  commissionPercentage: number
}

export default function Campaigns() {
  const {
    data: campaigns,
    loading,
    error,
    retry,
  } = useMockData<Campaign>('/mock/campaigns.json')

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

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (loading) {
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
            <LoadingState type="skeleton" count={6} />
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
          <Box display="flex" flexDirection="column" gap={2} w="full">
            <Flex justifyContent="space-between">
              <Flex gap={2} align="center">
                <Megaphone size={24} color="#131D53" />
                <HStack fontSize="sm" color="#131D53">
                  <Text>Campanhas:</Text>
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
                </HStack>
              </Flex>
            </Flex>

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
                  placeholder="Pesquisar campanhas"
                  order="none"
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
        </PageHeader>

        <PageContent>
          {filteredData.length === 0 && hasActiveSearch ? (
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
            filteredData.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                id={campaign.id}
                title={campaign.title}
                periodStart={formatDate(campaign.periodStart)}
                periodEnd={formatDate(campaign.periodEnd)}
                imageUrl={campaign.imageUrl}
                products={campaign.products}
              />
            ))
          )}
        </PageContent>
      </AppLayout>
    </>
  )
}
