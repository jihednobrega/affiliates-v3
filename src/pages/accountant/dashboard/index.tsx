import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  VStack,
  Skeleton,
  Badge,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import { useAccountantWithdraws } from '@/hooks/useAccountantWithdraws'
import { useAccountantDigitalAccounts } from '@/hooks/useAccountantDigitalAccounts'
import { useAccountantBillings } from '@/hooks/useAccountantBillings'
import { Wallet, FileText, CreditCard, LayoutDashboard } from 'lucide-react'

export default function AccountantDashboardPage() {
  const router = useRouter()

  const getLastThirtyDaysPeriod = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    return `${formatDate(thirtyDaysAgo)}:${formatDate(today)}`
  }

  const { data: withdrawsData, isLoading: isLoadingWithdraws } =
    useAccountantWithdraws({
      perpage: 100,
    })

  const { data: accountsData, isLoading: isLoadingAccounts } =
    useAccountantDigitalAccounts({
      per_page: 1,
      status: 'pending',
    })

  const { data: billingsData, isLoading: isLoadingBillings } =
    useAccountantBillings({
      perpage: 100,
      period: getLastThirtyDaysPeriod(),
    })

  const getBillingsLast30Days = () => {
    if (!billingsData?.billings) return { total: 0, pending: 0 }

    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    const billingsInRange = billingsData.billings.filter((billing) => {
      const createdDate = new Date(billing.created_at)
      return createdDate >= thirtyDaysAgo && createdDate <= today
    })

    const pendingCount = billingsInRange.filter(
      (b) => b.status === 'created'
    ).length

    return {
      total: billingsInRange.length,
      pending: pendingCount,
    }
  }

  const billingsStats = getBillingsLast30Days()

  const totalWithdraws = withdrawsData?.meta?.total_items || 0
  const pendingWithdrawsCount =
    withdrawsData?.list?.filter((w) => w.status === 'pending').length || 0
  const pendingAccounts = accountsData?.meta?.total_items || 0
  const totalBillings = billingsStats.total
  const pendingBillingsCount = billingsStats.pending

  return (
    <>
      <Head>
        <title>Dashboard | Contador</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Flex gap={2} align="center">
            <LayoutDashboard size={24} color="#131D53" />
            <Text fontSize="sm" color="#131D53">
              Dashboard do Contador
            </Text>
          </Flex>
        </PageHeader>

        <PageContent>
          <VStack spacing={6} align="start" w="full">
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-2" w="full">
              {isLoadingWithdraws ? (
                <Skeleton height="80px" borderRadius="12px" />
              ) : (
                <Box className="p-3 bg-white flex flex-col gap-3 border border-[#dee6f2] rounded-xl container-shadow">
                  <HStack gap={3}>
                    <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm">
                      <Wallet size={16} color="#1F70F1" />
                    </Box>
                    <Text className="text-xs text-[#131d5399]">
                      Solicitações de Saque
                    </Text>
                  </HStack>
                  <HStack gap={2} align="center">
                    <Text className="text-sm text-[#131d53]">
                      {totalWithdraws}
                    </Text>
                    {pendingWithdrawsCount > 0 && (
                      <Badge
                        colorScheme="yellow"
                        fontSize="xs"
                        px={2}
                        py={1}
                        borderRadius="6px"
                        fontWeight="600"
                      >
                        {pendingWithdrawsCount}{' '}
                        {pendingWithdrawsCount === 1
                          ? 'solicitação pendente'
                          : 'solicitações pendentes'}
                      </Badge>
                    )}
                  </HStack>
                  <Button
                    size="sm"
                    fontSize="xs"
                    fontWeight={500}
                    px={3}
                    bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                    shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                    color="#131D53"
                    _hover={{
                      bgGradient:
                        'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                      shadow:
                        '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                    }}
                    onClick={() => router.push('/accountant/withdraw-requests')}
                    w="full"
                  >
                    Ver Solicitações de Saque
                  </Button>
                </Box>
              )}

              {isLoadingAccounts ? (
                <Skeleton height="80px" borderRadius="12px" />
              ) : (
                <Box className="p-3 bg-white flex flex-col gap-3 border border-[#dee6f2] rounded-xl container-shadow">
                  <HStack gap={3}>
                    <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm">
                      <CreditCard size={16} color="#1F70F1" />
                    </Box>
                    <Text className="text-xs text-[#131d5399]">
                      Contas Digitais
                    </Text>
                  </HStack>
                  <Text className="text-sm text-[#131d53]">
                    {pendingAccounts}
                  </Text>
                  <Button
                    size="sm"
                    fontSize="xs"
                    fontWeight={500}
                    px={3}
                    bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                    shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                    color="#131D53"
                    _hover={{
                      bgGradient:
                        'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                      shadow:
                        '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                    }}
                    onClick={() => router.push('/accountant/digital-accounts')}
                    w="full"
                  >
                    Ver Contas
                  </Button>
                </Box>
              )}

              {isLoadingBillings ? (
                <Skeleton height="80px" borderRadius="12px" />
              ) : (
                <Box className="p-3 bg-white flex flex-col gap-3 border border-[#dee6f2] rounded-xl container-shadow">
                  <HStack gap={3}>
                    <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm">
                      <FileText size={16} color="#1F70F1" />
                    </Box>
                    <Text className="text-xs text-[#131d5399]">
                      Histórico de Faturas (30 dias)
                    </Text>
                  </HStack>
                  <HStack gap={2} align="center">
                    <Text className="text-sm text-[#131d53]">
                      {totalBillings}
                    </Text>
                    {pendingBillingsCount > 0 && (
                      <Badge
                        colorScheme="yellow"
                        fontSize="xs"
                        px={2}
                        py={1}
                        borderRadius="6px"
                        fontWeight="600"
                      >
                        {pendingBillingsCount}{' '}
                        {pendingBillingsCount === 1
                          ? 'fatura pendente'
                          : 'faturas pendentes'}
                      </Badge>
                    )}
                  </HStack>
                  <Button
                    size="sm"
                    fontSize="xs"
                    fontWeight={500}
                    px={3}
                    bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                    shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                    color="#131D53"
                    _hover={{
                      bgGradient:
                        'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                      shadow:
                        '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                    }}
                    onClick={() => router.push('/accountant/financial')}
                    w="full"
                  >
                    Gerenciar Faturas
                  </Button>
                </Box>
              )}
            </Box>
          </VStack>
        </PageContent>
      </AppLayout>
    </>
  )
}
