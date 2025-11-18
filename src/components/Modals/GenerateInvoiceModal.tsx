import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
} from '@chakra-ui/react'
import { MonthlyFeeTab } from '@/components/Features/accountant/MonthlyFeeTab'
import { TakeRateTab } from '@/components/Features/accountant/TakeRateTab'
import { CommissionTab } from '@/components/Features/accountant/CommissionTab'
import { useAccountantBillings } from '@/hooks/useAccountantBillings'
import {
  AccountantListMonthlyFee,
  AccountantListTakeRate,
} from '@/services/types/accountant-billing.types'

interface GenerateInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  brandId: number | undefined
  month: string
  monthlyFeeData: AccountantListMonthlyFee | null
  takeRateData: AccountantListTakeRate | null
}

export function GenerateInvoiceModal({
  isOpen,
  onClose,
  brandId,
  month,
  monthlyFeeData,
  takeRateData,
}: GenerateInvoiceModalProps) {
  const { createBilling, createInvoice, isCreatingBilling, isCreatingInvoice } =
    useAccountantBillings()

  const handleGenerateMonthlyFee = async (dueDate: string, amount: string) => {
    if (!brandId) return

    await createBilling({
      brand_id: brandId,
      type: 'monthly_fee',
      month,
      due_date: dueDate,
      total_amount: parseFloat(amount),
    })
  }

  const handleGenerateTakeRate = async (dueDate: string, amount: string) => {
    if (!brandId) return

    await createBilling({
      brand_id: brandId,
      type: 'take_rate',
      month,
      due_date: dueDate,
      total_amount: parseFloat(amount),
    })
  }

  const handleGenerateCommission = async (period: string, dueDate: string) => {
    if (!brandId) return

    await createInvoice(brandId, period)
  }

  if (!brandId) {
    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text fontSize="md" color="#131D53" fontWeight="600">
            Gerar Fatura
          </Text>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <Tabs variant="soft-rounded" colorScheme="blue">
            <TabList>
              <Tab fontSize="xs">Mensalidade</Tab>
              <Tab fontSize="xs">Take Rate</Tab>
              <Tab fontSize="xs">Comissionamento</Tab>
            </TabList>

            <TabPanels mt={4}>
              <TabPanel p={0}>
                <MonthlyFeeTab
                  data={monthlyFeeData}
                  brandId={brandId}
                  month={month}
                  onGenerateInvoice={handleGenerateMonthlyFee}
                  isGenerating={isCreatingBilling}
                />
              </TabPanel>

              <TabPanel p={0}>
                <TakeRateTab
                  data={takeRateData}
                  brandId={brandId}
                  month={month}
                  onGenerateInvoice={handleGenerateTakeRate}
                  isGenerating={isCreatingBilling}
                />
              </TabPanel>

              <TabPanel p={0}>
                <CommissionTab
                  brandId={brandId}
                  month={month}
                  onGenerateInvoice={handleGenerateCommission}
                  isGenerating={isCreatingInvoice}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
