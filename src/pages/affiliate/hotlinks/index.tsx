'use client'

import { AppLayout } from '@/components/AppLayout'
import { PageHeader, PageContent } from '@/components/PageHeader'
import Head from 'next/head'
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { LinkEditIcon } from '@/components/CustomIcons'
import { CreateLinkDrawer } from '@/components/CreateLinkModal/CreateLinkDrawer'
import { Calendar, Search, SlidersHorizontal, Link } from 'lucide-react'
import { useMockData } from '@/hooks/useMockData'
import { useSearch } from '@/hooks/useSearch'
import { LoadingState, EmptyState, ErrorState } from '@/components/ui'
import { HotlinkCard } from '@/components/HotlinkCard'

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
  tag?: string
  imageUrl: string
}

export default function HotLinks() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    data: hotlinks,
    loading,
    error,
    retry,
  } = useMockData<Hotlink>('/mock/hotlinks.json')

  const {
    searchTerm,
    setSearchTerm,
    filteredData,
    clearSearch,
    hasActiveSearch,
  } = useSearch({
    data: hotlinks,
    searchFields: ['title', 'url'],
  })

  if (loading) {
    return (
      <>
        <Head>
          <title>Meus Links | Affiliates</title>
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
            <LoadingState type="skeleton" count={4} />
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
          <Box display="flex" flexDirection="column" gap={2} w="full">
            <Flex justifyContent="space-between">
              <Flex gap={2} align="center">
                <LinkEditIcon boxSize={6} color="#131D53" />
                <HStack fontSize="sm" color="#131D53">
                  <Text>Meus Links:</Text>
                  <Box
                    alignContent="center"
                    justifyContent="center"
                    bgColor="#DFEFFF"
                    px={2}
                    py={0.5}
                    rounded={4}
                    lineHeight="120%"
                  >
                    {hasActiveSearch ? filteredData.length : hotlinks.length}
                  </Box>
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
            <Box>
              <HStack
                h={10}
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </HStack>
            </Box>
            <HStack
              gap={2}
              justify={{ base: 'space-between', md: 'flex-start' }}
            >
              <Button
                rounded={4}
                size="sm"
                fontSize="xs"
                fontWeight={500}
                px={3}
                py={1.5}
                w={{ base: 'full', md: 'auto' }}
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
                w={{ base: 'full', md: 'auto' }}
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
              title="Nenhum link encontrado"
              description={`Não encontramos links para "${searchTerm}". Tente ajustar o termo de busca.`}
              actionButton={{
                label: 'Limpar Busca',
                onClick: clearSearch,
                variant: 'outline',
              }}
            />
          ) : filteredData.length === 0 ? (
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
          ) : (
            <Box
              display="grid"
              gridTemplateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              }}
              gap={4}
            >
              {filteredData.map((link, idx) => (
                <HotlinkCard key={link.id || idx} {...link} />
              ))}
            </Box>
          )}
        </PageContent>
      </AppLayout>
      <CreateLinkDrawer isOpen={isOpen} onClose={onClose} />
    </>
  )
}
