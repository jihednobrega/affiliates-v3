'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Image,
  Flex,
  HStack,
  Badge,
  Link,
  Button,
  useDisclosure,
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  MenuDivider,
  MenuItem,
  Grid,
  Stack,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { AppLayout } from '@/components/AppLayout'
import { PageHeader, PageContent } from '@/components/PageHeader'
import { LinkIcon, OfferIcon } from '@/components/CustomIcons'
import {
  ChartNoAxesColumnIncreasing,
  Check,
  Copy,
  MoreHorizontal,
  Share2,
  Trash2,
} from 'lucide-react'
import { ShareModal } from '@/components/CreateLinkModal/ShareModal'
import { SharedSuccessModal } from '@/components/CreateLinkModal/SharedSuccessModal'
import { OrderChart } from '@/components/Orders/OrderChart'

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

export default function LinkDetailsPage() {
  const router = useRouter()
  const { id } = router.query
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [link, setLink] = useState<Hotlink | null>(null)
  const [copied, setCopied] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  useEffect(() => {
    if (!id) return

    fetch('/mock/hotlinks.json')
      .then((res) => res.json())
      .then((data: Hotlink[]) => {
        const found = data.find(
          (item) => item.id.toLowerCase() === String(id).toLowerCase(),
        )
        setLink(found ?? null)
      })
  }, [id])

  if (!link) {
    return (
      <Box p={10}>
        <Spinner />
        <Text>Carregando detalhes...</Text>
      </Box>
    )
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch (err) {
      console.error('Erro ao copiar link:', err)
    }
  }

  function handleShareSuccess() {
    setIsShareOpen(false)
    setTimeout(() => {
      onClose()
      setTimeout(() => {
        setIsSuccessModalOpen(true)
      }, 200)
    }, 500)
  }

  return (
    <>
      <Head>
        <title>Meus Links | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Flex gap={2} align="center" color="#131d53">
            <LinkIcon boxSize={6} />
            <Text fontSize="sm">{link.title}</Text>
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
            borderRadius="md"
            bg="white"
            borderWidth={1}
            borderColor="#DEE6F2"
          >
            <Box p={3} borderBottomWidth={1} borderBottomColor="#E6E6E6">
              <Flex justify="space-between" mb={2} gap={2}>
                <Flex align="center" gap={2}>
                  <Box
                    w="32px"
                    h="32px"
                    border="1px solid #E6E6E6"
                    rounded="base"
                    overflow="hidden"
                    bg="white"
                    className="flex items-center justify-center"
                  >
                    <Image src={link.imageUrl} alt={link.title} h="32px" />
                  </Box>
                  <Text fontSize="sm" color="#131D53">
                    {link.title}
                  </Text>
                </Flex>
              </Flex>
              <HStack>
                <Text fontSize="sm" color="#131D53">
                  {link.price}
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
                  <Text fontWeight={600}>{link.commission}</Text>
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
                >
                  {link.url}
                </Link>
                <Text fontSize="sm" color="#131D5399">
                  {link.externalUrl}
                </Text>
              </VStack>

              {link.tag && (
                <Badge
                  fontSize="xs"
                  px={2}
                  py={1}
                  rounded={4}
                  borderWidth={1}
                  borderColor="#C5CDDC"
                  bg="#F4F6F9"
                  textTransform="none"
                  fontWeight={400}
                  color="#676B8C"
                  lineHeight={4}
                >
                  <OfferIcon boxSize={4} mr={1} color="#676B8C" />
                  {link.tag}
                </Badge>
              )}
            </Box>
            <HStack
              justify="space-between"
              borderTopWidth={1}
              borderTopColor="#E6E6E6"
              p={3}
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
              >
                Compartilhar Link
              </Button>
              {isOpen && (
                <Box
                  position="fixed"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg="blackAlpha.500"
                  zIndex={11}
                  onClick={onClose}
                />
              )}
              <Menu isOpen={isOpen}>
                <MenuButton
                  as={IconButton}
                  px={3}
                  py={1.5}
                  icon={<MoreHorizontal size={16} />}
                  aria-label="Mais"
                  size="sm"
                  borderRadius="md"
                  flex={1}
                  zIndex={9}
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  onClick={onOpen}
                />
                <MenuList
                  color="#131d53"
                  fontSize="sm"
                  fontWeight={500}
                  gap={5}
                  onMouseLeave={onClose}
                >
                  <MenuItem
                    icon={<ChartNoAxesColumnIncreasing size={20} />}
                    onClick={() => {
                      router.push(`/affiliate/hotlinks/${id}`)
                      onClose()
                    }}
                  >
                    Ver Detalhes do Link
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem icon={<Trash2 size={20} onClick={onClose} />}>
                    Deletar Link
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
            <ShareModal
              isOpen={isShareOpen}
              onClose={() => setIsShareOpen(false)}
              onShareSuccess={handleShareSuccess}
            />
            <SharedSuccessModal
              isOpen={isSuccessModalOpen}
              onClose={() => setIsSuccessModalOpen(false)}
            />
          </Box>

          <Grid
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
                <Text color="#131D53">R$ {link.earnings}</Text>
                <div className="flex items-center gap-1 py-0.5 px-1 bg-[#d4fce2] rounded-sm">
                  <img src="/assets/icons/trend-up.svg" />
                  <small className="font-semibold text-[10px] text-[#008e5a]">
                    4,8%
                  </small>
                </div>
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
                <Text color="#131D53">{link.clicks}</Text>
                <div className="flex items-center gap-1 py-0.5 px-1 bg-[#d4fce2] rounded-sm">
                  <img src="/assets/icons/trend-up.svg" />
                  <small className="font-semibold text-[10px] text-[#008e5a]">
                    4,8%
                  </small>
                </div>
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
                <Text color="#131D53">{link.orders}</Text>
                <div className="flex items-center gap-1 py-0.5 px-1 bg-[#d4fce2] rounded-sm">
                  <img src="/assets/icons/trend-up.svg" />
                  <small className="font-semibold text-[10px] text-[#008e5a]">
                    4,8%
                  </small>
                </div>
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
                <Text color="#131D53">{link.conversion}</Text>
                <div className="flex items-center gap-1 py-0.5 px-1 bg-[#d4fce2] rounded-sm">
                  <img src="/assets/icons/trend-up.svg" />
                  <small className="font-semibold text-[10px] text-[#008e5a]">
                    4,8%
                  </small>
                </div>
              </HStack>
            </Stack>
          </Grid>
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
                  <Text color="#131d53">{link.clicks}</Text>
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
                  <Text color="#131d53">{link.orders}</Text>
                </HStack>
              </HStack>
              <Box overflowX="scroll">
                <Box minW="774px">
                  <OrderChart />
                </Box>
              </Box>
            </Stack>
          </Stack>
        </PageContent>
      </AppLayout>
    </>
  )
}
