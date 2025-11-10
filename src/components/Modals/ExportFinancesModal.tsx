import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  Checkbox,
  Box,
  useToast,
  Divider,
  Select,
  Input,
} from '@chakra-ui/react'
import { Download, Calendar, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { BrandFinancesService } from '@/services/brand-finances'
import {
  periodToDateRange,
  customDateToRange,
  formatDateSafe,
} from '@/utils/periodUtils'

interface ExportFinancesModalProps {
  isOpen: boolean
  onClose: () => void
  currentPeriod: string
  brandPeriods?: Record<string, string>
  customDateRange?: {
    start_date: string
    end_date: string
  }
}

const FIELD_OPTIONS = [
  { value: 'product', label: 'Produto' },
  { value: 'price', label: 'Valor do produto' },
  { value: 'affiliate', label: 'Afiliado' },
  { value: 'categories', label: 'Categorias' },
  { value: 'email', label: 'Email' },
  { value: 'commission', label: 'Valor da comissão' },
  { value: 'percent', label: 'Percentual de comissão' },
]

const PERIOD_OPTIONS = [
  { value: 'current_month', label: 'Mês atual' },
  { value: 'previous_month', label: 'Mês anterior' },
  { value: 'last_3_months', label: 'Últimos 3 meses' },
  { value: 'custom', label: 'Personalizado' },
]

export function ExportFinancesModal({
  isOpen,
  onClose,
  currentPeriod,
  brandPeriods,
  customDateRange: parentCustomDateRange,
}: ExportFinancesModalProps) {
  const toast = useToast()
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const brandFinancesService = new BrandFinancesService()

  const [customDateRange, setCustomDateRange] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  })
  const [showCustomDateInputs, setShowCustomDateInputs] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (
        currentPeriod &&
        currentPeriod !== 'all' &&
        currentPeriod !== 'custom'
      ) {
        setSelectedPeriod(currentPeriod)
        setShowCustomDateInputs(false)
      } else if (currentPeriod === 'custom') {
        setSelectedPeriod('custom')
        setShowCustomDateInputs(true)

        if (parentCustomDateRange) {
          setCustomDateRange(parentCustomDateRange)
        }
      } else {
        setSelectedPeriod('')
        setShowCustomDateInputs(false)
      }
    }
  }, [isOpen, currentPeriod, parentCustomDateRange])

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod)
    setShowCustomDateInputs(newPeriod === 'custom')
  }

  const handleFieldToggle = (fieldValue: string) => {
    setSelectedFields((prev) => {
      if (prev.includes(fieldValue)) {
        return prev.filter((f) => f !== fieldValue)
      }
      return [...prev, fieldValue]
    })
  }

  const handleSelectAll = () => {
    if (selectedFields.length === FIELD_OPTIONS.length) {
      setSelectedFields([])
    } else {
      setSelectedFields(FIELD_OPTIONS.map((f) => f.value))
    }
  }

  const handleExport = async () => {
    if (!selectedPeriod) {
      toast({
        title: 'Período obrigatório',
        description: 'Por favor, selecione um período para exportar.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (selectedPeriod === 'custom') {
      if (!customDateRange.start_date || !customDateRange.end_date) {
        toast({
          title: 'Datas obrigatórias',
          description: 'Por favor, preencha as datas de início e fim.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }
    }

    setIsExporting(true)

    try {
      let periodForApi: string

      if (selectedPeriod === 'custom') {
        periodForApi = customDateToRange(
          customDateRange.start_date,
          customDateRange.end_date
        )
      } else {
        const converted = periodToDateRange(selectedPeriod)
        if (!converted) {
          toast({
            title: 'Período inválido',
            description: 'Não foi possível processar o período selecionado.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
          setIsExporting(false)
          return
        }
        periodForApi = converted
      }

      const fields =
        selectedFields.length > 0 ? selectedFields.join(',') : undefined

      const result = await brandFinancesService.exportBrandFinances({
        period: periodForApi,
        fields,
      })

      if (result.status === 200 && result.response) {
        const blob = new Blob([result.response], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = `relatorio-${periodForApi.replace(/:/g, '-')}.csv`
        document.body.appendChild(link)
        link.click()

        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast({
          title: 'Exportação concluída!',
          description: 'O download do arquivo foi iniciado.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        onClose()
        setSelectedFields([])
      } else {
        throw new Error(`Erro ao exportar dados (Status: ${result.status})`)
      }
    } catch (error: any) {
      console.error('Erro ao exportar finanças:', error)
      toast({
        title: 'Erro ao exportar',
        description: error.message || 'Não foi possível exportar os dados.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleClose = () => {
    if (!isExporting) {
      setSelectedFields([])
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      size={{ base: 'sm', md: 'md' }}
    >
      <ModalOverlay />
      <ModalContent
        rounded={16}
        p={{ base: 3, md: 4 }}
        mx={{ base: 4, md: 0 }}
        my={{ base: 4, md: 0 }}
      >
        <ModalCloseButton isDisabled={isExporting} />
        <ModalHeader pb={2} px={{ base: 0, md: 0 }}>
          <VStack spacing={1} align="start">
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight={600}
              color="#131D53"
            >
              Exportar Finanças
            </Text>
            <Text
              fontSize={{ base: 'xs', md: 'sm' }}
              fontWeight={400}
              color="#131D5399"
            >
              Personalize os dados que deseja exportar
            </Text>
          </VStack>
        </ModalHeader>

        <ModalBody px={0} py={{ base: 3, md: 4 }}>
          <VStack spacing={4} align="stretch">
            {/* Seletor de Período */}
            <Box>
              <Text fontSize="sm" fontWeight={500} color="#131D53" mb={2}>
                Período{' '}
                <Text as="span" color="red.500">
                  *
                </Text>
              </Text>
              <Select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                placeholder="Selecione um período"
                size="md"
                borderColor="#DEE6F2"
                _hover={{ borderColor: '#C5CDDC' }}
                _focus={{
                  borderColor: '#1F70F1',
                  boxShadow: '0 0 0 1px #1F70F1',
                }}
                icon={<Calendar size={16} />}
                isDisabled={isExporting}
              >
                {PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {brandPeriods?.[option.value] || option.label}
                  </option>
                ))}
              </Select>

              {!selectedPeriod && (
                <Box display="flex" alignItems="center" gap={1} mt={2}>
                  <AlertCircle size={14} color="#E53E3E" />
                  <Text fontSize="xs" color="red.500">
                    Selecione um período para continuar
                  </Text>
                </Box>
              )}

              {/* Inputs de data customizada */}
              {showCustomDateInputs && (
                <VStack spacing={3} mt={3} align="stretch">
                  <Box
                    display="flex"
                    gap={2}
                    flexDirection={{ base: 'column', md: 'row' }}
                  >
                    <Box flex={1}>
                      <Text
                        fontSize="sm"
                        fontWeight={500}
                        color="#131D53"
                        mb={2}
                      >
                        Data de Início{' '}
                        <Text as="span" color="red.500">
                          *
                        </Text>
                      </Text>
                      <Input
                        type="date"
                        value={customDateRange.start_date}
                        onChange={(e) =>
                          setCustomDateRange((prev) => ({
                            ...prev,
                            start_date: e.target.value,
                          }))
                        }
                        max={customDateRange.end_date}
                        size="md"
                        borderColor="#DEE6F2"
                        _hover={{ borderColor: '#C5CDDC' }}
                        _focus={{
                          borderColor: '#1F70F1',
                          boxShadow: '0 0 0 1px #1F70F1',
                        }}
                        isDisabled={isExporting}
                      />
                    </Box>
                    <Box flex={1}>
                      <Text
                        fontSize="sm"
                        fontWeight={500}
                        color="#131D53"
                        mb={2}
                      >
                        Data de Fim{' '}
                        <Text as="span" color="red.500">
                          *
                        </Text>
                      </Text>
                      <Input
                        type="date"
                        value={customDateRange.end_date}
                        onChange={(e) =>
                          setCustomDateRange((prev) => ({
                            ...prev,
                            end_date: e.target.value,
                          }))
                        }
                        min={customDateRange.start_date}
                        size="md"
                        borderColor="#DEE6F2"
                        _hover={{ borderColor: '#C5CDDC' }}
                        _focus={{
                          borderColor: '#1F70F1',
                          boxShadow: '0 0 0 1px #1F70F1',
                        }}
                        isDisabled={isExporting}
                      />
                    </Box>
                  </Box>
                  <Box bg="blue.50" p={3} borderRadius="md">
                    <Text fontSize="xs" color="blue.700">
                      <strong>Período selecionado:</strong>{' '}
                      {formatDateSafe(customDateRange.start_date)} até{' '}
                      {formatDateSafe(customDateRange.end_date)}
                    </Text>
                  </Box>
                </VStack>
              )}
            </Box>

            <Divider />

            {/* Campos para Exportar */}
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Text fontSize="sm" fontWeight={500} color="#131D53">
                  Campos para exportar
                </Text>
                <Button
                  size="xs"
                  variant="ghost"
                  color="#1F70F1"
                  fontWeight={500}
                  onClick={handleSelectAll}
                  _hover={{ bg: '#F7FAFC' }}
                  isDisabled={isExporting}
                >
                  {selectedFields.length === FIELD_OPTIONS.length
                    ? 'Desmarcar todos'
                    : 'Selecionar todos'}
                </Button>
              </Box>

              <VStack spacing={2} align="stretch">
                {FIELD_OPTIONS.map((field) => (
                  <Checkbox
                    key={field.value}
                    isChecked={selectedFields.includes(field.value)}
                    onChange={() => handleFieldToggle(field.value)}
                    colorScheme="blue"
                    size="sm"
                    isDisabled={isExporting}
                  >
                    <Text fontSize="sm" color="#131D53">
                      {field.label}
                    </Text>
                  </Checkbox>
                ))}
              </VStack>

              <Text fontSize="xs" color="#131D5399" mt={3}>
                {selectedFields.length === 0
                  ? 'Nenhum campo selecionado. Todos os campos serão exportados por padrão.'
                  : `${selectedFields.length} campo${
                      selectedFields.length > 1 ? 's' : ''
                    } selecionado${selectedFields.length > 1 ? 's' : ''}`}
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter px={0} pt={2}>
          <Box
            w="full"
            display="flex"
            gap={2}
            flexDirection={{ base: 'column', md: 'row' }}
          >
            <Button
              flex={{ base: 'none', md: 1 }}
              w={{ base: 'full', md: 'auto' }}
              size={{ base: 'sm', md: 'md' }}
              fontSize={{ base: 'xs', md: 'sm' }}
              fontWeight={500}
              variant="outline"
              color="#131D53"
              borderColor="#DEE6F2"
              bgColor="white"
              _hover={{
                bgColor: '#F7FAFC',
                borderColor: '#C5CDDC',
              }}
              onClick={handleClose}
              isDisabled={isExporting}
            >
              Cancelar
            </Button>
            <Button
              flex={{ base: 'none', md: 1 }}
              w={{ base: 'full', md: 'auto' }}
              size={{ base: 'sm', md: 'md' }}
              fontSize={{ base: 'xs', md: 'sm' }}
              fontWeight={500}
              color="white"
              bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
              shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
              _hover={{
                bgGradient:
                  'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                shadow:
                  '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
              }}
              transition="all 0.2s ease"
              onClick={handleExport}
              leftIcon={<Download size={16} />}
              isLoading={isExporting}
              loadingText="Exportando..."
              isDisabled={!selectedPeriod}
            >
              Exportar
            </Button>
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
