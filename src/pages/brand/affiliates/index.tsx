'use client'

import Head from 'next/head'
import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  Badge,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  VStack,
  useDisclosure,
  FormControl,
  FormLabel,
  Select,
  Checkbox,
  Avatar,
  Skeleton,
  useToast,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import {
  Users,
  UserPlus,
  Plus,
  Search,
  Filter,
  Ellipsis,
  Ban,
  Power,
  Link2,
  Settings,
  Edit3,
  AlertTriangle,
} from 'lucide-react'
import { Pagination } from '@/components/UI'
import { useAffiliates } from '@/hooks/useAffiliates'
import type { AffiliateStatus } from '@/services/types/affiliates.types'
import { formatDate } from '@/utils/formatters'
import { formatCurrency } from '@/utils/formatToCurrency'
import { AffiliateLinksModal } from '@/components/Modals/AffiliateLinksModal'
import { AffiliatesService } from '@/services/affiliates'

const STATUS_LABELS: Record<AffiliateStatus, string> = {
  new: 'Novo',
  enabled: 'Ativo',
  disabled: 'Desativado',
  blocked: 'Bloqueado',
}

const STATUS_COLORS: Record<AffiliateStatus, string> = {
  new: 'blue',
  enabled: 'green',
  disabled: 'gray',
  blocked: 'red',
}

function AffiliatesLoadingSkeleton() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={3}
      p={3}
      pb={4}
      border="1px solid #DEE6F2"
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      className="container-shadow"
    >
      <Flex
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        flexDirection={{ base: 'column', md: 'row' }}
        gap={{ base: 3, md: 0 }}
      >
        <Text fontSize="sm" color="#131d53" pl={3}>
          Lista de Afiliados
        </Text>
        <HStack spacing={3} pl={3}>
          <HStack spacing={1} align="center">
            <Text fontSize="12px" color="#131D5399" fontWeight="400">
              Ativos:
            </Text>
            <Skeleton height="24px" width="40px" borderRadius="4px" />
          </HStack>
          <HStack spacing={1} align="center">
            <Text fontSize="12px" color="#131D5399" fontWeight="400">
              Desativados:
            </Text>
            <Skeleton height="24px" width="40px" borderRadius="4px" />
          </HStack>
          <HStack spacing={1} align="center">
            <Text fontSize="12px" color="#131D5399" fontWeight="400">
              Bloqueados:
            </Text>
            <Skeleton height="24px" width="40px" borderRadius="4px" />
          </HStack>
        </HStack>
      </Flex>

      <Box
        border="1px solid #DEE6F2"
        borderRadius="md"
        overflow="hidden"
        position="relative"
      >
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th px={4} fontSize="xs">
                  <Skeleton height="12px" width="60px" />
                </Th>
                <Th px={4} fontSize="xs" maxW="300px">
                  <Skeleton height="12px" width="50px" />
                </Th>
                <Th px={4} fontSize="xs">
                  <Skeleton height="12px" width="50px" />
                </Th>
                <Th px={4} fontSize="xs">
                  <Skeleton height="12px" width="80px" />
                </Th>
                <Th px={4} fontSize="xs">
                  <Skeleton height="12px" width="50px" />
                </Th>
                <Th px={8} w={{ base: '86px', md: 'auto' }} />
              </Tr>
            </Thead>
            <Tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <Tr key={i} borderTop="1px solid #DEE6F2">
                  <Td px={4}>
                    <HStack spacing={2}>
                      <Skeleton
                        height="32px"
                        width="32px"
                        borderRadius="full"
                      />
                      <Box>
                        <Skeleton height="16px" width="120px" mb={1} />
                        <Skeleton height="12px" width="80px" />
                      </Box>
                    </HStack>
                  </Td>
                  <Td px={4} maxW="300px">
                    <Skeleton height="16px" width="180px" />
                  </Td>
                  <Td px={4}>
                    <Skeleton height="16px" width="80px" mx="auto" />
                  </Td>
                  <Td px={4}>
                    <Skeleton height="16px" width="100px" />
                  </Td>
                  <Td px={4}>
                    <Skeleton
                      height="24px"
                      width="80px"
                      borderRadius="6px"
                      mx="auto"
                    />
                  </Td>
                  <Td px={4}>
                    <Flex
                      align="center"
                      justify="end"
                      gap={2}
                      display={{ base: 'none', md: 'flex' }}
                    >
                      <Skeleton height="32px" width="90px" borderRadius="6px" />
                      <Skeleton
                        height="32px"
                        width="100px"
                        borderRadius="6px"
                      />
                    </Flex>
                    <Box
                      display={{ base: 'flex', md: 'none' }}
                      justifyContent="end"
                    >
                      <Skeleton height="28px" width="36px" borderRadius="6px" />
                    </Box>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}

export default function BrandAffiliatesPage() {
  const toast = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15
  const [searchName, setSearchName] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [searchReferredBy, setSearchReferredBy] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')

  const [debouncedSearchName, setDebouncedSearchName] = useState('')
  const [debouncedSearchEmail, setDebouncedSearchEmail] = useState('')
  const [debouncedSearchReferredBy, setDebouncedSearchReferredBy] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchName(searchName)
      setDebouncedSearchEmail(searchEmail)
      setDebouncedSearchReferredBy(searchReferredBy)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchName, searchEmail, searchReferredBy])

  const {
    data: affiliates,
    loading,
    error,
    stats,
    meta,
    refetch,
  } = useAffiliates({
    page: currentPage,
    perpage: itemsPerPage,
    name: debouncedSearchName || undefined,
    email: debouncedSearchEmail || undefined,
    parent_name: debouncedSearchReferredBy || undefined,
    status:
      statusFilter !== 'todos' ? (statusFilter as AffiliateStatus) : undefined,
  })

  const {
    isOpen: isNewAffiliatesOpen,
    onOpen: onNewAffiliatesOpen,
    onClose: onNewAffiliatesClose,
  } = useDisclosure()
  const [newAffSearchName, setNewAffSearchName] = useState('')
  const [newAffSearchEmail, setNewAffSearchEmail] = useState('')
  const [newAffSearchReferredBy, setNewAffSearchReferredBy] = useState('')
  const [newAffCurrentPage, setNewAffCurrentPage] = useState(1)
  const newAffItemsPerPage = 10

  const [debouncedNewAffSearchName, setDebouncedNewAffSearchName] = useState('')
  const [debouncedNewAffSearchEmail, setDebouncedNewAffSearchEmail] =
    useState('')
  const [debouncedNewAffSearchReferredBy, setDebouncedNewAffSearchReferredBy] =
    useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNewAffSearchName(newAffSearchName)
      setDebouncedNewAffSearchEmail(newAffSearchEmail)
      setDebouncedNewAffSearchReferredBy(newAffSearchReferredBy)
      setNewAffCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [newAffSearchName, newAffSearchEmail, newAffSearchReferredBy])

  const {
    isOpen: isAddAffiliateOpen,
    onOpen: onAddAffiliateOpen,
    onClose: onAddAffiliateClose,
  } = useDisclosure()
  const [allowReferral, setAllowReferral] = useState(false)
  const [affiliateName, setAffiliateName] = useState('')
  const [affiliateEmail, setAffiliateEmail] = useState('')
  const [socialNetwork, setSocialNetwork] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [cpf, setCpf] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [hasCustomCommission, setHasCustomCommission] = useState(false)
  const [customCommission, setCustomCommission] = useState('')
  const [referralCommission, setReferralCommission] = useState('')
  const [parentAffiliate, setParentAffiliate] = useState('')
  const [mastersList, setMastersList] = useState<
    Array<{ id: number; name: string }>
  >([])
  const [loadingMasters, setLoadingMasters] = useState(false)
  const [isSavingAffiliate, setIsSavingAffiliate] = useState(false)

  const [nameError, setNameError] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [cpfError, setCpfError] = useState(false)
  const [phoneError, setPhoneError] = useState(false)
  const [birthDateError, setBirthDateError] = useState(false)

  const {
    isOpen: isEditAffiliateOpen,
    onOpen: onEditAffiliateOpen,
    onClose: onEditAffiliateClose,
  } = useDisclosure()
  const [selectedAffiliateId, setSelectedAffiliateId] = useState<number | null>(
    null
  )
  const [selectedAffiliateAvatar, setSelectedAffiliateAvatar] = useState<
    string | undefined
  >(undefined)
  const [selectedAffiliateAge, setSelectedAffiliateAge] = useState<string>('')
  const [availableParents, setAvailableParents] = useState<
    Array<{ id: number; name: string }>
  >([])

  const {
    isOpen: isLinksModalOpen,
    onOpen: onLinksModalOpen,
    onClose: onLinksModalClose,
  } = useDisclosure()
  const [selectedAffiliateForLinks, setSelectedAffiliateForLinks] = useState<{
    id: number
    name: string
  } | null>(null)

  const {
    isOpen: isBlockModalOpen,
    onOpen: onBlockModalOpen,
    onClose: onBlockModalClose,
  } = useDisclosure()
  const [affiliateToBlock, setAffiliateToBlock] = useState<{
    id: number
    name: string
    email: string
    avatar: string | undefined
    status: AffiliateStatus
  } | null>(null)
  const [isBlockingAffiliate, setIsBlockingAffiliate] = useState(false)

  const {
    isOpen: isToggleStatusModalOpen,
    onOpen: onToggleStatusModalOpen,
    onClose: onToggleStatusModalClose,
  } = useDisclosure()
  const [affiliateToToggle, setAffiliateToToggle] = useState<{
    id: number
    name: string
    email: string
    avatar: string | undefined
    status: AffiliateStatus
  } | null>(null)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  const {
    isOpen: isApproveModalOpen,
    onOpen: onApproveModalOpen,
    onClose: onApproveModalClose,
  } = useDisclosure()
  const [affiliateToApprove, setAffiliateToApprove] = useState<{
    id: number
    name: string
    email: string
    avatar: string | undefined
  } | null>(null)
  const [isApprovingAffiliate, setIsApprovingAffiliate] = useState(false)

  const {
    isOpen: isRejectModalOpen,
    onOpen: onRejectModalOpen,
    onClose: onRejectModalClose,
  } = useDisclosure()
  const [affiliateToReject, setAffiliateToReject] = useState<{
    id: number
    name: string
    email: string
    avatar: string | undefined
  } | null>(null)
  const [isRejectingAffiliate, setIsRejectingAffiliate] = useState(false)

  const activeCount = stats?.actives || 0
  const inactiveCount = stats?.inactives || 0
  const blockedCount = stats?.blockeds || 0
  const newAffiliatesCount = stats?.new || 0
  const totalAffiliates = stats?.total || 0

  const totalPages = meta?.last_page || 1

  const startItem = meta ? (meta.current_page - 1) * meta.pagesize + 1 : 1
  const endItem = meta
    ? Math.min(meta.current_page * meta.pagesize, meta.total_items)
    : affiliates.length

  const formatCommissionDisplay = (value: string): string => {
    if (!value) return ''

    const cleaned = value.replace(/[^\d.,]/g, '')

    const normalized = cleaned.replace(',', '.')

    const num = parseFloat(normalized)

    if (isNaN(num)) return value

    return num.toFixed(2).replace('.', ',')
  }

  const handleAddAffiliate = async () => {
    setLoadingMasters(true)
    try {
      const affiliatesService = new AffiliatesService()
      const { response, status } = await affiliatesService.getMasters()

      if (status === 200 && response?.success && response.data) {
        setMastersList(response.data)
      } else {
        setMastersList([])
        toast({
          title: 'Aviso',
          description:
            'Não foi possível carregar a lista de afiliados mestres.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Erro ao buscar masters:', error)
      setMastersList([])
    } finally {
      setLoadingMasters(false)
    }

    onAddAffiliateOpen()
  }

  const handleSaveAffiliate = async () => {
    setNameError(false)
    setEmailError(false)
    setCpfError(false)
    setPhoneError(false)
    setBirthDateError(false)

    let hasError = false

    if (!affiliateName.trim()) {
      setNameError(true)
      hasError = true
    }

    if (!affiliateEmail.trim()) {
      setEmailError(true)
      hasError = true
    }

    if (!cpf.trim()) {
      setCpfError(true)
      hasError = true
    }

    if (!phone.trim()) {
      setPhoneError(true)
      hasError = true
    }

    if (!birthDate.trim()) {
      setBirthDateError(true)
      hasError = true
    }

    if (hasError) {
      toast({
        title: 'Campos obrigatórios',
        description:
          'Por favor, preencha todos os campos obrigatórios marcados em vermelho.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      })
      return
    }

    setIsSavingAffiliate(true)

    try {
      const affiliatesService = new AffiliatesService()

      let commissionOverReferred: string | null = null
      if (allowReferral) {
        if (referralCommission && referralCommission.trim() !== '') {
          commissionOverReferred = parseFloat(
            referralCommission.replace(',', '.')
          ).toFixed(2)
        } else {
          commissionOverReferred = '0.00'
        }
      }

      const result = await affiliatesService.createAffiliate({
        name: affiliateName,
        email: affiliateEmail,
        avatar: '',
        cpf: cpf.replace(/\D/g, ''),
        phone,
        birthdate: birthDate,
        password: '',
        password_confirmation: '',
        custom_commission: hasCustomCommission
          ? parseFloat(customCommission.replace(',', '.')).toFixed(2)
          : null,
        can_have_referrals: allowReferral,
        commission_over_referred: commissionOverReferred,
        selected_parent: parentAffiliate || null,
        status: 'new',
      })

      if (result.response?.success) {
        toast({
          title: 'Sucesso',
          description: 'Afiliado criado com sucesso!',
          status: 'success',
          duration: 4000,
          isClosable: true,
        })
        handleCancelAddAffiliate()

        refetch()
      } else {
        toast({
          title: 'Erro ao criar afiliado',
          description:
            result.response?.message ||
            'Não foi possível criar o afiliado. Tente novamente.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Erro ao criar afiliado:', error)
      toast({
        title: 'Erro ao criar afiliado',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setIsSavingAffiliate(false)
    }
  }

  const handleCancelAddAffiliate = () => {
    setAllowReferral(false)
    setAffiliateName('')
    setAffiliateEmail('')
    setSocialNetwork('')
    setCompanyName('')
    setCpf('')
    setCnpj('')
    setPhone('')
    setBirthDate('')
    setHasCustomCommission(false)
    setCustomCommission('')
    setReferralCommission('')
    setParentAffiliate('')

    setNameError(false)
    setEmailError(false)
    setCpfError(false)
    setPhoneError(false)
    setBirthDateError(false)

    onAddAffiliateClose()
  }

  const handleBlock = (affiliateId: number) => {
    const affiliate = affiliates.find((aff) => aff.id === affiliateId)
    if (affiliate) {
      setAffiliateToBlock({
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        avatar: affiliate.avatar,
        status: affiliate.status,
      })
      onBlockModalOpen()
    }
  }

  const handleConfirmBlock = async () => {
    if (!affiliateToBlock) return

    setIsBlockingAffiliate(true)

    try {
      const affiliatesService = new AffiliatesService()
      const newStatus =
        affiliateToBlock.status === 'blocked' ? 'enabled' : 'blocked'

      const { response, status } = await affiliatesService.updateAffiliate({
        id: affiliateToBlock.id,
        status: newStatus,
      })

      if (status === 200 && response?.success) {
        toast({
          title:
            newStatus === 'blocked'
              ? 'Afiliado bloqueado com sucesso'
              : 'Afiliado desbloqueado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        await refetch()

        setIsBlockingAffiliate(false)
        onBlockModalClose()
        setAffiliateToBlock(null)
      } else {
        setIsBlockingAffiliate(false)
        throw new Error('Falha ao atualizar status')
      }
    } catch (error) {
      setIsBlockingAffiliate(false)
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status. Tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleToggleStatus = (affiliateId: number) => {
    const affiliate = affiliates.find((aff) => aff.id === affiliateId)
    if (affiliate) {
      setAffiliateToToggle({
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        avatar: affiliate.avatar,
        status: affiliate.status,
      })
      onToggleStatusModalOpen()
    }
  }

  const handleConfirmToggleStatus = async () => {
    if (!affiliateToToggle) return

    setIsTogglingStatus(true)

    try {
      const affiliatesService = new AffiliatesService()
      const newStatus =
        affiliateToToggle.status === 'enabled' ? 'disabled' : 'enabled'

      const { response, status } = await affiliatesService.updateAffiliate({
        id: affiliateToToggle.id,
        status: newStatus,
      })

      if (status === 200 && response?.success) {
        toast({
          title:
            newStatus === 'enabled'
              ? 'Afiliado ativado com sucesso'
              : 'Afiliado desativado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        await refetch()

        setIsTogglingStatus(false)
        onToggleStatusModalClose()
        setAffiliateToToggle(null)
      } else {
        setIsTogglingStatus(false)
        throw new Error('Falha ao atualizar status')
      }
    } catch (error) {
      setIsTogglingStatus(false)
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status. Tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleViewLinks = (affiliateId: number) => {
    const affiliate = affiliates.find((aff) => aff.id === affiliateId)
    if (affiliate) {
      setSelectedAffiliateForLinks({
        id: affiliate.id,
        name: affiliate.name,
      })
      onLinksModalOpen()
    }
  }

  const handleManage = async (affiliateId: number) => {
    try {
      const affiliatesService = new (
        await import('@/services/affiliates')
      ).AffiliatesService()
      const result = await affiliatesService.getAffiliate({ id: affiliateId })

      if (result.response?.success && result.response.data) {
        const affiliateData = result.response.data
        setSelectedAffiliateId(affiliateId)

        setAffiliateName(affiliateData.name)
        setAffiliateEmail(affiliateData.email)
        setSelectedAffiliateAvatar(affiliateData.avatar)

        if (affiliateData.birthdate) {
          const birthDate = new Date(affiliateData.birthdate)
          const today = new Date()
          const age = today.getFullYear() - birthDate.getFullYear()
          setSelectedAffiliateAge(`${age}`)
        } else {
          setSelectedAffiliateAge('')
        }

        setSocialNetwork(affiliateData.social_network || '')
        setCompanyName(affiliateData.business_name || '')
        setCpf(affiliateData.cpf || '')
        setCnpj(affiliateData.business_cnpj || '')
        setPhone(affiliateData.phone || '')
        setBirthDate(affiliateData.birthdate || '')
        setHasCustomCommission(!!affiliateData.custom_commission)

        setCustomCommission(
          affiliateData.custom_commission
            ? parseFloat(affiliateData.custom_commission.toString())
                .toFixed(2)
                .replace('.', ',')
            : ''
        )
        setParentAffiliate(affiliateData.parent_id?.toString() || '')
        setAllowReferral(affiliateData.can_have_referrals || false)

        setReferralCommission(
          affiliateData.commission_over_referred
            ? parseFloat(affiliateData.commission_over_referred.toString())
                .toFixed(2)
                .replace('.', ',')
            : ''
        )
        setAvailableParents(affiliateData.available_parents || [])

        onEditAffiliateOpen()
      } else {
        toast({
          title: 'Erro ao carregar dados do afiliado',
          description: 'Não foi possível carregar as informações do afiliado.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Erro ao buscar afiliado:', error)
      toast({
        title: 'Erro ao carregar dados',
        description: 'Ocorreu um erro inesperado.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    }
  }

  const handleSaveEditAffiliate = async () => {
    if (!selectedAffiliateId) return

    try {
      const affiliatesService = new (
        await import('@/services/affiliates')
      ).AffiliatesService()

      let commissionOverReferred: string | null = null
      if (allowReferral) {
        if (referralCommission && referralCommission.trim() !== '') {
          commissionOverReferred = parseFloat(
            referralCommission.replace(',', '.')
          ).toFixed(2)
        } else {
          commissionOverReferred = '0.00'
        }
      }

      const result = await affiliatesService.updateAffiliate({
        id: selectedAffiliateId,
        name: affiliateName,
        avatar: selectedAffiliateAvatar || '',
        cpf,
        business_cnpj: cnpj,
        business_name: companyName,
        phone,
        birthdate: birthDate,
        custom_commission: hasCustomCommission
          ? parseFloat(customCommission.replace(',', '.')).toFixed(2)
          : null,
        can_have_referrals: allowReferral,
        commission_over_referred: commissionOverReferred,
        selected_parent: parentAffiliate ? Number(parentAffiliate) : null,
      })

      if (result.response?.success) {
        toast({
          title: 'Sucesso',
          description: 'Dados do afiliado atualizados com sucesso!',
          status: 'success',
          duration: 4000,
          isClosable: true,
        })
        handleCancelEditAffiliate()

        refetch()
      } else {
        toast({
          title: 'Erro ao atualizar',
          description:
            result.response?.message ||
            'Não foi possível atualizar os dados do afiliado.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar afiliado:', error)
      toast({
        title: 'Erro ao atualizar',
        description: 'Ocorreu um erro inesperado.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    }
  }

  const handleCancelEditAffiliate = () => {
    setSelectedAffiliateId(null)
    setSelectedAffiliateAvatar(undefined)
    setSelectedAffiliateAge('')
    setAllowReferral(false)
    setAffiliateName('')
    setAffiliateEmail('')
    setSocialNetwork('')
    setCompanyName('')
    setCpf('')
    setCnpj('')
    setPhone('')
    setBirthDate('')
    setHasCustomCommission(false)
    setCustomCommission('')
    setReferralCommission('')
    setParentAffiliate('')
    onEditAffiliateClose()
  }

  const handleNewAffiliates = () => {
    onNewAffiliatesOpen()
  }

  const {
    data: newAffiliates,
    loading: newAffLoading,
    meta: newAffMeta,
    refetch: refetchNewAffiliates,
  } = useAffiliates({
    page: newAffCurrentPage,
    perpage: newAffItemsPerPage,
    name: debouncedNewAffSearchName || undefined,
    email: debouncedNewAffSearchEmail || undefined,
    parent_name: debouncedNewAffSearchReferredBy || undefined,
    status: 'new',
  })

  const newAffTotalPages = newAffMeta?.last_page || 1

  const newAffStartItem = newAffMeta
    ? (newAffMeta.current_page - 1) * newAffMeta.pagesize + 1
    : 1
  const newAffEndItem = newAffMeta
    ? Math.min(
        newAffMeta.current_page * newAffMeta.pagesize,
        newAffMeta.total_items
      )
    : newAffiliates.length

  const handleApproveAffiliate = (affiliateId: number) => {
    const affiliate = newAffiliates.find((aff) => aff.id === affiliateId)
    if (affiliate) {
      setAffiliateToApprove({
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        avatar: affiliate.avatar,
      })
      onApproveModalOpen()
    }
  }

  const handleConfirmApprove = async () => {
    if (!affiliateToApprove) return

    setIsApprovingAffiliate(true)

    try {
      const affiliatesService = new AffiliatesService()

      const { response, status } = await affiliatesService.updateAffiliate({
        id: affiliateToApprove.id,
        status: 'enabled',
      })

      if (status === 200 && response?.success) {
        toast({
          title: 'Afiliado aprovado com sucesso',
          description: 'O afiliado agora pode acessar o sistema.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        await refetchNewAffiliates()
        await refetch()

        setIsApprovingAffiliate(false)
        onApproveModalClose()
        setAffiliateToApprove(null)
      } else {
        setIsApprovingAffiliate(false)
        throw new Error('Falha ao aprovar afiliado')
      }
    } catch (error) {
      setIsApprovingAffiliate(false)
      toast({
        title: 'Erro ao aprovar afiliado',
        description: 'Não foi possível aprovar o afiliado. Tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleRejectAffiliate = (affiliateId: number) => {
    const affiliate = newAffiliates.find((aff) => aff.id === affiliateId)
    if (affiliate) {
      setAffiliateToReject({
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        avatar: affiliate.avatar,
      })
      onRejectModalOpen()
    }
  }

  const handleConfirmReject = async () => {
    if (!affiliateToReject) return

    setIsRejectingAffiliate(true)

    try {
      const affiliatesService = new AffiliatesService()

      const { response, status } = await affiliatesService.updateAffiliate({
        id: affiliateToReject.id,
        status: 'disabled',
      })

      if (status === 200 && response?.success) {
        toast({
          title: 'Afiliado rejeitado com sucesso',
          description: 'O afiliado foi desativado.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        await refetchNewAffiliates()
        await refetch()

        setIsRejectingAffiliate(false)
        onRejectModalClose()
        setAffiliateToReject(null)
      } else {
        setIsRejectingAffiliate(false)
        throw new Error('Falha ao rejeitar afiliado')
      }
    } catch (error) {
      setIsRejectingAffiliate(false)
      toast({
        title: 'Erro ao rejeitar afiliado',
        description: 'Não foi possível rejeitar o afiliado. Tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <>
      <Head>
        <title>Meus Afiliados | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Box display="flex" flexDirection="column" gap={4} w="full">
            <Flex justify="space-between" align="center">
              <Flex gap={2} align="center">
                <Users size={24} color="#131D53" />
                <HStack fontSize="sm" color="#131D53">
                  <Text>Meus Afiliados:</Text>
                  <Box
                    alignContent="center"
                    justifyContent="center"
                    bgColor="#DFEFFF"
                    px={2}
                    py={0.5}
                    rounded={4}
                    lineHeight="120%"
                  >
                    {totalAffiliates}
                  </Box>
                </HStack>
              </Flex>

              <Flex gap={2} display={{ base: 'none', md: 'flex' }}>
                <Button
                  size="sm"
                  fontSize="xs"
                  fontWeight={500}
                  px={3}
                  leftIcon={<UserPlus size={16} />}
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  color="#131D53"
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                  }}
                  transition="all 0.2s ease"
                  onClick={handleNewAffiliates}
                  isDisabled={newAffiliatesCount === 0}
                  opacity={newAffiliatesCount === 0 ? 0.6 : 1}
                  cursor={newAffiliatesCount === 0 ? 'not-allowed' : 'pointer'}
                >
                  <HStack spacing={1}>
                    <Text>Novos afiliados</Text>
                    {newAffiliatesCount > 0 && (
                      <Badge
                        bg="#1F70F1"
                        color="white"
                        fontSize="10px"
                        fontWeight="600"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        minW="20px"
                        minH="20px"
                        px={1}
                      >
                        {newAffiliatesCount}
                      </Badge>
                    )}
                  </HStack>
                </Button>
                <Button
                  size="sm"
                  fontSize="xs"
                  fontWeight={500}
                  px={3}
                  py={1.5}
                  leftIcon={<Plus size={16} />}
                  color="#fff"
                  bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
                  shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                  }}
                  transition="all 0.2s ease"
                  onClick={handleAddAffiliate}
                >
                  Adicionar Afiliado
                </Button>
              </Flex>
            </Flex>

            <Flex gap={3} display={{ base: 'none', md: 'flex' }} align="center">
              <HStack
                h={8}
                position="relative"
                rounded={4}
                borderWidth={1}
                borderColor="#DEE6F2"
                gap={0}
                transition="all 0.2s"
                flex="1"
                _focusWithin={{
                  borderColor: '#1F70F1',
                  boxShadow: '0 0 0 1px #1F70F1',
                  bg: 'white',
                }}
              >
                <HStack
                  justify="center"
                  p={2}
                  w="32px"
                  h="32px"
                  borderRightWidth={1}
                  borderRightColor="#dee6f2"
                >
                  <Search color="#C5CDDC" size={16} />
                </HStack>
                <Input
                  p={2}
                  variant="unstyled"
                  placeholder="Buscar por nome ou código"
                  border="none"
                  flex="1"
                  minW="fit-content"
                  fontSize="sm"
                  _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </HStack>

              <HStack
                h={8}
                position="relative"
                rounded={4}
                borderWidth={1}
                borderColor="#DEE6F2"
                gap={0}
                transition="all 0.2s"
                flex="1"
                _focusWithin={{
                  borderColor: '#1F70F1',
                  boxShadow: '0 0 0 1px #1F70F1',
                  bg: 'white',
                }}
              >
                <HStack
                  justify="center"
                  p={2}
                  w="32px"
                  h="32px"
                  borderRightWidth={1}
                  borderRightColor="#dee6f2"
                >
                  <Search color="#C5CDDC" size={16} />
                </HStack>
                <Input
                  p={2}
                  variant="unstyled"
                  placeholder="Buscar por e-mail"
                  border="none"
                  flex="1"
                  minW="fit-content"
                  fontSize="sm"
                  _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
              </HStack>

              <HStack
                h={8}
                position="relative"
                rounded={4}
                borderWidth={1}
                borderColor="#DEE6F2"
                gap={0}
                transition="all 0.2s"
                flex="1"
                _focusWithin={{
                  borderColor: '#1F70F1',
                  boxShadow: '0 0 0 1px #1F70F1',
                  bg: 'white',
                }}
              >
                <HStack
                  justify="center"
                  p={2}
                  w="32px"
                  h="32px"
                  borderRightWidth={1}
                  borderRightColor="#dee6f2"
                >
                  <Search color="#C5CDDC" size={16} />
                </HStack>
                <Input
                  p={2}
                  variant="unstyled"
                  placeholder="Buscar por indicado"
                  border="none"
                  flex="1"
                  minW="fit-content"
                  fontSize="sm"
                  _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                  value={searchReferredBy}
                  onChange={(e) => setSearchReferredBy(e.target.value)}
                />
              </HStack>

              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  fontSize="xs"
                  fontWeight={500}
                  h={8}
                  px={3}
                  leftIcon={<Filter size={14} />}
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  color="#131D53"
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                  }}
                  transition="all 0.2s ease"
                >
                  {statusFilter === 'todos'
                    ? 'Todos'
                    : statusFilter === 'new'
                    ? 'Novo'
                    : statusFilter === 'enabled'
                    ? 'Ativo'
                    : statusFilter === 'disabled'
                    ? 'Desativado'
                    : 'Bloqueado'}
                </MenuButton>
                <MenuList>
                  <MenuItem
                    onClick={() => setStatusFilter('todos')}
                    bg={statusFilter === 'todos' ? 'blue.50' : 'transparent'}
                    color={statusFilter === 'todos' ? 'blue.600' : 'inherit'}
                    fontSize="sm"
                  >
                    Todos
                  </MenuItem>
                  <MenuItem
                    onClick={() => setStatusFilter('new')}
                    bg={statusFilter === 'new' ? 'blue.50' : 'transparent'}
                    color={statusFilter === 'new' ? 'blue.600' : 'inherit'}
                    fontSize="sm"
                  >
                    Novo
                  </MenuItem>
                  <MenuItem
                    onClick={() => setStatusFilter('enabled')}
                    bg={statusFilter === 'enabled' ? 'blue.50' : 'transparent'}
                    color={statusFilter === 'enabled' ? 'blue.600' : 'inherit'}
                    fontSize="sm"
                  >
                    Ativo
                  </MenuItem>
                  <MenuItem
                    onClick={() => setStatusFilter('disabled')}
                    bg={statusFilter === 'disabled' ? 'blue.50' : 'transparent'}
                    color={statusFilter === 'disabled' ? 'blue.600' : 'inherit'}
                    fontSize="sm"
                  >
                    Desativado
                  </MenuItem>
                  <MenuItem
                    onClick={() => setStatusFilter('blocked')}
                    bg={statusFilter === 'blocked' ? 'blue.50' : 'transparent'}
                    color={statusFilter === 'blocked' ? 'blue.600' : 'inherit'}
                    fontSize="sm"
                  >
                    Bloqueado
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>

            <Flex
              gap={3}
              flexDirection="column"
              display={{ base: 'flex', md: 'none' }}
            >
              <Flex gap={3}>
                <Button
                  size="sm"
                  fontSize="xs"
                  fontWeight={500}
                  h={8}
                  px={3}
                  flex="1"
                  leftIcon={<UserPlus size={16} />}
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  color="#131D53"
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                  }}
                  transition="all 0.2s ease"
                  onClick={handleNewAffiliates}
                  isDisabled={newAffiliatesCount === 0}
                  opacity={newAffiliatesCount === 0 ? 0.6 : 1}
                  cursor={newAffiliatesCount === 0 ? 'not-allowed' : 'pointer'}
                >
                  <HStack spacing={1}>
                    <Text>Novos afiliados</Text>
                    {newAffiliatesCount > 0 && (
                      <Badge
                        bg="#1F70F1"
                        color="white"
                        fontSize="10px"
                        fontWeight="600"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        minW="20px"
                        minH="20px"
                        px={1}
                      >
                        {newAffiliatesCount}
                      </Badge>
                    )}
                  </HStack>
                </Button>
                <Button
                  size="sm"
                  fontSize="xs"
                  fontWeight={500}
                  h={8}
                  px={3}
                  flex="1"
                  leftIcon={<Plus size={16} />}
                  color="#fff"
                  bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
                  shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                  }}
                  transition="all 0.2s ease"
                  onClick={handleAddAffiliate}
                >
                  Adicionar Afiliado
                </Button>
              </Flex>

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
                  placeholder="Buscar por nome ou código"
                  border="none"
                  flex="1"
                  fontSize="sm"
                  _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </HStack>

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
                  placeholder="Buscar por e-mail"
                  border="none"
                  flex="1"
                  fontSize="sm"
                  _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
              </HStack>

              <Flex gap={3} align="center">
                <HStack
                  h={10}
                  position="relative"
                  rounded={4}
                  borderWidth={1}
                  borderColor="#DEE6F2"
                  gap={0}
                  transition="all 0.2s"
                  flex="1"
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
                    placeholder="Buscar por indicado"
                    border="none"
                    flex="1"
                    fontSize="sm"
                    _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                    value={searchReferredBy}
                    onChange={(e) => setSearchReferredBy(e.target.value)}
                  />
                </HStack>

                <Menu>
                  <MenuButton
                    as={Button}
                    size="sm"
                    fontSize="xs"
                    fontWeight={500}
                    h={10}
                    px={3}
                    minW="auto"
                    leftIcon={<Filter size={14} />}
                    bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                    shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                    color="#131D53"
                    _hover={{
                      bgGradient:
                        'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                      shadow:
                        '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                    }}
                    transition="all 0.2s ease"
                  >
                    {statusFilter === 'todos'
                      ? 'Todos'
                      : statusFilter === 'new'
                      ? 'Novo'
                      : statusFilter === 'enabled'
                      ? 'Ativo'
                      : statusFilter === 'disabled'
                      ? 'Desativado'
                      : 'Bloqueado'}
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={() => setStatusFilter('todos')}
                      bg={statusFilter === 'todos' ? 'blue.50' : 'transparent'}
                      color={statusFilter === 'todos' ? 'blue.600' : 'inherit'}
                      fontSize="sm"
                    >
                      Todos
                    </MenuItem>
                    <MenuItem
                      onClick={() => setStatusFilter('new')}
                      bg={statusFilter === 'new' ? 'blue.50' : 'transparent'}
                      color={statusFilter === 'new' ? 'blue.600' : 'inherit'}
                      fontSize="sm"
                    >
                      Novo
                    </MenuItem>
                    <MenuItem
                      onClick={() => setStatusFilter('enabled')}
                      bg={
                        statusFilter === 'enabled' ? 'blue.50' : 'transparent'
                      }
                      color={
                        statusFilter === 'enabled' ? 'blue.600' : 'inherit'
                      }
                      fontSize="sm"
                    >
                      Ativo
                    </MenuItem>
                    <MenuItem
                      onClick={() => setStatusFilter('disabled')}
                      bg={
                        statusFilter === 'disabled' ? 'blue.50' : 'transparent'
                      }
                      color={
                        statusFilter === 'disabled' ? 'blue.600' : 'inherit'
                      }
                      fontSize="sm"
                    >
                      Desativado
                    </MenuItem>
                    <MenuItem
                      onClick={() => setStatusFilter('blocked')}
                      bg={
                        statusFilter === 'blocked' ? 'blue.50' : 'transparent'
                      }
                      color={
                        statusFilter === 'blocked' ? 'blue.600' : 'inherit'
                      }
                      fontSize="sm"
                    >
                      Bloqueado
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            </Flex>
          </Box>
        </PageHeader>

        <PageContent>
          {loading ? (
            <AffiliatesLoadingSkeleton />
          ) : error ? (
            <Box textAlign="center" py={8} color="red.500">
              <Text>Erro ao carregar afiliados: {error}</Text>
            </Box>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              gap={3}
              p={3}
              pb={4}
              border="1px solid #DEE6F2"
              bg="white"
              borderRadius="xl"
              overflow="hidden"
              className="container-shadow"
            >
              <Flex
                justify="space-between"
                align={{ base: 'flex-start', md: 'center' }}
                flexDirection={{ base: 'column', md: 'row' }}
                gap={{ base: 3, md: 0 }}
              >
                <Text fontSize="sm" color="#131d53" pl={3}>
                  Lista de Afiliados
                </Text>
                <HStack spacing={3} pl={3}>
                  <HStack spacing={1} align="center">
                    <Text fontSize="12px" color="#131D5399" fontWeight="400">
                      Ativos:
                    </Text>
                    <Badge
                      colorScheme="green"
                      fontSize="14px"
                      fontWeight="400"
                      lineHeight="120%"
                      px="8px"
                      py="2px"
                      borderRadius="4px"
                    >
                      {activeCount}
                    </Badge>
                  </HStack>
                  <HStack spacing={1} align="center">
                    <Text fontSize="12px" color="#131D5399" fontWeight="400">
                      Desativados:
                    </Text>
                    <Badge
                      colorScheme="gray"
                      fontSize="14px"
                      fontWeight="400"
                      lineHeight="120%"
                      px="8px"
                      py="2px"
                      borderRadius="4px"
                    >
                      {inactiveCount}
                    </Badge>
                  </HStack>
                  <HStack spacing={1} align="center">
                    <Text fontSize="12px" color="#131D5399" fontWeight="400">
                      Bloqueados:
                    </Text>
                    <Badge
                      colorScheme="red"
                      fontSize="14px"
                      fontWeight="400"
                      lineHeight="120%"
                      px="8px"
                      py="2px"
                      borderRadius="4px"
                    >
                      {blockedCount}
                    </Badge>
                  </HStack>
                </HStack>
              </Flex>

              {affiliates.length > 0 ? (
                <>
                  <Box
                    border="1px solid #DEE6F2"
                    borderRadius="md"
                    overflow="auto"
                    position="relative"
                  >
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th
                              px={4}
                              color="#131d53"
                              fontSize="xs"
                              textTransform="none"
                              fontWeight="normal"
                            >
                              Afiliado
                            </Th>
                            <Th
                              px={4}
                              color="#131d53"
                              fontSize="xs"
                              textTransform="none"
                              fontWeight="normal"
                              maxW="300px"
                            >
                              Email
                            </Th>
                            <Th
                              px={4}
                              color="#131d53"
                              fontSize="xs"
                              textTransform="none"
                              fontWeight="normal"
                              textAlign="center"
                            >
                              Vendas
                            </Th>
                            <Th
                              px={4}
                              color="#131d53"
                              fontSize="xs"
                              textTransform="none"
                              fontWeight="normal"
                              textAlign="center"
                            >
                              Indicado por
                            </Th>
                            <Th
                              px={4}
                              color="#131d53"
                              fontSize="xs"
                              textTransform="none"
                              fontWeight="normal"
                              textAlign="center"
                            >
                              Status
                            </Th>
                            <Th px={8} w={{ base: '86px', md: 'auto' }} />
                          </Tr>
                        </Thead>
                        <Tbody>
                          {affiliates.map((affiliate) => (
                            <Tr
                              key={affiliate.id}
                              _hover={{ bg: '#F3F6FA' }}
                              borderTop="1px solid #DEE6F2"
                              _first={{ borderTop: 'none' }}
                            >
                              <Td px={4}>
                                <HStack spacing={2}>
                                  <Avatar
                                    size="sm"
                                    name={affiliate.name}
                                    src={affiliate.avatar || undefined}
                                  />
                                  <Box>
                                    <Text
                                      fontSize="sm"
                                      color="#131D53"
                                      noOfLines={1}
                                    >
                                      {affiliate.name}
                                    </Text>
                                    <Text
                                      fontSize="xs"
                                      color="#131D5399"
                                      noOfLines={1}
                                    >
                                      {affiliate.code}
                                    </Text>
                                  </Box>
                                </HStack>
                              </Td>
                              <Td px={4} maxW="300px">
                                <Text
                                  fontSize="sm"
                                  color="#131D5399"
                                  noOfLines={1}
                                >
                                  {affiliate.email}
                                </Text>
                              </Td>
                              <Td px={4} textAlign="center">
                                <Text fontSize="sm" color="#131D53">
                                  {formatCurrency(affiliate.total_sales || 0)}
                                </Text>
                              </Td>
                              <Td px={4}>
                                <Text
                                  fontSize="sm"
                                  color="#131D5399"
                                  noOfLines={1}
                                  textAlign="center"
                                >
                                  {affiliate.parent_name || '-'}
                                </Text>
                              </Td>
                              <Td px={4} textAlign="center">
                                <Badge
                                  colorScheme={STATUS_COLORS[affiliate.status]}
                                  fontSize="xs"
                                  px={2}
                                  py={1}
                                  borderRadius="6px"
                                  textTransform="none"
                                  fontWeight="500"
                                >
                                  {STATUS_LABELS[affiliate.status]}
                                </Badge>
                              </Td>
                              <Td px={4}>
                                <Flex
                                  align="center"
                                  justify="end"
                                  display={{ base: 'none', md: 'flex' }}
                                >
                                  <Button
                                    onClick={() =>
                                      handleViewLinks(affiliate.id)
                                    }
                                    bg="white"
                                    color="#131D53"
                                    fontSize="14px"
                                    fontWeight="500"
                                    h="32px"
                                    px="12px"
                                    py="6px"
                                    border="1px solid #DEE6F2"
                                    borderRadius="6px 0 0 6px"
                                    _hover={{ bg: 'gray.50' }}
                                    rightIcon={<Link2 size={14} />}
                                    iconSpacing="6px"
                                  >
                                    Ver links
                                  </Button>
                                  <Menu placement="auto">
                                    <MenuButton
                                      as={Button}
                                      bg="white"
                                      color="#131D53"
                                      fontSize="14px"
                                      fontWeight="500"
                                      h="32px"
                                      px="12px"
                                      py="6px"
                                      borderTop="1px solid #DEE6F2"
                                      borderRight="1px solid #DEE6F2"
                                      borderBottom="1px solid #DEE6F2"
                                      borderLeft="1px solid transparent"
                                      borderRadius="0 6px 6px 0"
                                      _hover={{ bg: 'gray.50' }}
                                      rightIcon={<Settings size={14} />}
                                      iconSpacing="6px"
                                    >
                                      Gerenciar
                                    </MenuButton>
                                    <MenuList
                                      bg="white"
                                      border="1px solid"
                                      borderColor="gray.200"
                                      borderRadius="md"
                                      boxShadow="xl"
                                      minW="150px"
                                    >
                                      <MenuItem
                                        icon={<Ban size={16} />}
                                        onClick={() =>
                                          handleBlock(affiliate.id)
                                        }
                                        fontSize="sm"
                                        _hover={{ bg: 'gray.100' }}
                                      >
                                        {affiliate.status === 'blocked'
                                          ? 'Desbloquear'
                                          : 'Bloquear'}
                                      </MenuItem>

                                      <MenuItem
                                        icon={<Power size={16} />}
                                        onClick={() =>
                                          handleToggleStatus(affiliate.id)
                                        }
                                        fontSize="sm"
                                        _hover={{ bg: 'gray.100' }}
                                      >
                                        {affiliate.status === 'enabled'
                                          ? 'Desativar'
                                          : 'Ativar'}
                                      </MenuItem>

                                      <MenuItem
                                        icon={<Edit3 size={16} />}
                                        onClick={() =>
                                          handleManage(affiliate.id)
                                        }
                                        fontSize="sm"
                                        _hover={{ bg: 'gray.100' }}
                                      >
                                        Editar Perfil
                                      </MenuItem>
                                    </MenuList>
                                  </Menu>
                                </Flex>

                                <Box
                                  className="absolute w-[86px] h-15 right-0 bg-button-white-gradient flex items-center justify-end -translate-y-1/2 "
                                  display={{ base: 'flex', md: 'none' }}
                                >
                                  <Menu placement="auto" strategy="fixed">
                                    <MenuButton
                                      as={IconButton}
                                      w={9}
                                      h={7}
                                      mr={3}
                                      aria-label="Options"
                                      icon={<Ellipsis size={18} />}
                                      className="flex items-center justify-center bg-button-gradient"
                                      rounded="md"
                                      color="#131D53"
                                      _hover={{
                                        bg: 'linear-gradient(to-r, #61abc9, #1f39c4)',
                                      }}
                                    />
                                    <Portal>
                                      <MenuList
                                        bg="white"
                                        border="1px solid"
                                        borderColor="gray.200"
                                        borderRadius="md"
                                        boxShadow="xl"
                                        minW="150px"
                                      >
                                        <MenuItem
                                          icon={<Ban size={16} />}
                                          onClick={() =>
                                            handleBlock(affiliate.id)
                                          }
                                          fontSize="sm"
                                          _hover={{ bg: 'gray.100' }}
                                        >
                                          {affiliate.status === 'blocked'
                                            ? 'Desbloquear'
                                            : 'Bloquear'}
                                        </MenuItem>

                                        <MenuItem
                                          icon={<Power size={16} />}
                                          onClick={() =>
                                            handleToggleStatus(affiliate.id)
                                          }
                                          fontSize="sm"
                                          _hover={{ bg: 'gray.100' }}
                                        >
                                          {affiliate.status === 'enabled'
                                            ? 'Desativar'
                                            : 'Ativar'}
                                        </MenuItem>

                                        <MenuItem
                                          icon={<Link2 size={16} />}
                                          onClick={() =>
                                            handleViewLinks(affiliate.id)
                                          }
                                          fontSize="sm"
                                          _hover={{ bg: 'gray.100' }}
                                        >
                                          Ver links
                                        </MenuItem>

                                        <MenuItem
                                          icon={<Edit3 size={16} />}
                                          onClick={() =>
                                            handleManage(affiliate.id)
                                          }
                                          fontSize="sm"
                                          _hover={{ bg: 'gray.100' }}
                                        >
                                          Editar Perfil
                                        </MenuItem>
                                      </MenuList>
                                    </Portal>
                                  </Menu>
                                </Box>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Box>

                  <>
                    <Flex
                      justify="flex-end"
                      px={3}
                      pt={2}
                      display={{ base: 'flex', md: 'none' }}
                    >
                      <Text fontSize="xs" color="#131D5399">
                        Mostrando {startItem}-{endItem} de {totalAffiliates}{' '}
                        afiliados
                      </Text>
                    </Flex>

                    <Flex
                      justify="space-between"
                      align="center"
                      px={3}
                      pt={2}
                      display={{ base: 'none', md: 'flex' }}
                    >
                      <Text fontSize="sm" color="#131D5399">
                        Mostrando {startItem}-{endItem} de {totalAffiliates}{' '}
                        afiliados
                      </Text>

                      {totalPages > 1 && (
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                        />
                      )}
                    </Flex>

                    {totalPages > 1 && (
                      <Box pt={2} display={{ base: 'block', md: 'none' }}>
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                        />
                      </Box>
                    )}
                  </>
                </>
              ) : (
                <Box textAlign="center" py={8} color="gray.500">
                  <Text>Nenhum afiliado encontrado</Text>
                </Box>
              )}
            </Box>
          )}
        </PageContent>

        <Modal
          isOpen={isNewAffiliatesOpen}
          onClose={onNewAffiliatesClose}
          size="6xl"
          scrollBehavior="inside"
          isCentered
        >
          <ModalOverlay />
          <ModalContent
            maxW="90vw"
            maxH={{ base: 'calc(100vh - 64px)', md: '90vh' }}
            my={{ base: 8, md: 'auto' }}
          >
            <ModalHeader
              fontSize="md"
              fontWeight="600"
              color="#131D53"
              borderBottom="1px solid #DEE6F2"
            >
              Novos Afiliados
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={6}>
              <VStack spacing={4} align="stretch">
                <Flex gap={3} flexWrap="wrap">
                  <HStack
                    h={10}
                    position="relative"
                    rounded={4}
                    borderWidth={1}
                    borderColor="#DEE6F2"
                    gap={0}
                    transition="all 0.2s"
                    flex="1"
                    minW="250px"
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
                      placeholder="Buscar por nome ou código"
                      border="none"
                      flex="1"
                      fontSize="sm"
                      _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                      value={newAffSearchName}
                      onChange={(e) => setNewAffSearchName(e.target.value)}
                    />
                  </HStack>

                  <HStack
                    h={10}
                    position="relative"
                    rounded={4}
                    borderWidth={1}
                    borderColor="#DEE6F2"
                    gap={0}
                    transition="all 0.2s"
                    flex="1"
                    minW="250px"
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
                      placeholder="Buscar por e-mail"
                      border="none"
                      flex="1"
                      fontSize="sm"
                      _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                      value={newAffSearchEmail}
                      onChange={(e) => setNewAffSearchEmail(e.target.value)}
                    />
                  </HStack>

                  <HStack
                    h={10}
                    position="relative"
                    rounded={4}
                    borderWidth={1}
                    borderColor="#DEE6F2"
                    gap={0}
                    transition="all 0.2s"
                    flex="1"
                    minW="250px"
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
                      placeholder="Buscar por indicado"
                      border="none"
                      flex="1"
                      fontSize="sm"
                      _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                      value={newAffSearchReferredBy}
                      onChange={(e) =>
                        setNewAffSearchReferredBy(e.target.value)
                      }
                    />
                  </HStack>
                </Flex>

                <Box
                  border="1px solid #DEE6F2"
                  borderRadius="md"
                  overflow="auto"
                  maxH="500px"
                >
                  <TableContainer>
                    <Table variant="simple">
                      <Thead position="sticky" top={0} bg="white" zIndex={1}>
                        <Tr>
                          <Th
                            px={4}
                            color="#131d53"
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                          >
                            Afiliado
                          </Th>
                          <Th
                            px={4}
                            color="#131d53"
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            maxW="300px"
                          >
                            Email
                          </Th>
                          <Th
                            px={4}
                            color="#131d53"
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                          >
                            Telefone
                          </Th>
                          <Th
                            px={4}
                            color="#131d53"
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                          >
                            Indicado por
                          </Th>
                          <Th
                            px={4}
                            color="#131d53"
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            textAlign="center"
                          >
                            Data de Cadastro
                          </Th>
                          <Th
                            px={4}
                            color="#131d53"
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            textAlign="center"
                          >
                            Ações
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {newAffLoading ? (
                          <Tr>
                            <Td colSpan={6} textAlign="center" py={8}>
                              <Text color="gray.500">
                                Carregando novos afiliados...
                              </Text>
                            </Td>
                          </Tr>
                        ) : newAffiliates.length > 0 ? (
                          newAffiliates.map((affiliate) => (
                            <Tr
                              key={affiliate.id}
                              _hover={{ bg: '#F3F6FA' }}
                              borderTop="1px solid #DEE6F2"
                              _first={{ borderTop: 'none' }}
                            >
                              <Td px={4}>
                                <HStack spacing={2}>
                                  <Avatar
                                    size="sm"
                                    name={affiliate.name}
                                    src={affiliate.avatar || undefined}
                                  />
                                  <Box>
                                    <Text
                                      fontSize="sm"
                                      color="#131D53"
                                      noOfLines={1}
                                    >
                                      {affiliate.name}
                                    </Text>
                                    <Text
                                      fontSize="xs"
                                      color="#131D5399"
                                      noOfLines={1}
                                    >
                                      {affiliate.code}
                                    </Text>
                                  </Box>
                                </HStack>
                              </Td>
                              <Td px={4} maxW="300px">
                                <Text
                                  fontSize="sm"
                                  color="#131D5399"
                                  noOfLines={1}
                                >
                                  {affiliate.email}
                                </Text>
                              </Td>
                              <Td px={4}>
                                <Text
                                  fontSize="sm"
                                  color="#131D5399"
                                  noOfLines={1}
                                >
                                  {affiliate.phone || '-'}
                                </Text>
                              </Td>
                              <Td px={4}>
                                <Text
                                  fontSize="sm"
                                  color="#131D5399"
                                  noOfLines={1}
                                >
                                  {affiliate.parent_name || '-'}
                                </Text>
                              </Td>
                              <Td px={4} textAlign="center">
                                <Text fontSize="sm" color="#131D5399">
                                  {formatDate(affiliate.created_at)}
                                </Text>
                              </Td>
                              <Td px={4}>
                                <HStack spacing={2} justify="center">
                                  <Button
                                    size="sm"
                                    fontSize="xs"
                                    colorScheme="green"
                                    onClick={() =>
                                      handleApproveAffiliate(affiliate.id)
                                    }
                                  >
                                    Aprovar
                                  </Button>
                                  <Button
                                    size="sm"
                                    fontSize="xs"
                                    colorScheme="red"
                                    variant="outline"
                                    onClick={() =>
                                      handleRejectAffiliate(affiliate.id)
                                    }
                                  >
                                    Rejeitar
                                  </Button>
                                </HStack>
                              </Td>
                            </Tr>
                          ))
                        ) : (
                          <Tr>
                            <Td colSpan={6} textAlign="center" py={8}>
                              <Text color="gray.500">
                                Nenhum novo afiliado encontrado
                              </Text>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>

                {newAffiliates.length > 0 && (
                  <Flex
                    justify="space-between"
                    align="center"
                    px={3}
                    flexDirection={{ base: 'column', md: 'row' }}
                    gap={{ base: 3, md: 0 }}
                  >
                    <Text fontSize="sm" color="#131D5399">
                      Mostrando {newAffStartItem}-{newAffEndItem} de{' '}
                      {newAffMeta?.total_items || 0} novos afiliados
                    </Text>

                    {newAffTotalPages > 1 && (
                      <Pagination
                        currentPage={newAffCurrentPage}
                        totalPages={newAffTotalPages}
                        onPageChange={setNewAffCurrentPage}
                      />
                    )}
                  </Flex>
                )}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={isAddAffiliateOpen}
          onClose={handleCancelAddAffiliate}
          size="4xl"
          isCentered
        >
          <ModalOverlay />
          <ModalContent maxW="900px">
            <ModalHeader
              fontSize="md"
              fontWeight="600"
              color="#131D53"
              borderBottom="1px solid #DEE6F2"
            >
              Adicionar Novo Afiliado
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={6}>
              <VStack spacing={5} align="stretch">
                <Flex gap={4} flexWrap="wrap">
                  <FormControl
                    flex="1"
                    minW="250px"
                    isRequired
                    isInvalid={nameError}
                  >
                    <FormLabel
                      fontSize="sm"
                      color="#131D53"
                      mb={2}
                      sx={{
                        '& .chakra-form__required-indicator': {
                          color: 'red.500',
                        },
                      }}
                    >
                      Nome
                    </FormLabel>
                    <Input
                      placeholder="Digite o nome"
                      value={affiliateName}
                      onChange={(e) => setAffiliateName(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                      isRequired
                      isInvalid={nameError}
                      errorBorderColor="red.500"
                    />
                  </FormControl>

                  <FormControl
                    flex="1"
                    minW="250px"
                    isRequired
                    isInvalid={emailError}
                  >
                    <FormLabel
                      fontSize="sm"
                      color="#131D53"
                      mb={2}
                      sx={{
                        '& .chakra-form__required-indicator': {
                          color: 'red.500',
                        },
                      }}
                    >
                      E-mail
                    </FormLabel>
                    <Input
                      type="email"
                      placeholder="Digite o e-mail"
                      value={affiliateEmail}
                      onChange={(e) => setAffiliateEmail(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                      isRequired
                      isInvalid={emailError}
                      errorBorderColor="red.500"
                    />
                  </FormControl>
                </Flex>

                <Flex gap={4} flexWrap="wrap">
                  <FormControl flex="1" minW="250px">
                    <FormLabel fontSize="sm" color="#131D53" mb={2}>
                      Rede Social
                    </FormLabel>
                    <Input
                      placeholder="Digite a rede social"
                      value={socialNetwork}
                      onChange={(e) => setSocialNetwork(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                    />
                  </FormControl>

                  <FormControl flex="1" minW="250px">
                    <FormLabel fontSize="sm" color="#131D53" mb={2}>
                      Razão Social
                    </FormLabel>
                    <Input
                      placeholder="Digite a razão social"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                    />
                  </FormControl>
                </Flex>

                <Flex gap={4} flexWrap="wrap">
                  <FormControl
                    flex="1"
                    minW="250px"
                    isRequired
                    isInvalid={cpfError}
                  >
                    <FormLabel
                      fontSize="sm"
                      color="#131D53"
                      mb={2}
                      sx={{
                        '& .chakra-form__required-indicator': {
                          color: 'red.500',
                        },
                      }}
                    >
                      CPF
                    </FormLabel>
                    <Input
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                      isRequired
                      isInvalid={cpfError}
                      errorBorderColor="red.500"
                    />
                  </FormControl>

                  <FormControl flex="1" minW="250px">
                    <FormLabel fontSize="sm" color="#131D53" mb={2}>
                      CNPJ
                    </FormLabel>
                    <Input
                      placeholder="00.000.000/0000-00"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                    />
                  </FormControl>
                </Flex>

                <Flex gap={4} flexWrap="wrap">
                  <FormControl
                    flex="1"
                    minW="250px"
                    isRequired
                    isInvalid={phoneError}
                  >
                    <FormLabel
                      fontSize="sm"
                      color="#131D53"
                      mb={2}
                      sx={{
                        '& .chakra-form__required-indicator': {
                          color: 'red.500',
                        },
                      }}
                    >
                      Telefone
                    </FormLabel>
                    <Input
                      placeholder="(00) 00000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                      isRequired
                      isInvalid={phoneError}
                      errorBorderColor="red.500"
                    />
                  </FormControl>

                  <FormControl
                    flex="1"
                    minW="250px"
                    isRequired
                    isInvalid={birthDateError}
                  >
                    <FormLabel
                      fontSize="sm"
                      color="#131D53"
                      mb={2}
                      sx={{
                        '& .chakra-form__required-indicator': {
                          color: 'red.500',
                        },
                      }}
                    >
                      Data de Nascimento
                    </FormLabel>
                    <Input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                      isRequired
                      isInvalid={birthDateError}
                      errorBorderColor="red.500"
                    />
                  </FormControl>
                </Flex>

                <Flex gap={4} flexWrap="wrap">
                  <Box flex="1" minW="200px">
                    <FormControl>
                      <FormLabel fontSize="sm" color="#131D53" mb={2}>
                        Comissão Customizada
                      </FormLabel>
                      <InputGroup>
                        <Input
                          type="text"
                          placeholder="0,00"
                          value={customCommission}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.,]/g, '')
                            setCustomCommission(value)
                          }}
                          onBlur={(e) => {
                            if (e.target.value) {
                              setCustomCommission(
                                formatCommissionDisplay(e.target.value)
                              )
                            }
                          }}
                          borderColor="#DEE6F2"
                          _hover={{ borderColor: '#C5CDDC' }}
                          _focus={{
                            borderColor: '#1F70F1',
                            boxShadow: '0 0 0 1px #1F70F1',
                          }}
                          isDisabled={!hasCustomCommission}
                          bg={!hasCustomCommission ? '#F7FAFC' : 'white'}
                          pr="2.5rem"
                        />
                        <InputRightElement width="2.5rem">
                          <Text
                            fontSize="sm"
                            color={!hasCustomCommission ? '#A0AEC0' : '#131D53'}
                          >
                            %
                          </Text>
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                    <Checkbox
                      colorScheme="blue"
                      isChecked={hasCustomCommission}
                      onChange={(e) => setHasCustomCommission(e.target.checked)}
                      fontSize="sm"
                      color="#131D53"
                      mt={2}
                    >
                      Adicionar comissão customizada
                    </Checkbox>
                  </Box>

                  <FormControl flex="1" minW="200px">
                    <FormLabel fontSize="sm" color="#131D53" mb={2}>
                      Afiliado filho de
                    </FormLabel>
                    <Select
                      placeholder={
                        loadingMasters
                          ? 'Carregando afiliados...'
                          : 'Nenhum afiliado pai'
                      }
                      value={parentAffiliate}
                      onChange={(e) => setParentAffiliate(e.target.value)}
                      isDisabled={loadingMasters}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                    >
                      {mastersList.map((parent) => (
                        <option key={parent.id} value={parent.id.toString()}>
                          {parent.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <Box flex="1" minW="200px">
                    <FormControl>
                      <FormLabel fontSize="sm" color="#131D53" mb={2}>
                        Comissão sobre indicados
                      </FormLabel>
                      <InputGroup>
                        <Input
                          type="text"
                          placeholder="0,00"
                          value={referralCommission}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.,]/g, '')
                            setReferralCommission(value)
                          }}
                          onBlur={(e) => {
                            if (e.target.value) {
                              setReferralCommission(
                                formatCommissionDisplay(e.target.value)
                              )
                            }
                          }}
                          borderColor="#DEE6F2"
                          _hover={{ borderColor: '#C5CDDC' }}
                          _focus={{
                            borderColor: '#1F70F1',
                            boxShadow: '0 0 0 1px #1F70F1',
                          }}
                          isDisabled={!allowReferral}
                          bg={!allowReferral ? '#F7FAFC' : 'white'}
                          pr="2.5rem"
                        />
                        <InputRightElement width="2.5rem">
                          <Text
                            fontSize="sm"
                            color={!allowReferral ? '#A0AEC0' : '#131D53'}
                          >
                            %
                          </Text>
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                    <Checkbox
                      colorScheme="blue"
                      isChecked={allowReferral}
                      onChange={(e) => setAllowReferral(e.target.checked)}
                      fontSize="sm"
                      color="#131D53"
                      mt={2}
                    >
                      Permitir indicação de afiliados
                    </Checkbox>
                  </Box>
                </Flex>
              </VStack>
            </ModalBody>

            <ModalFooter borderTop="1px solid #DEE6F2">
              <HStack spacing={3}>
                <Button
                  size="md"
                  fontSize="sm"
                  fontWeight={500}
                  px={6}
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  color="#131D53"
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                  }}
                  onClick={handleCancelAddAffiliate}
                >
                  Cancelar
                </Button>
                <Button
                  size="md"
                  fontSize="sm"
                  fontWeight={500}
                  px={6}
                  color="#fff"
                  bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
                  shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                  }}
                  onClick={handleSaveAffiliate}
                  isLoading={isSavingAffiliate}
                  loadingText="Salvando..."
                >
                  Salvar
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={isEditAffiliateOpen}
          onClose={handleCancelEditAffiliate}
          scrollBehavior="inside"
          isCentered
        >
          <ModalOverlay />
          <ModalContent
            maxW={{ base: 'calc(100vw - 32px)', md: '900px' }}
            maxH={{ base: 'calc(100vh - 64px)', md: '90vh' }}
            mx={{ base: 4, md: 'auto' }}
            my={{ base: 8, md: 'auto' }}
            borderRadius="xl"
          >
            <ModalHeader
              fontSize="md"
              fontWeight="600"
              color="#131D53"
              borderBottom="1px solid #DEE6F2"
            >
              Editar Perfil do Afiliado
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={6}>
              <VStack spacing={5} align="stretch">
                <Flex
                  align="center"
                  gap={3}
                  pb={3}
                  borderBottom="1px solid #DEE6F2"
                >
                  <Avatar
                    size="lg"
                    name={affiliateName}
                    src={selectedAffiliateAvatar || undefined}
                  />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="md" fontWeight="600" color="#131D53">
                      {affiliateName}
                    </Text>
                    {selectedAffiliateAge && (
                      <Text fontSize="sm" color="#131D5399">
                        {selectedAffiliateAge} anos
                      </Text>
                    )}
                  </VStack>
                </Flex>

                <Flex gap={4} flexWrap="wrap">
                  <FormControl flex="1" minW="250px">
                    <FormLabel fontSize="sm" color="#131D53" mb={2}>
                      Nome
                    </FormLabel>
                    <Input
                      placeholder="Digite o nome"
                      value={affiliateName}
                      onChange={(e) => setAffiliateName(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                    />
                  </FormControl>

                  <FormControl flex="1" minW="250px">
                    <FormLabel fontSize="sm" color="#131D53" mb={2}>
                      E-mail
                    </FormLabel>
                    <Input
                      type="email"
                      placeholder="Digite o e-mail"
                      value={affiliateEmail}
                      onChange={(e) => setAffiliateEmail(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                    />
                  </FormControl>
                </Flex>

                <Flex gap={4} flexWrap="wrap">
                  <FormControl flex="1" minW="250px">
                    <FormLabel fontSize="sm" color="#131D53" mb={2}>
                      Rede Social
                    </FormLabel>
                    <Input
                      placeholder="Digite a rede social"
                      value={socialNetwork}
                      onChange={(e) => setSocialNetwork(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                    />
                  </FormControl>

                  <FormControl flex="1" minW="250px">
                    <FormLabel fontSize="sm" color="#131D53" mb={2}>
                      Razão Social
                    </FormLabel>
                    <Input
                      placeholder="Digite a razão social"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                    />
                  </FormControl>
                </Flex>

                <Flex gap={4} flexWrap="wrap">
                  <FormControl flex="1" minW="250px">
                    <FormLabel fontSize="sm" color="#131D53" mb={2}>
                      CPF
                    </FormLabel>
                    <Input
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                    />
                  </FormControl>

                  <FormControl flex="1" minW="250px">
                    <FormLabel fontSize="sm" color="#131D53" mb={2}>
                      CNPJ
                    </FormLabel>
                    <Input
                      placeholder="00.000.000/0000-00"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                    />
                  </FormControl>
                </Flex>

                <Flex gap={4} flexWrap="wrap">
                  <FormControl flex="1" minW="250px">
                    <FormLabel fontSize="sm" color="#131D53" mb={2}>
                      Telefone
                    </FormLabel>
                    <Input
                      placeholder="(00) 00000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                    />
                  </FormControl>

                  <FormControl flex="1" minW="250px">
                    <FormLabel fontSize="sm" color="#131D53" mb={2}>
                      Data de Nascimento
                    </FormLabel>
                    <Input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                    />
                  </FormControl>
                </Flex>

                <Flex gap={4} flexWrap="wrap">
                  <Box flex="1" minW="200px">
                    <FormControl>
                      <FormLabel fontSize="sm" color="#131D53" mb={2}>
                        Comissão Customizada
                      </FormLabel>
                      <InputGroup>
                        <Input
                          type="text"
                          placeholder="0,00"
                          value={customCommission}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.,]/g, '')
                            setCustomCommission(value)
                          }}
                          onBlur={(e) => {
                            if (e.target.value) {
                              setCustomCommission(
                                formatCommissionDisplay(e.target.value)
                              )
                            }
                          }}
                          borderColor="#DEE6F2"
                          _hover={{ borderColor: '#C5CDDC' }}
                          _focus={{
                            borderColor: '#1F70F1',
                            boxShadow: '0 0 0 1px #1F70F1',
                          }}
                          isDisabled={!hasCustomCommission}
                          bg={!hasCustomCommission ? '#F7FAFC' : 'white'}
                          pr="2.5rem"
                        />
                        <InputRightElement width="2.5rem">
                          <Text
                            fontSize="sm"
                            color={!hasCustomCommission ? '#A0AEC0' : '#131D53'}
                          >
                            %
                          </Text>
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                    <Checkbox
                      colorScheme="blue"
                      isChecked={hasCustomCommission}
                      onChange={(e) => setHasCustomCommission(e.target.checked)}
                      fontSize="sm"
                      color="#131D53"
                      mt={2}
                    >
                      Adicionar comissão customizada
                    </Checkbox>
                  </Box>

                  <FormControl flex="1" minW="200px">
                    <FormLabel fontSize="sm" color="#131D53" mb={2}>
                      Afiliado filho de
                    </FormLabel>
                    <Select
                      placeholder="Nenhum afiliado pai"
                      value={parentAffiliate}
                      onChange={(e) => setParentAffiliate(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                    >
                      {availableParents.map((parent) => (
                        <option key={parent.id} value={parent.id.toString()}>
                          {parent.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <Box flex="1" minW="200px">
                    <FormControl>
                      <FormLabel fontSize="sm" color="#131D53" mb={2}>
                        Comissão sobre indicados
                      </FormLabel>
                      <InputGroup>
                        <Input
                          type="text"
                          placeholder="0,00"
                          value={referralCommission}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.,]/g, '')
                            setReferralCommission(value)
                          }}
                          onBlur={(e) => {
                            if (e.target.value) {
                              setReferralCommission(
                                formatCommissionDisplay(e.target.value)
                              )
                            }
                          }}
                          borderColor="#DEE6F2"
                          _hover={{ borderColor: '#C5CDDC' }}
                          _focus={{
                            borderColor: '#1F70F1',
                            boxShadow: '0 0 0 1px #1F70F1',
                          }}
                          isDisabled={!allowReferral}
                          bg={!allowReferral ? '#F7FAFC' : 'white'}
                          pr="2.5rem"
                        />
                        <InputRightElement width="2.5rem">
                          <Text
                            fontSize="sm"
                            color={!allowReferral ? '#A0AEC0' : '#131D53'}
                          >
                            %
                          </Text>
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                    <Checkbox
                      colorScheme="blue"
                      isChecked={allowReferral}
                      onChange={(e) => setAllowReferral(e.target.checked)}
                      fontSize="sm"
                      color="#131D53"
                      mt={2}
                    >
                      Permitir indicação de afiliados
                    </Checkbox>
                  </Box>
                </Flex>
              </VStack>
            </ModalBody>

            <ModalFooter borderTop="1px solid #DEE6F2">
              <HStack spacing={3}>
                <Button
                  size="md"
                  fontSize="sm"
                  fontWeight={500}
                  px={6}
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  color="#131D53"
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                  }}
                  onClick={handleCancelEditAffiliate}
                >
                  Cancelar
                </Button>
                <Button
                  size="md"
                  fontSize="sm"
                  fontWeight={500}
                  px={6}
                  color="#fff"
                  bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
                  shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                  }}
                  onClick={handleSaveEditAffiliate}
                >
                  Salvar Alterações
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {selectedAffiliateForLinks && (
          <AffiliateLinksModal
            isOpen={isLinksModalOpen}
            onClose={onLinksModalClose}
            affiliateId={selectedAffiliateForLinks.id}
            affiliateName={selectedAffiliateForLinks.name}
          />
        )}

        <Modal
          isOpen={isBlockModalOpen}
          onClose={onBlockModalClose}
          isCentered
          size="md"
        >
          <ModalOverlay />
          <ModalContent borderRadius="xl" mx={4}>
            <ModalHeader
              fontSize="lg"
              fontWeight="semibold"
              color="#131D53"
              borderBottom="1px solid"
              borderColor="#dee6f2"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <AlertTriangle size={20} color="#F56565" />
              {affiliateToBlock?.status === 'blocked'
                ? 'Desbloquear afiliado'
                : 'Bloquear afiliado'}
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody py={6}>
              {affiliateToBlock && (
                <VStack spacing={4} align="stretch">
                  <Flex align="center" gap={3}>
                    <Avatar
                      size="md"
                      name={affiliateToBlock.name}
                      src={affiliateToBlock.avatar}
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="500" color="#131D53">
                        {affiliateToBlock.name}
                      </Text>
                      <Text fontSize="sm" color="#131D5399">
                        {affiliateToBlock.email}
                      </Text>
                    </VStack>
                  </Flex>

                  <Text color="#131D53" fontSize="sm">
                    {affiliateToBlock.status === 'blocked'
                      ? 'Tem certeza que deseja desbloquear este afiliado? Ele poderá voltar a acessar o sistema.'
                      : 'Tem certeza que deseja bloquear este afiliado? Ele não poderá mais acessar o sistema.'}
                  </Text>
                </VStack>
              )}
            </ModalBody>

            <ModalFooter
              borderTop="1px solid"
              borderColor="#dee6f2"
              gap={3}
              pt={4}
            >
              <Button
                onClick={onBlockModalClose}
                bg="white"
                color="#131D53"
                fontSize="14px"
                fontWeight="500"
                h="32px"
                px="16px"
                border="1px solid #DEE6F2"
                borderRadius="6px"
                isDisabled={isBlockingAffiliate}
                _hover={{ bg: 'gray.50' }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmBlock}
                size="sm"
                fontSize="sm"
                fontWeight={500}
                px={6}
                color="#fff"
                bgGradient={
                  affiliateToBlock?.status === 'blocked'
                    ? 'linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)'
                    : 'linear-gradient(180deg, #FF6B6B -27.08%, #DD1818 123.81%)'
                }
                shadow={
                  affiliateToBlock?.status === 'blocked'
                    ? '0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset'
                    : '0px 0px 0px 1px #F40000, 0px -1px 0px 0px rgba(169, 0, 0, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset'
                }
                _hover={{
                  bgGradient:
                    affiliateToBlock?.status === 'blocked'
                      ? 'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)'
                      : 'linear-gradient(180deg, #FF7A7A -27.08%, #E82A2A 123.81%)',
                  shadow:
                    affiliateToBlock?.status === 'blocked'
                      ? '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset'
                      : '0px 0px 0px 1px #F11F1F, 0px -1px 0px 0px rgba(169, 0, 0, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                }}
                isLoading={isBlockingAffiliate}
                loadingText={
                  affiliateToBlock?.status === 'blocked'
                    ? 'Desbloqueando...'
                    : 'Bloqueando...'
                }
              >
                {affiliateToBlock?.status === 'blocked'
                  ? 'Desbloquear'
                  : 'Bloquear'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={isToggleStatusModalOpen}
          onClose={onToggleStatusModalClose}
          isCentered
          size="md"
        >
          <ModalOverlay />
          <ModalContent borderRadius="xl" mx={4}>
            <ModalHeader
              fontSize="lg"
              fontWeight="semibold"
              color="#131D53"
              borderBottom="1px solid"
              borderColor="#dee6f2"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <AlertTriangle size={20} color="#F56565" />
              {affiliateToToggle?.status === 'enabled'
                ? 'Desativar afiliado'
                : 'Ativar afiliado'}
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody py={6}>
              {affiliateToToggle && (
                <VStack spacing={4} align="stretch">
                  <Flex align="center" gap={3}>
                    <Avatar
                      size="md"
                      name={affiliateToToggle.name}
                      src={affiliateToToggle.avatar}
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="500" color="#131D53">
                        {affiliateToToggle.name}
                      </Text>
                      <Text fontSize="sm" color="#131D5399">
                        {affiliateToToggle.email}
                      </Text>
                    </VStack>
                  </Flex>

                  <Text color="#131D53" fontSize="sm">
                    {affiliateToToggle.status === 'enabled'
                      ? 'Tem certeza que deseja desativar este afiliado? Ele não poderá gerar novos links ou comissões.'
                      : 'Tem certeza que deseja ativar este afiliado? Ele poderá voltar a gerar links e comissões.'}
                  </Text>
                </VStack>
              )}
            </ModalBody>

            <ModalFooter
              borderTop="1px solid"
              borderColor="#dee6f2"
              gap={3}
              pt={4}
            >
              <Button
                onClick={onToggleStatusModalClose}
                bg="white"
                color="#131D53"
                fontSize="14px"
                fontWeight="500"
                h="32px"
                px="16px"
                border="1px solid #DEE6F2"
                borderRadius="6px"
                isDisabled={isTogglingStatus}
                _hover={{ bg: 'gray.50' }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmToggleStatus}
                size="sm"
                fontSize="sm"
                fontWeight={500}
                px={6}
                color="#fff"
                bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
                shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                _hover={{
                  bgGradient:
                    'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                  shadow:
                    '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                }}
                isLoading={isTogglingStatus}
                loadingText={
                  affiliateToToggle?.status === 'enabled'
                    ? 'Desativando...'
                    : 'Ativando...'
                }
              >
                {affiliateToToggle?.status === 'enabled'
                  ? 'Desativar'
                  : 'Ativar'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={isApproveModalOpen}
          onClose={onApproveModalClose}
          isCentered
          size="md"
        >
          <ModalOverlay />
          <ModalContent borderRadius="xl" mx={4}>
            <ModalHeader
              fontSize="lg"
              fontWeight="semibold"
              color="#131D53"
              borderBottom="1px solid"
              borderColor="#dee6f2"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <AlertTriangle size={20} color="#48BB78" />
              Aprovar afiliado
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody py={6}>
              {affiliateToApprove && (
                <VStack spacing={4} align="stretch">
                  <Flex align="center" gap={3}>
                    <Avatar
                      size="md"
                      name={affiliateToApprove.name}
                      src={affiliateToApprove.avatar}
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="500" color="#131D53">
                        {affiliateToApprove.name}
                      </Text>
                      <Text fontSize="sm" color="#131D5399">
                        {affiliateToApprove.email}
                      </Text>
                    </VStack>
                  </Flex>
                  <Text color="#131D53" fontSize="sm">
                    Tem certeza que deseja aprovar este afiliado? Ele poderá
                    acessar o sistema e começar a trabalhar.
                  </Text>
                </VStack>
              )}
            </ModalBody>

            <ModalFooter
              borderTop="1px solid"
              borderColor="#dee6f2"
              gap={3}
              pt={4}
            >
              <Button
                onClick={onApproveModalClose}
                bg="white"
                color="#131D53"
                fontSize="14px"
                fontWeight="500"
                h="32px"
                px="16px"
                border="1px solid #DEE6F2"
                borderRadius="6px"
                isDisabled={isApprovingAffiliate}
                _hover={{ bg: 'gray.50' }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmApprove}
                size="sm"
                fontSize="sm"
                fontWeight={500}
                px={6}
                color="#fff"
                bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
                shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                _hover={{
                  bgGradient:
                    'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                  shadow:
                    '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                }}
                isLoading={isApprovingAffiliate}
                loadingText="Aprovando..."
              >
                Aprovar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={isRejectModalOpen}
          onClose={onRejectModalClose}
          isCentered
          size="md"
        >
          <ModalOverlay />
          <ModalContent borderRadius="xl" mx={4}>
            <ModalHeader
              fontSize="lg"
              fontWeight="semibold"
              color="#131D53"
              borderBottom="1px solid"
              borderColor="#dee6f2"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <AlertTriangle size={20} color="#F56565" />
              Rejeitar afiliado
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody py={6}>
              {affiliateToReject && (
                <VStack spacing={4} align="stretch">
                  <Flex align="center" gap={3}>
                    <Avatar
                      size="md"
                      name={affiliateToReject.name}
                      src={affiliateToReject.avatar}
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="500" color="#131D53">
                        {affiliateToReject.name}
                      </Text>
                      <Text fontSize="sm" color="#131D5399">
                        {affiliateToReject.email}
                      </Text>
                    </VStack>
                  </Flex>
                  <Text color="#131D53" fontSize="sm">
                    Tem certeza que deseja rejeitar este afiliado? Ele será
                    desativado e não poderá acessar o sistema.
                  </Text>
                </VStack>
              )}
            </ModalBody>

            <ModalFooter
              borderTop="1px solid"
              borderColor="#dee6f2"
              gap={3}
              pt={4}
            >
              <Button
                onClick={onRejectModalClose}
                bg="white"
                color="#131D53"
                fontSize="14px"
                fontWeight="500"
                h="32px"
                px="16px"
                border="1px solid #DEE6F2"
                borderRadius="6px"
                isDisabled={isRejectingAffiliate}
                _hover={{ bg: 'gray.50' }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmReject}
                size="sm"
                fontSize="sm"
                fontWeight={500}
                px={6}
                color="#fff"
                bgGradient="linear-gradient(180deg, #FF6B6B -27.08%, #DD1818 123.81%)"
                shadow="0px 0px 0px 1px #F40000, 0px -1px 0px 0px rgba(169, 0, 0, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                _hover={{
                  bgGradient:
                    'linear-gradient(180deg, #FF7A7A -27.08%, #E82A2A 123.81%)',
                  shadow:
                    '0px 0px 0px 1px #F11F1F, 0px -1px 0px 0px rgba(169, 0, 0, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                }}
                isLoading={isRejectingAffiliate}
                loadingText="Rejeitando..."
              >
                Rejeitar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </AppLayout>
    </>
  )
}
