import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import Head from 'next/head'
import Image from 'next/image'
import {
  Metrics,
  Orders,
  Ranking,
} from '@/components/Features/affiliate/dashboard'
import {
  Box,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  VStack,
  HStack,
  useDisclosure,
  Divider,
} from '@chakra-ui/react'
import { useState, useMemo } from 'react'
import { DateRange } from '@/types/dashboard.types'
import { getDateRanges, formatDateSafe } from '@/utils/dashboardUtils'
import { SquaresFourIcon } from '@/components/Icons'
import { AppLayout } from '@/components/Layout'

const PERIOD_OPTIONS = [
  ...getDateRanges(),
  {
    label: 'Outros',
    value: 'custom',
    interval: 'custom',
    previous: 'custom_previous',
  },
]

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('current_month')
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  })
  const [tempDateRange, setTempDateRange] = useState<DateRange>(customDateRange)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const dateRange = useMemo(() => {
    if (selectedPeriod === 'custom') {
      return customDateRange
    }

    const now = new Date()
    switch (selectedPeriod) {
      case 'today':
        return {
          start_date: now.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0],
        }
      case 'last_7_days':
        const week = new Date(now)
        week.setDate(week.getDate() - 7)
        return {
          start_date: week.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0],
        }
      case 'last_month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        return {
          start_date: lastMonth.toISOString().split('T')[0],
          end_date: lastMonthEnd.toISOString().split('T')[0],
        }
      case 'last_30_days':
        const thirtyDaysAgo = new Date(now)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return {
          start_date: thirtyDaysAgo.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0],
        }
      case 'last_90_days':
        const ninetyDaysAgo = new Date(now)
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
        return {
          start_date: ninetyDaysAgo.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0],
        }
      case 'current_month':
      default:
        return {
          start_date: new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split('T')[0],
          end_date: new Date(now.getFullYear(), now.getMonth() + 1, 0)
            .toISOString()
            .split('T')[0],
        }
    }
  }, [selectedPeriod, customDateRange])

  const selectedPeriodLabel = useMemo(() => {
    if (selectedPeriod === 'custom') {
      const startDate = formatDateSafe(customDateRange.start_date)
      const endDate = formatDateSafe(customDateRange.end_date)
      return `${startDate} - ${endDate}`
    }
    const option = PERIOD_OPTIONS.find((opt) => opt.value === selectedPeriod)
    return option ? option.label : 'Mês Atual'
  }, [selectedPeriod, customDateRange])

  const handlePeriodSelect = (periodKey: string) => {
    if (periodKey === 'custom') {
      setTempDateRange(customDateRange)
      onOpen()
    } else {
      setSelectedPeriod(periodKey)
    }
  }

  const handleCustomDateConfirm = () => {
    setCustomDateRange(tempDateRange)
    setSelectedPeriod('custom')
    onClose()
  }

  const handleCustomDateCancel = () => {
    setTempDateRange(customDateRange)
    onClose()
  }

  return (
    <>
      <Head>
        <title>Painel Geral | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Flex gap={2} align="center">
            <SquaresFourIcon boxSize={6} color="#131D53" />
            <Text fontSize="sm" color="#131D53">
              Painel Geral
            </Text>
          </Flex>
          <Menu>
            <MenuButton>
              <Flex
                gap={1.5}
                align="center"
                px={3}
                py={1.5}
                borderWidth={1}
                borderColor="#d1d7eb"
                borderRadius="md"
                className="container-shadow"
                cursor="pointer"
                _hover={{ bg: 'gray.50' }}
              >
                <Image
                  src="/assets/icons/calendar.svg"
                  alt="calendario"
                  width={20}
                  height={20}
                />
                <Text fontSize="xs" fontWeight="medium" color="#131d53">
                  {selectedPeriodLabel}
                </Text>
              </Flex>
            </MenuButton>
            <MenuList>
              {PERIOD_OPTIONS.map((option) => (
                <MenuItem
                  key={option.value}
                  onClick={() => handlePeriodSelect(option.value)}
                  bg={
                    selectedPeriod === option.value ? 'blue.50' : 'transparent'
                  }
                  color={
                    selectedPeriod === option.value ? 'blue.600' : 'inherit'
                  }
                  fontSize="sm"
                >
                  {option.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </PageHeader>

        <PageContent>
          <Metrics dateRange={dateRange} />
          <Orders dateRange={dateRange} />
          <Ranking />
        </PageContent>

        {/* Modal para seleção de datas personalizadas */}
        <Modal isOpen={isOpen} onClose={handleCustomDateCancel} size="xs">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Selecionar Período Personalizado</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    mb={2}
                    color="gray.700"
                  >
                    Data de Início
                  </Text>
                  <Input
                    type="date"
                    value={tempDateRange.start_date}
                    onChange={(e) =>
                      setTempDateRange((prev) => ({
                        ...prev,
                        start_date: e.target.value,
                      }))
                    }
                    max={tempDateRange.end_date}
                  />
                </Box>
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    mb={2}
                    color="gray.700"
                  >
                    Data de Fim
                  </Text>
                  <Input
                    type="date"
                    value={tempDateRange.end_date}
                    onChange={(e) =>
                      setTempDateRange((prev) => ({
                        ...prev,
                        end_date: e.target.value,
                      }))
                    }
                    min={tempDateRange.start_date}
                  />
                </Box>
                <Divider />
                <Box bg="blue.50" p={3} borderRadius="md">
                  <Text fontSize="xs" color="blue.700">
                    <strong>Período selecionado:</strong>{' '}
                    {formatDateSafe(tempDateRange.start_date)} até{' '}
                    {formatDateSafe(tempDateRange.end_date)}
                  </Text>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={handleCustomDateCancel}>
                  Cancelar
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleCustomDateConfirm}
                  disabled={
                    !tempDateRange.start_date || !tempDateRange.end_date
                  }
                >
                  Aplicar Filtro
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </AppLayout>
    </>
  )
}
