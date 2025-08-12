'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Text,
  Spinner,
  HStack,
  Button,
  useToast,
  Flex,
  Image,
  SimpleGrid,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { AppLayout } from '@/components/AppLayout'
import { PageHeader, PageContent } from '@/components/PageHeader'
import {
  ChevronLeft,
  Download,
  ImageIcon,
  SquarePlay,
  Megaphone,
} from 'lucide-react'
import { ShimmerBadge } from '@/components/ShimmerBadge'
import { SelectItemsIcon } from '@/components/CustomIcons/SelectItemsIcon'

interface Campaign {
  id: number
  title: string
  periodStart: string
  periodEnd: string
  status: string
  imageUrl: string
  creatives: CreativeItem[]
  products: Product[]
}

interface Product {
  id: number
  name: string
  image: string
  price: number
  commissionPercentage: number
}

interface CreativeItem {
  id: number
  type: 'image' | 'video'
  title: string
  url?: string
  thumbnail?: string
}

interface CreativeSection {
  icon: string
  title: string
  quantity: string
  items: CreativeItem[]
}

export default function CampaignCreativesPage() {
  const router = useRouter()
  const { id } = router.query
  const toast = useToast()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [selectionMode, setSelectionMode] = useState<boolean>(false)
  const [viewingMedia, setViewingMedia] = useState<CreativeItem | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const maxCommission = useMemo(() => {
    if (!campaign?.products || campaign.products.length === 0) return 0

    return Math.max(
      ...campaign.products.map((product) => product.commissionPercentage),
    )
  }, [campaign?.products])

  const creatives: CreativeSection[] = campaign
    ? [
        {
          icon: 'ImageIcon',
          title: 'Fotos',
          quantity: `${campaign.creatives.filter((c) => c.type === 'image').length}`,
          items: campaign.creatives.filter((c) => c.type === 'image'),
        },
        {
          icon: 'SquarePlay',
          title: 'Vídeos',
          quantity: `${campaign.creatives.filter((c) => c.type === 'video').length}`,
          items: campaign.creatives.filter((c) => c.type === 'video'),
        },
      ]
    : []

  const totalItems = creatives.reduce(
    (acc, section) => acc + section.items.length,
    0,
  )
  const imageCount =
    creatives.find((s) => s.title.includes('Fotos'))?.items.length || 0
  const videoCount =
    creatives.find((s) => s.title.includes('Vídeos'))?.items.length || 0

  useEffect(() => {
    if (!router.isReady) return

    const loadCampaign = async () => {
      if (!id) {
        return
      }

      setLoading(true)

      try {
        const response = await fetch('/mock/campaigns.json')
        const data: Campaign[] = await response.json()

        const found = data.find((c) => c.id === Number(id))

        if (found) {
          setCampaign(found)
        } else {
          toast({
            title: 'Campanha não encontrada',
            status: 'error',
            duration: 3000,
          })
          setTimeout(() => router.push('/affiliate/campaigns'), 2000)
        }
      } catch (error) {
        console.error('Erro ao carregar campanha:', error)
        toast({
          title: 'Erro ao carregar campanha',
          description: 'Tente novamente mais tarde',
          status: 'error',
          duration: 3000,
        })
      } finally {
        setLoading(false)
      }
    }

    loadCampaign()
  }, [router.isReady, id, router, toast])

  const handleItemClick = (item: CreativeItem) => {
    if (selectionMode) {
      const newSelected = new Set(selectedItems)
      if (newSelected.has(item.id)) {
        newSelected.delete(item.id)
      } else {
        newSelected.add(item.id)
      }
      setSelectedItems(newSelected)
    } else {
      setViewingMedia(item)
      onOpen()
    }
  }

  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    if (selectionMode) {
      setSelectedItems(new Set())
    }
  }

  const handleDownloadAll = () => {
    toast({
      title: 'Download iniciado',
      description: `Baixando ${totalItems} itens`,
      status: 'success',
      duration: 3000,
    })
  }

  const handleDownloadSelected = () => {
    toast({
      title: 'Download iniciado',
      description: `Baixando ${selectedItems.size} itens selecionados`,
      status: 'success',
      duration: 3000,
    })
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon size={20} />
      case 'video':
        return <SquarePlay size={20} />
      default:
        return <ImageIcon size={20} />
    }
  }

  if (!router.isReady || loading) {
    return (
      <AppLayout>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          h="50vh"
        >
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Box>
      </AppLayout>
    )
  }

  if (!campaign) {
    return null
  }

  return (
    <>
      <Head>
        <title>Campanhas | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Box display="flex" flexDirection="column" gap={3} w="full">
            <HStack justify="space-between">
              <Button
                rounded={4}
                size="xs"
                fontSize="sm"
                fontWeight={400}
                px={3}
                py={1.5}
                gap={1.5}
                bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                color="#131D53"
                onClick={() => router.push(`/affiliate/campaigns/${id}`)}
              >
                <ChevronLeft size={16} color="#131D53" />
                Voltar
              </Button>
              <Flex gap={2} align="center" color="#131d53">
                <Megaphone size={24} color="#131D53" />

                <Text fontSize="sm">{campaign.title}</Text>
                <ShimmerBadge
                  icon={'/assets/icons/extra-commission.svg'}
                  text="ATÉ"
                  percentage={`${maxCommission}%`}
                />
              </Flex>
            </HStack>

            <Text fontSize="xs" color="#131D5399" fontWeight={400}>
              Selecione ou baixe todos os materiais disponíveis abaixo
            </Text>

            <VStack gap={3} align="start">
              <HStack gap={2.5}>
                <Box
                  w="24px"
                  h="24px"
                  bg="#DFEFFF"
                  rounded={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <ImageIcon size={20} color="#1F70F1" />
                </Box>
                <Text fontSize="xs" color="#131D5399">
                  Photos{' '}
                  <Text as="span" color="#131D53">
                    {imageCount}
                  </Text>
                </Text>
              </HStack>

              <HStack gap={2.5}>
                <Box
                  w="24px"
                  h="24px"
                  bg="#DFEFFF"
                  rounded={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <SquarePlay size={20} color="#1F70F1" />
                </Box>
                <Text fontSize="xs" color="#131D5399">
                  Vídeos{' '}
                  <Text as="span" color="#131D53">
                    {videoCount}
                  </Text>
                </Text>
              </HStack>
            </VStack>

            <HStack gap={2} mt={3}>
              <Button
                h="32px"
                w="full"
                px={3}
                py={1.5}
                size="sm"
                fontSize="xs"
                fontWeight={500}
                borderRadius="md"
                gap={1.5}
                color="#131D53"
                bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                onClick={handleToggleSelectionMode}
              >
                {selectionMode ? '' : <SelectItemsIcon boxSize={6} />}
                {selectionMode ? 'Cancelar' : 'Selecionar'}
              </Button>
              <Button
                h="32px"
                w="full"
                px={3}
                py={1.5}
                size="sm"
                fontSize="xs"
                fontWeight={500}
                borderRadius="md"
                color="#131D53"
                bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                gap={1.5}
                onClick={
                  selectedItems.size > 0
                    ? handleDownloadSelected
                    : handleDownloadAll
                }
              >
                <Download size={16} />
                {selectedItems.size > 0
                  ? `Baixar (${selectedItems.size})`
                  : 'Baixar Tudo'}
              </Button>
            </HStack>
          </Box>
        </PageHeader>

        <PageContent>
          <VStack spacing={3} align="stretch">
            {creatives.map((section, sectionIndex) => (
              <Box
                key={sectionIndex}
                bg="white"
                p={2}
                pt={3}
                rounded={6}
                borderWidth={1}
                borderColor="#DEE6F2"
              >
                <HStack mb={3} px={2} gap={2.5}>
                  <Box
                    w="24px"
                    h="24px"
                    bg="#DFEFFF"
                    rounded={4}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <ImageIcon size={20} color="#1F70F1" />
                  </Box>
                  <HStack gap={1} align="center">
                    <Text fontSize="sm" color="#131D53" fontWeight={600}>
                      {section.title}
                    </Text>
                    <Text fontSize="xs" color="#131D53" fontWeight={400}>
                      {section.quantity}
                    </Text>
                  </HStack>
                </HStack>

                <SimpleGrid columns={3} spacing={{ base: 2, md: 3 }}>
                  {section.items.map((item) => (
                    <Box
                      key={item.id}
                      bg="white"
                      borderWidth={selectedItems.has(item.id) ? 2 : 1}
                      borderColor={
                        selectedItems.has(item.id) ? '#1F70F1' : '#E6EEFA'
                      }
                      borderRadius="md"
                      overflow="hidden"
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        borderColor: '#1F70F1',
                        transform: 'translateY(-1px)',
                      }}
                      onClick={() => handleItemClick(item)}
                    >
                      <Box
                        h="110px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {item.type === 'image' ? (
                          <Box>
                            <Image
                              src={item.url}
                              alt={item.title}
                              maxH="100%"
                              maxW="100%"
                              objectFit="contain"
                            />
                          </Box>
                        ) : item.type === 'video' && item.thumbnail ? (
                          <Box>
                            <Image
                              src={item.thumbnail}
                              alt={item.title}
                              maxH="100%"
                              maxW="100%"
                              objectFit="contain"
                            />
                          </Box>
                        ) : (
                          <Box color="#C5CDDC">{getIconForType(item.type)}</Box>
                        )}
                      </Box>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            ))}
          </VStack>
        </PageContent>

        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
          <ModalOverlay />
          <ModalContent mx={4}>
            <ModalBody p={0}>
              {viewingMedia && (
                <Box display="flex" justifyContent="center" alignItems="center">
                  {viewingMedia.type === 'image' ? (
                    <Image
                      src={viewingMedia.url}
                      alt={viewingMedia.title}
                      maxH="500px"
                      maxW="100%"
                      objectFit="contain"
                    />
                  ) : (
                    <Box position="relative">
                      <Image
                        src={viewingMedia.thumbnail}
                        alt={viewingMedia.title}
                        maxH="500px"
                        maxW="100%"
                        objectFit="contain"
                      />
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        bg="blackAlpha.700"
                        borderRadius="full"
                        w="60px"
                        h="60px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <SquarePlay size={30} color="white" />
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </AppLayout>
    </>
  )
}
