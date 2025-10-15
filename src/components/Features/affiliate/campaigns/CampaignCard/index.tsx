'use client'

import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  Divider,
  Tooltip,
} from '@chakra-ui/react'
import { ProductImage } from '@/components/UI'
import { useEffect, useState, useRef } from 'react'
import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { ItemsCampaignCard } from '../ItemsCampaignCard'
import { formatPercentage } from '@/utils/formatters'
import { ShimmerBadge } from '@/components/UI/Badges'

interface CampaignCardProps {
  id: number
  title: string
  periodStart: string
  periodEnd: string
  imageUrl: string
  products: {
    id: number
    name: string
    image: string
    price: number
    commissionPercentage: number
  }[]

  creatives?: {
    id: number
    type: string
    title: string
    url: string
    thumbnail?: string
  }[]

  status?: string

  maxCommission?: number

  commission?: string | number
}

export function CampaignCard({
  id,
  title,
  periodStart,
  periodEnd,
  imageUrl,
  products,
  maxCommission,
  commission,
}: CampaignCardProps) {
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftGradient, setShowLeftGradient] = useState(false)
  const [showRightGradient, setShowRightGradient] = useState(false)

  const handleScrollGradients = () => {
    if (!scrollContainerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setShowLeftGradient(scrollLeft > 0)
    setShowRightGradient(scrollLeft + clientWidth < scrollWidth)
  }

  useEffect(() => {
    handleScrollGradients()

    const resizeObserver = new ResizeObserver(() => {
      handleScrollGradients()
    })

    if (scrollContainerRef.current) {
      resizeObserver.observe(scrollContainerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [products])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let isDown = false
    let startX = 0
    let scrollLeft = 0
    let dragDistance = 0

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true
      container.style.cursor = 'grabbing'
      startX = e.pageX - container.offsetLeft
      scrollLeft = container.scrollLeft
      dragDistance = 0

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    const handleMouseLeave = () => {
      if (!isDown) {
        container.style.cursor = 'grab'
      }
    }

    const handleMouseEnter = () => {
      if (!isDown) {
        container.style.cursor = 'grab'
      }
    }

    const handleMouseUp = () => {
      isDown = false
      container.style.cursor = 'grab'

      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - container.offsetLeft
      const currentWalk = x - startX

      dragDistance = Math.abs(currentWalk)

      let multiplier = 1.2
      if (dragDistance > 30) {
        const reductionFactor = Math.min((dragDistance - 30) / 60, 0.4)
        multiplier = 1.2 - reductionFactor
      }

      const walk = currentWalk * multiplier
      container.scrollLeft = scrollLeft - walk
    }

    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mouseleave', handleMouseLeave)
    container.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mouseleave', handleMouseLeave)
      container.removeEventListener('mouseenter', handleMouseEnter)

      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const calculatedMaxCommission = useMemo(() => {
    if (commission !== undefined && commission !== null) {
      const campaignCommission =
        typeof commission === 'string' ? parseFloat(commission) : commission

      if (
        !isNaN(campaignCommission) &&
        isFinite(campaignCommission) &&
        campaignCommission >= 0
      ) {
        console.log(
          `📊 CampaignCard: Usando comissão da campanha = ${campaignCommission}%`
        )
        return campaignCommission
      }
    }

    if (
      maxCommission !== undefined &&
      maxCommission !== null &&
      maxCommission > 0
    ) {
      console.log(
        `📊 CampaignCard: Usando maxCommission fornecido = ${maxCommission}%`
      )
      return maxCommission
    }

    if (!products || products.length === 0) {
      console.log('⚠️ CampaignCard: Nenhum produto para calcular comissão')
      return 0
    }

    const productsWithCommission = products.filter(
      (p) => p.commissionPercentage > 0
    )

    if (productsWithCommission.length === 0) {
      console.log('⚠️ CampaignCard: Nenhum produto com comissão válida')
      return 0
    }

    const calculatedMax = Math.max(
      ...productsWithCommission.map((p) => p.commissionPercentage)
    )

    console.log(
      `📊 CampaignCard: Maior comissão calculada dos produtos = ${calculatedMax}% (entre ${productsWithCommission.length} produtos)`
    )

    return calculatedMax
  }, [commission, maxCommission, products])

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
      maxW={{ base: '100%', sm: '530px' }}
      mx={{ base: 'auto', md: 'unset' }}
      w={{ base: '100%', sm: 'auto' }}
    >
      <Box p={3} borderBottomWidth={1} borderBottomColor="#E6E6E6">
        <Flex align="center" gap={4} mb={2} h="30px">
          <Tooltip
            label={title}
            fontSize="sm"
            placement="top"
            hasArrow
            bg="#131D53"
            color="white"
            px={3}
            py={2}
            borderRadius="md"
          >
            <Text
              fontSize="xl"
              color="#131D53"
              noOfLines={1}
              overflow="hidden"
              textOverflow="ellipsis"
              flex="1"
              cursor="default"
            >
              {title}
            </Text>
          </Tooltip>
          <Badge
            bg="#DFEFFF"
            rounded={4}
            py={1}
            px={2}
            fontWeight={600}
            color="#1F70F1"
            lineHeight="14.4px"
            flexShrink={0}
          >
            Em Andamento
          </Badge>
        </Flex>
        <HStack gap={2.5} mb={2}>
          <Box>
            <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
              <img src="/assets/icons/calendar-in-progress.svg" />
            </div>
          </Box>
          <HStack>
            <Text fontSize="xs" color="#131D53">
              De: {periodStart}
            </Text>
            <Divider
              orientation="vertical"
              w={0.5}
              h={5}
              color="#131D5380"
              bg="#131D5380"
            />
            <Text fontSize="xs" color="#131D53">
              Até: {periodEnd}
            </Text>
          </HStack>
        </HStack>
        <HStack>
          <ShimmerBadge
            icon={'/assets/icons/extra-commission.svg'}
            text={calculatedMaxCommission > 0 ? 'Comissões de' : 'Comissões'}
            percentage={formatPercentage(calculatedMaxCommission)}
          />
        </HStack>
      </Box>

      <Box p={3}>
        <Flex
          justify="center"
          align="center"
          maxH="200px"
          overflow="hidden"
          mb={5}
        >
          <ProductImage
            src={imageUrl}
            alt={title}
            height="200px"
            width="auto"
            objectFit="contain"
          />
        </Flex>

        <Box>
          <Text color="#000" fontSize="sm" mb={2}>
            Alguns produtos participantes:
          </Text>
          {products && products.length > 0 ? (
            <Box position="relative" w="100%">
              <Box
                ref={scrollContainerRef}
                overflowX="auto"
                w="100%"
                cursor="grab"
                userSelect="none"
                onScroll={handleScrollGradients}
                sx={{
                  scrollBehavior: 'smooth',
                  '&::-webkit-scrollbar': {
                    height: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#c1c1c1',
                    borderRadius: '10px',
                    '&:hover': {
                      background: '#a8a8a8',
                    },
                  },
                }}
              >
                <HStack spacing={2} minW="max-content" maxW="100%">
                  {products.slice(0, 4).map((product) => (
                    <ItemsCampaignCard
                      key={product.id}
                      id={product.id}
                      image={product.image}
                      commissionPercentage={product.commissionPercentage}
                      name={product.name}
                      price={product.price}
                    />
                  ))}
                </HStack>
              </Box>

              {/* Gradiente direito */}
              {showRightGradient && (
                <Box
                  position="absolute"
                  top="0"
                  right="0"
                  width="40px"
                  height="100%"
                  bgGradient="linear-gradient(to-l, white 20%, transparent 100%)"
                  pointerEvents="none"
                  zIndex={1}
                />
              )}

              {/* Gradiente esquerdo */}
              {showLeftGradient && (
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  width="40px"
                  height="100%"
                  bgGradient="linear-gradient(to-r, white 20%, transparent 100%)"
                  pointerEvents="none"
                  zIndex={1}
                />
              )}
            </Box>
          ) : (
            <Box p={4} bg="gray.50" borderRadius="md" textAlign="center">
              <Text color="gray.500" fontSize="sm">
                Produtos da campanha em carregamento...
              </Text>
            </Box>
          )}
        </Box>

        <VStack mt={2} align="stretch">
          <Button
            size="md"
            fontSize="xs"
            borderRadius="md"
            color="#131D53"
            bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
            shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
            onClick={() => router.push(`/affiliate/campaigns/${id}`)}
          >
            Ver Campanha
          </Button>
        </VStack>
      </Box>
    </Box>
  )
}
