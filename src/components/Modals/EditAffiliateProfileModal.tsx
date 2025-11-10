import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Select,
  Flex,
  Avatar,
  Box,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

interface EditAffiliateProfileModalProps {
  isOpen: boolean
  onClose: () => void
  affiliateId: number
  affiliateName: string
  affiliateEmail: string
  affiliatePhone?: string
  affiliateAvatar?: string
  affiliateBirthdate?: string
  affiliateParentName?: string
  affiliateParentId?: number | null
  affiliateSocialNetwork?: string
  affiliateBusinessName?: string
  affiliateCpf?: string
  affiliateBusinessCnpj?: string
  affiliateCustomCommission?: string | number
  affiliateCanHaveReferrals?: boolean
  onSave: (data: EditAffiliateData) => void
  availableParents?: Array<{ id: number; name: string }>
}

export interface EditAffiliateData {
  allowReferral: boolean
  name: string
  email: string
  socialNetwork: string
  companyName: string
  cpf: string
  cnpj: string
  phone: string
  birthDate: string
  hasCustomCommission: boolean
  customCommission: string
  parentAffiliate: string
}

export function EditAffiliateProfileModal({
  isOpen,
  onClose,
  affiliateId,
  affiliateName: initialName,
  affiliateEmail: initialEmail,
  affiliatePhone,
  affiliateAvatar,
  affiliateBirthdate,
  affiliateParentName,
  affiliateParentId,
  affiliateSocialNetwork,
  affiliateBusinessName,
  affiliateCpf,
  affiliateBusinessCnpj,
  affiliateCustomCommission,
  affiliateCanHaveReferrals,
  onSave,
  availableParents = [],
}: EditAffiliateProfileModalProps) {
  const [allowReferral, setAllowReferral] = useState(false)
  const [affiliateName, setAffiliateName] = useState(initialName)
  const [affiliateEmail, setAffiliateEmail] = useState(initialEmail)
  const [socialNetwork, setSocialNetwork] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [cpf, setCpf] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [phone, setPhone] = useState(affiliatePhone || '')
  const [birthDate, setBirthDate] = useState('')
  const [hasCustomCommission, setHasCustomCommission] = useState(false)
  const [customCommission, setCustomCommission] = useState('')
  const [parentAffiliate, setParentAffiliate] = useState(
    affiliateParentId?.toString() || ''
  )

  const calculateAge = (birthdate: string): string => {
    if (!birthdate) return ''
    const birth = new Date(birthdate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--
    }
    return `${age} anos`
  }

  const affiliateAge = calculateAge(affiliateBirthdate || '')

  useEffect(() => {
    if (isOpen) {
      setAffiliateName(initialName)
      setAffiliateEmail(initialEmail)
      setPhone(affiliatePhone || '')
      setSocialNetwork(affiliateSocialNetwork || '')
      setCompanyName(affiliateBusinessName || '')
      setCpf(affiliateCpf || '')
      setCnpj(affiliateBusinessCnpj || '')
      setBirthDate(affiliateBirthdate || '')
      setParentAffiliate(affiliateParentId?.toString() || '')
      setAllowReferral(affiliateCanHaveReferrals || false)
      setHasCustomCommission(!!affiliateCustomCommission)
      setCustomCommission(affiliateCustomCommission?.toString() || '')
    }
  }, [
    isOpen,
    initialName,
    initialEmail,
    affiliatePhone,
    affiliateParentId,
    affiliateSocialNetwork,
    affiliateBusinessName,
    affiliateCpf,
    affiliateBusinessCnpj,
    affiliateBirthdate,
    affiliateCanHaveReferrals,
    affiliateCustomCommission,
  ])

  const handleSave = () => {
    onSave({
      allowReferral,
      name: affiliateName,
      email: affiliateEmail,
      socialNetwork,
      companyName,
      cpf,
      cnpj,
      phone,
      birthDate,
      hasCustomCommission,
      customCommission,
      parentAffiliate,
    })
    handleCancel()
  }

  const handleCancel = () => {
    setAllowReferral(false)
    setSocialNetwork('')
    setCompanyName('')
    setCpf('')
    setCnpj('')
    setBirthDate('')
    setHasCustomCommission(false)
    setCustomCommission('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
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
                src={affiliateAvatar || undefined}
              />
              <VStack align="start" spacing={0}>
                <Text fontSize="md" fontWeight="600" color="#131D53">
                  {affiliateName}
                </Text>
                {affiliateAge && (
                  <Text fontSize="sm" color="#131D5399">
                    {affiliateAge}
                  </Text>
                )}
              </VStack>
            </Flex>

            <FormControl>
              <Checkbox
                colorScheme="blue"
                isChecked={allowReferral}
                onChange={(e) => setAllowReferral(e.target.checked)}
                fontSize="sm"
                color="#131D53"
              >
                Permitir indicação de afiliados
              </Checkbox>
            </FormControl>

            <Flex gap={4} flexWrap="wrap">
              <FormControl flex="1" minW="250px">
                <FormLabel fontSize="sm" color="#131D53" mb={2}>
                  Nome *
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
                  E-mail *
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
                  placeholder="Digite o CPF"
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
                  placeholder="Digite o CNPJ"
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
                  placeholder="Digite o telefone"
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
                  placeholder="dd/mm/aaaa"
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
              <Box flex="1" minW="250px">
                <FormControl>
                  <FormLabel fontSize="sm" color="#131D53" mb={2}>
                    Comissão Customizada
                  </FormLabel>
                  <HStack>
                    <Input
                      type="number"
                      placeholder="Digite a comissão"
                      value={customCommission}
                      onChange={(e) => setCustomCommission(e.target.value)}
                      borderColor="#DEE6F2"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                      isDisabled={!hasCustomCommission}
                      bg={!hasCustomCommission ? '#F7FAFC' : 'white'}
                    />
                    <Text fontSize="sm" color="#131D53">
                      %
                    </Text>
                  </HStack>
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

              <FormControl flex="1" minW="250px">
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
                  {availableParents
                    .filter((a) => a.id !== affiliateId)
                    .map((affiliate) => (
                      <option
                        key={affiliate.id}
                        value={affiliate.id.toString()}
                      >
                        {affiliate.name}
                      </option>
                    ))}
                </Select>
              </FormControl>
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
              onClick={handleCancel}
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
              onClick={handleSave}
            >
              Salvar Alterações
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
