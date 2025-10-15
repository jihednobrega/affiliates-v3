import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import Head from 'next/head'
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Button,
  Avatar,
  FormControl,
  FormLabel,
  Input,
  Select,
  Grid,
  GridItem,
  Alert,
  AlertIcon,
  useToast,
  Spinner,
  IconButton,
  FormErrorMessage,
  Tooltip,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { ProfileService } from '@/services/profile'
import {
  AffiliateProfileData,
  UpdateProfileData,
  ACCOUNT_TYPE_LABELS,
  AccountType,
} from '@/services/types/profile.types'
import {
  Camera,
  Save,
  X,
  Lock,
  Search,
  User,
  UserCircle,
  Building2,
  MapPin,
  CreditCard,
} from 'lucide-react'
import { masks } from '@/utils/masks'
import { validators, ValidationResult } from '@/utils/validators'
import { fetchCEPData } from '@/utils/cep'
import { FilesService } from '@/services/files'

export default function ProfilePage() {
  const toast = useToast()
  const profileService = new ProfileService()
  const filesService = new FilesService()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState<AffiliateProfileData | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarRemoved, setAvatarRemoved] = useState(false)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null
  )

  const [loadingCEP, setLoadingCEP] = useState(false)
  const [lastCEPValue, setLastCEPValue] = useState('')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [isFieldReadonly, setIsFieldReadonly] = useState({
    business_cnpj: false,
    business_name: false,
    email: true,
    cpf: true,
    social_network: false,
    profile_url: true,
  })

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    birthdate: '',
    social_network: '',

    business_cnpj: '',
    business_name: '',

    address: {
      zipcode: '',
      address: '',
      number: '',
      complement: '',
      district: '',
      city: '',
      state: '',
      country: 'Brasil',
    },

    bank: {
      bank_name: '',
      agency_number: '',
      account_number: '',
      account_type: 'checking' as AccountType,
      pix_key: '',
      pix_type: '',
    },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError(null)

      try {
        const { response, status } = await profileService.getAffiliateProfile()

        if (status >= 200 && status < 300 && response?.success) {
          const data = response.data
          setProfileData(data)

          setFormData({
            name: data.name || '',
            email: data.email || '',
            cpf: data.cpf || '',
            phone: data.phone || '',
            birthdate: data.birthdate || '',
            social_network: data.social_network || '',

            business_cnpj: data.business_cnpj || '',
            business_name: data.business_name || '',
            address: {
              zipcode: data.address?.zipcode || '',
              address: data.address?.address || '',
              number: data.address?.number || '',
              complement: data.address?.complement || '',
              district: data.address?.district || '',
              city: data.address?.city || '',
              state: data.address?.state || '',
              country: data.address?.country || 'Brasil',
            },
            bank: {
              bank_name: data.bank?.bank_name || '',
              agency_number: data.bank?.agency_number || '',
              account_number: data.bank?.account_number || '',
              account_type: data.bank?.account_type || 'checking',
              pix_key: data.bank?.pix_key || '',
              pix_type: data.bank?.pix_type || '',
            },
          })

          if (data.address?.zipcode) {
            const cleanCEP = data.address.zipcode.replace(/\D/g, '')
            setLastCEPValue(cleanCEP)
          }
        } else {
          setError(
            `Erro ao carregar perfil: ${
              response?.message || 'Erro desconhecido'
            }`
          )
        }
      } catch (err: any) {
        setError(`Erro na requisição: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  useEffect(() => {
    if (profileData) {
      setIsFieldReadonly({
        business_cnpj: Boolean(profileData.business_cnpj),
        business_name: Boolean(profileData.business_name),
        email: true,
        cpf: true,
        social_network: false,
        profile_url: true,
      })
    }
  }, [profileData])

  const validateField = (
    fieldName: string,
    value: string
  ): ValidationResult => {
    switch (fieldName) {
      case 'name':
        return validators.name(value)
      case 'email':
        return validators.email(value)
      case 'cpf':
        return validators.cpf(value)
      case 'phone':
        return validators.phone(value)
      case 'birthdate':
        return validators.birthdate(value)
      case 'business_cnpj':
        return value ? validators.cnpj(value) : { isValid: true }
      case 'address.zipcode':
        return validators.cep(value)
      case 'address.address':
      case 'address.number':
      case 'address.district':
      case 'address.city':
      case 'address.state':
        return validators.required(value)

      default:
        return { isValid: true }
    }
  }

  const applyMask = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case 'cpf':
        return masks.cpf(value)
      case 'phone':
        return masks.phone(value)
      case 'business_cnpj':
        return masks.cnpj(value)
      case 'address.zipcode':
        return masks.cep(value)
      case 'bank.account_number':
        return masks.bankAccount(value)
      case 'bank.agency_number':
        return masks.bankAgency(value)
      default:
        return value
    }
  }

  const updateField = (field: string, value: any) => {
    const maskedValue = applyMask(field, value)

    const validation = validateField(field, maskedValue)

    setFieldErrors((prev) => ({
      ...prev,
      [field]: validation.isValid ? '' : validation.message || 'Campo inválido',
    }))

    setFormData((prev) => {
      const keys = field.split('.')
      const newData = { ...prev }

      if (keys.length === 1) {
        ;(newData as any)[keys[0]] = maskedValue
      } else if (keys.length === 2) {
        ;(newData as any)[keys[0]] = {
          ...(newData as any)[keys[0]],
          [keys[1]]: maskedValue,
        }
      }

      return newData
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!profileData) return

    const fieldsToValidate = [
      'name',
      'email',
      'cpf',
      'phone',
      'birthdate',
      'address.zipcode',
      'address.address',
      'address.number',
      'address.district',
      'address.city',
      'address.state',
    ]

    if (formData.business_cnpj) {
      fieldsToValidate.push('business_cnpj')
    }

    const errors: Record<string, string> = {}
    let hasErrors = false

    fieldsToValidate.forEach((field) => {
      const value = field.includes('.')
        ? (formData as any)[field.split('.')[0]][field.split('.')[1]]
        : (formData as any)[field]

      const validation = validateField(field, value)
      if (!validation.isValid) {
        errors[field] = validation.message || 'Campo inválido'
        hasErrors = true
      }
    })

    setFieldErrors(errors)

    if (hasErrors) {
      toast({
        title: 'Erro de validação',
        description: 'Corrija os campos destacados antes de salvar.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setSaving(true)
    setError(null)

    try {
      let newAvatarUrl = profileData.avatar

      if (avatarRemoved && profileData.avatar) {
        newAvatarUrl = null
      } else if (selectedAvatarFile) {
        try {
          setUploadingAvatar(true)

          const fileData = new FormData()
          fileData.append('type', 'profile_pic')
          fileData.append('file', selectedAvatarFile)

          const uploadResult = await filesService.upload(fileData)

          if (
            uploadResult.status >= 200 &&
            uploadResult.status < 300 &&
            uploadResult.response?.success
          ) {
            newAvatarUrl = uploadResult.response.data.url
          } else {
            throw new Error(
              uploadResult.response?.message || 'Erro ao fazer upload da imagem'
            )
          }
        } catch (avatarError: any) {
          toast({
            title: 'Erro no upload do avatar',
            description:
              avatarError.message || 'Erro ao fazer upload da imagem',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          throw avatarError
        } finally {
          setUploadingAvatar(false)
        }
      }

      const updateData: UpdateProfileData = {
        name: formData.name,
        email: formData.email,
        cpf: formData.cpf,
        phone: formData.phone,
        birthdate: formData.birthdate,
        business_cnpj: formData.business_cnpj,
        business_name: formData.business_name,
        social_network: formData.social_network,
        avatar: newAvatarUrl,
        address: formData.address,
        bank: formData.bank,
      }

      const { response, status } = await profileService.updateAffiliateProfile(
        profileData.id,
        updateData
      )

      if (status >= 200 && status < 300 && response?.success) {
        if (response.data) {
          setProfileData(response.data)
        } else {
          setProfileData((prev) =>
            prev ? { ...prev, avatar: newAvatarUrl } : null
          )
        }

        setSelectedAvatarFile(null)
        setAvatarPreview(null)
        setAvatarRemoved(false)
        setHasChanges(false)

        toast({
          title: 'Perfil atualizado',
          description: 'Suas informações foram salvas com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        setError(`Erro ao salvar: ${response?.message || 'Erro desconhecido'}`)
      }
    } catch (err: any) {
      setError(`Erro na requisição: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        cpf: profileData.cpf || '',
        phone: profileData.phone || '',
        birthdate: profileData.birthdate || '',
        social_network: profileData.social_network || '',

        business_cnpj: profileData.business_cnpj || '',
        business_name: profileData.business_name || '',
        address: {
          zipcode: profileData.address?.zipcode || '',
          address: profileData.address?.address || '',
          number: profileData.address?.number || '',
          complement: profileData.address?.complement || '',
          district: profileData.address?.district || '',
          city: profileData.address?.city || '',
          state: profileData.address?.state || '',
          country: profileData.address?.country || 'Brasil',
        },
        bank: {
          bank_name: profileData.bank?.bank_name || '',
          agency_number: profileData.bank?.agency_number || '',
          account_number: profileData.bank?.account_number || '',
          account_type: profileData.bank?.account_type || 'checking',
          pix_key: profileData.bank?.pix_key || '',
          pix_type: profileData.bank?.pix_type || '',
        },
      })
      setHasChanges(false)

      setSelectedAvatarFile(null)
      setAvatarPreview(null)
    }
  }

  const validateImageFile = (
    file: File
  ): { isValid: boolean; message?: string } => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        message: 'Apenas arquivos JPG, PNG ou WebP são permitidos',
      }
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return { isValid: false, message: 'O arquivo deve ter no máximo 5MB' }
    }

    return { isValid: true }
  }

  const handleAvatarFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.isValid) {
      toast({
        title: 'Erro no arquivo',
        description: validation.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setSelectedAvatarFile(file)
    setAvatarRemoved(false)

    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
      setHasChanges(true)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setSelectedAvatarFile(null)
    setAvatarPreview(null)
    setAvatarRemoved(true)
    setHasChanges(true)
  }

  const handleCEPSearch = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '')
    if (cleanCEP.length !== 8) return

    if (cleanCEP === lastCEPValue) return

    setLoadingCEP(true)
    setLastCEPValue(cleanCEP)

    try {
      const result = await fetchCEPData(cep)

      if (result.success && result.data) {
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            address: result.data!.address,
            district: result.data!.district,
            city: result.data!.city,
            state: result.data!.state,
          },
        }))

        setFieldErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors['address.address']
          delete newErrors['address.district']
          delete newErrors['address.city']
          delete newErrors['address.state']
          return newErrors
        })

        setHasChanges(true)

        toast({
          title: 'CEP encontrado',
          description: 'As informações de endereço foram atualizadas!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'CEP não encontrado',
          description: result.message || 'Verifique o CEP informado',
          status: 'warning',
          duration: 4000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Erro na busca',
        description: 'Erro ao consultar CEP',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setLoadingCEP(false)
    }
  }

  return (
    <>
      <Head>
        <title>Meu Perfil | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Flex gap={2} align="center">
            <User size={24} color="#131D53" />
            <Text fontSize="sm" color="#131D53">
              Meu Perfil
            </Text>
          </Flex>

          {hasChanges && (
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<X size={16} />}
                onClick={handleCancel}
                isDisabled={saving}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<Save size={16} />}
                onClick={handleSave}
                isLoading={saving}
                loadingText="Salvando..."
              >
                Salvar
              </Button>
            </HStack>
          )}
        </PageHeader>

        <PageContent>
          {loading ? (
            <Flex justify="center" align="center" minH="200px">
              <VStack spacing={4}>
                <Spinner size="lg" color="blue.500" />
                <Text color="gray.600">Carregando dados do perfil...</Text>
              </VStack>
            </Flex>
          ) : error ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            <VStack spacing={3} align="stretch" width="100%">
              {/* Avatar e Info Básica */}
              <Box px={2}>
                <HStack spacing={4}>
                  <Box position="relative">
                    <Avatar
                      src={
                        avatarPreview ||
                        (!avatarRemoved ? profileData?.avatar : undefined) ||
                        undefined
                      }
                      name={formData.name || 'Usuário'}
                      size="xl"
                      bg="blue.500"
                    />

                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileSelect}
                      style={{ display: 'none' }}
                      id="avatar-upload"
                    />

                    <IconButton
                      as="label"
                      htmlFor="avatar-upload"
                      aria-label="Alterar foto"
                      icon={<Camera size={16} />}
                      size="sm"
                      colorScheme="blue"
                      variant="solid"
                      borderRadius="full"
                      position="absolute"
                      bottom={0}
                      right={0}
                      cursor="pointer"
                      isLoading={uploadingAvatar}
                      _hover={{ transform: 'scale(1.1)' }}
                      _active={{ transform: 'scale(0.95)' }}
                    />

                    {(avatarPreview ||
                      (!avatarRemoved && profileData?.avatar)) && (
                      <IconButton
                        aria-label="Remover foto"
                        icon={<X size={14} />}
                        size="xs"
                        colorScheme="red"
                        variant="solid"
                        borderRadius="full"
                        position="absolute"
                        top={0}
                        right={0}
                        cursor="pointer"
                        onClick={handleRemoveAvatar}
                        _hover={{ transform: 'scale(1.1)' }}
                        _active={{ transform: 'scale(0.95)' }}
                      />
                    )}
                  </Box>

                  <VStack spacing={1} align="start">
                    <Text fontSize="lg" fontWeight="semibold" color="#131D53">
                      {formData.name || 'Nome não informado'}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {formData.email || 'Email não informado'}
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <VStack spacing={3} align="stretch">
                <Box
                  bg="white"
                  p={4}
                  borderRadius="xl"
                  borderWidth={1}
                  borderColor="#dee6f2"
                  className="container-shadow"
                >
                  <Flex align="center" gap={3} mb={4}>
                    <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                      <UserCircle size={16} color="#1F70F1" />
                    </Box>
                    <Text fontSize="xs" color="#131d5399" fontWeight="medium">
                      Informações Pessoais
                    </Text>
                  </Flex>

                  <Grid
                    templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                    gap={4}
                  >
                    <GridItem>
                      <FormControl isInvalid={Boolean(fieldErrors.name)}>
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          Nome Completo
                        </FormLabel>
                        <Input
                          value={formData.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          placeholder="Seu nome completo"
                          bg="gray.50"
                          borderColor={fieldErrors.name ? 'red.300' : '#c8d4e6'}
                          _hover={{
                            borderColor: fieldErrors.name
                              ? 'red.400'
                              : 'blue.400',
                          }}
                          _focus={{
                            borderColor: fieldErrors.name
                              ? 'red.500'
                              : 'blue.500',
                            bg: 'white',
                          }}
                        />
                        <FormErrorMessage>{fieldErrors.name}</FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isInvalid={Boolean(fieldErrors.email)}>
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          E-mail
                          {isFieldReadonly.email && (
                            <Tooltip label="Campo protegido - não pode ser alterado">
                              <Lock
                                size={12}
                                style={{ display: 'inline', marginLeft: '4px' }}
                              />
                            </Tooltip>
                          )}
                        </FormLabel>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          placeholder="seu@email.com"
                          bg={isFieldReadonly.email ? 'gray.100' : 'gray.50'}
                          opacity={isFieldReadonly.email ? 0.7 : 1}
                          borderColor={
                            fieldErrors.email ? 'red.300' : '#c8d4e6'
                          }
                          _hover={{
                            borderColor: fieldErrors.email
                              ? 'red.400'
                              : 'blue.400',
                          }}
                          _focus={{
                            borderColor: fieldErrors.email
                              ? 'red.500'
                              : 'blue.500',
                            bg: 'white',
                          }}
                          isReadOnly={isFieldReadonly.email}
                          cursor={
                            isFieldReadonly.email ? 'not-allowed' : 'text'
                          }
                        />
                        <FormErrorMessage>{fieldErrors.email}</FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isInvalid={Boolean(fieldErrors.cpf)}>
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          CPF
                          {isFieldReadonly.cpf && (
                            <Tooltip label="Campo protegido - CPF vem do sistema e não pode ser alterado">
                              <Lock
                                size={12}
                                style={{ display: 'inline', marginLeft: '4px' }}
                              />
                            </Tooltip>
                          )}
                        </FormLabel>
                        <Input
                          value={masks.cpf(formData.cpf)}
                          onChange={(e) => updateField('cpf', e.target.value)}
                          placeholder="000.000.000-00"
                          bg={isFieldReadonly.cpf ? 'gray.100' : 'gray.50'}
                          opacity={isFieldReadonly.cpf ? 0.7 : 1}
                          borderColor={fieldErrors.cpf ? 'red.300' : '#c8d4e6'}
                          _hover={{
                            borderColor: fieldErrors.cpf
                              ? 'red.400'
                              : 'blue.400',
                          }}
                          _focus={{
                            borderColor: fieldErrors.cpf
                              ? 'red.500'
                              : 'blue.500',
                            bg: 'white',
                          }}
                          isReadOnly={isFieldReadonly.cpf}
                          cursor={isFieldReadonly.cpf ? 'not-allowed' : 'text'}
                        />
                        <FormErrorMessage>{fieldErrors.cpf}</FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isInvalid={Boolean(fieldErrors.phone)}>
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          Telefone
                        </FormLabel>
                        <Input
                          value={formData.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          placeholder="(11) 99999-9999"
                          bg="gray.50"
                          borderColor={
                            fieldErrors.phone ? 'red.300' : '#c8d4e6'
                          }
                          _hover={{
                            borderColor: fieldErrors.phone
                              ? 'red.400'
                              : 'blue.400',
                          }}
                          _focus={{
                            borderColor: fieldErrors.phone
                              ? 'red.500'
                              : 'blue.500',
                            bg: 'white',
                          }}
                        />
                        <FormErrorMessage>{fieldErrors.phone}</FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isInvalid={Boolean(fieldErrors.birthdate)}>
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          Data de Nascimento
                        </FormLabel>
                        <Input
                          type="date"
                          value={formData.birthdate}
                          onChange={(e) =>
                            updateField('birthdate', e.target.value)
                          }
                          bg="gray.50"
                          borderColor={
                            fieldErrors.birthdate ? 'red.300' : '#c8d4e6'
                          }
                          _hover={{
                            borderColor: fieldErrors.birthdate
                              ? 'red.400'
                              : 'blue.400',
                          }}
                          _focus={{
                            borderColor: fieldErrors.birthdate
                              ? 'red.500'
                              : 'blue.500',
                            bg: 'white',
                          }}
                        />
                        <FormErrorMessage>
                          {fieldErrors.birthdate}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl
                        isInvalid={Boolean(fieldErrors.social_network)}
                      >
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          Instagram
                        </FormLabel>
                        <Input
                          value={formData.social_network}
                          onChange={(e) =>
                            updateField('social_network', e.target.value)
                          }
                          placeholder="@seuusuario"
                          bg="gray.50"
                          borderColor={
                            fieldErrors.social_network ? 'red.300' : '#c8d4e6'
                          }
                          _hover={{
                            borderColor: fieldErrors.social_network
                              ? 'red.400'
                              : 'blue.400',
                          }}
                          _focus={{
                            borderColor: fieldErrors.social_network
                              ? 'red.500'
                              : 'blue.500',
                            bg: 'white',
                          }}
                        />
                        <FormErrorMessage>
                          {fieldErrors.social_network}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </Box>

                <Box
                  bg="white"
                  p={4}
                  borderRadius="xl"
                  borderWidth={1}
                  borderColor="#dee6f2"
                  className="container-shadow"
                >
                  <Flex align="center" gap={3} mb={4}>
                    <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                      <Building2 size={16} color="#1F70F1" />
                    </Box>
                    <Text fontSize="xs" color="#131d5399" fontWeight="medium">
                      Informações da Empresa
                    </Text>
                  </Flex>

                  <Grid
                    templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                    gap={4}
                  >
                    <GridItem>
                      <FormControl
                        isInvalid={Boolean(fieldErrors.business_cnpj)}
                      >
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          CNPJ
                          {isFieldReadonly.business_cnpj && (
                            <Tooltip label="Campo protegido - não pode ser alterado após o primeiro preenchimento">
                              <Lock
                                size={12}
                                style={{ display: 'inline', marginLeft: '4px' }}
                              />
                            </Tooltip>
                          )}
                        </FormLabel>
                        <Input
                          value={formData.business_cnpj}
                          onChange={(e) =>
                            updateField('business_cnpj', e.target.value)
                          }
                          placeholder="00.000.000/0000-00"
                          bg={
                            isFieldReadonly.business_cnpj
                              ? 'gray.100'
                              : 'gray.50'
                          }
                          borderColor={
                            fieldErrors.business_cnpj ? 'red.300' : '#c8d4e6'
                          }
                          _hover={{
                            borderColor: fieldErrors.business_cnpj
                              ? 'red.400'
                              : 'blue.400',
                          }}
                          _focus={{
                            borderColor: fieldErrors.business_cnpj
                              ? 'red.500'
                              : 'blue.500',
                            bg: 'white',
                          }}
                          isReadOnly={isFieldReadonly.business_cnpj}
                          cursor={
                            isFieldReadonly.business_cnpj
                              ? 'not-allowed'
                              : 'text'
                          }
                        />
                        <FormErrorMessage>
                          {fieldErrors.business_cnpj}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl
                        isInvalid={Boolean(fieldErrors.business_name)}
                      >
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          Razão Social
                          {isFieldReadonly.business_name && (
                            <Tooltip label="Campo protegido - não pode ser alterado após o primeiro preenchimento">
                              <Lock
                                size={12}
                                style={{ display: 'inline', marginLeft: '4px' }}
                              />
                            </Tooltip>
                          )}
                        </FormLabel>
                        <Input
                          value={formData.business_name}
                          onChange={(e) =>
                            updateField('business_name', e.target.value)
                          }
                          placeholder="Nome da empresa"
                          bg={
                            isFieldReadonly.business_name
                              ? 'gray.100'
                              : 'gray.50'
                          }
                          borderColor={
                            fieldErrors.business_name ? 'red.300' : '#c8d4e6'
                          }
                          _hover={{
                            borderColor: fieldErrors.business_name
                              ? 'red.400'
                              : 'blue.400',
                          }}
                          _focus={{
                            borderColor: fieldErrors.business_name
                              ? 'red.500'
                              : 'blue.500',
                            bg: 'white',
                          }}
                          isReadOnly={isFieldReadonly.business_name}
                          cursor={
                            isFieldReadonly.business_name
                              ? 'not-allowed'
                              : 'text'
                          }
                        />
                        <FormErrorMessage>
                          {fieldErrors.business_name}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </Box>

                <Box
                  bg="white"
                  p={4}
                  borderRadius="xl"
                  borderWidth={1}
                  borderColor="#dee6f2"
                  className="container-shadow"
                >
                  <Flex align="center" gap={3} mb={4}>
                    <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                      <MapPin size={16} color="#1F70F1" />
                    </Box>
                    <Text fontSize="xs" color="#131d5399" fontWeight="medium">
                      Endereço
                    </Text>
                  </Flex>

                  <Grid
                    templateColumns={{
                      base: '1fr',
                      md: 'repeat(2, 1fr)',
                      lg: 'repeat(3, 1fr)',
                    }}
                    gap={4}
                  >
                    <GridItem>
                      <FormControl
                        isInvalid={Boolean(fieldErrors['address.zipcode'])}
                      >
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          CEP
                        </FormLabel>
                        <InputGroup>
                          <Input
                            value={formData.address.zipcode}
                            onChange={(e) =>
                              updateField('address.zipcode', e.target.value)
                            }
                            onBlur={(e) => handleCEPSearch(e.target.value)}
                            placeholder="00000-000"
                            bg="gray.50"
                            borderColor={
                              fieldErrors['address.zipcode']
                                ? 'red.300'
                                : '#c8d4e6'
                            }
                            _hover={{
                              borderColor: fieldErrors['address.zipcode']
                                ? 'red.400'
                                : 'blue.400',
                            }}
                            _focus={{
                              borderColor: fieldErrors['address.zipcode']
                                ? 'red.500'
                                : 'blue.500',
                              bg: 'white',
                            }}
                          />
                          <InputRightElement>
                            <IconButton
                              aria-label="Buscar CEP"
                              icon={<Search size={16} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() =>
                                handleCEPSearch(formData.address.zipcode)
                              }
                              isLoading={loadingCEP}
                              _hover={{ bg: 'blue.50' }}
                            />
                          </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>
                          {fieldErrors['address.zipcode']}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem colSpan={{ base: 1, md: 2 }}>
                      <FormControl
                        isInvalid={Boolean(fieldErrors['address.address'])}
                      >
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          Endereço
                          {formData.address.zipcode && (
                            <Tooltip label="Campo preenchido automaticamente pelo CEP">
                              <Lock
                                size={12}
                                style={{ display: 'inline', marginLeft: '4px' }}
                              />
                            </Tooltip>
                          )}
                        </FormLabel>
                        <Input
                          value={formData.address.address}
                          onChange={(e) =>
                            updateField('address.address', e.target.value)
                          }
                          placeholder="Rua, avenida, etc."
                          bg={formData.address.zipcode ? 'gray.100' : 'gray.50'}
                          borderColor={
                            fieldErrors['address.address']
                              ? 'red.300'
                              : '#c8d4e6'
                          }
                          _hover={{
                            borderColor: fieldErrors['address.address']
                              ? 'red.400'
                              : 'blue.400',
                          }}
                          _focus={{
                            borderColor: fieldErrors['address.address']
                              ? 'red.500'
                              : 'blue.500',
                            bg: 'white',
                          }}
                          isReadOnly={Boolean(formData.address.zipcode)}
                          opacity={formData.address.zipcode ? 0.7 : 1}
                          cursor={
                            formData.address.zipcode ? 'not-allowed' : 'text'
                          }
                        />
                        <FormErrorMessage>
                          {fieldErrors['address.address']}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl
                        isInvalid={Boolean(fieldErrors['address.number'])}
                      >
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          Número
                        </FormLabel>
                        <Input
                          value={formData.address.number}
                          onChange={(e) =>
                            updateField('address.number', e.target.value)
                          }
                          placeholder="123"
                          bg="gray.50"
                          borderColor={
                            fieldErrors['address.number']
                              ? 'red.300'
                              : '#c8d4e6'
                          }
                          _hover={{
                            borderColor: fieldErrors['address.number']
                              ? 'red.400'
                              : 'blue.400',
                          }}
                          _focus={{
                            borderColor: fieldErrors['address.number']
                              ? 'red.500'
                              : 'blue.500',
                            bg: 'white',
                          }}
                        />
                        <FormErrorMessage>
                          {fieldErrors['address.number']}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          Complemento
                        </FormLabel>
                        <Input
                          value={formData.address.complement}
                          onChange={(e) =>
                            updateField('address.complement', e.target.value)
                          }
                          placeholder="Apt, bloco, etc."
                          bg="gray.50"
                          borderColor="#c8d4e6"
                          _hover={{ borderColor: 'blue.400' }}
                          _focus={{ borderColor: 'blue.500', bg: 'white' }}
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl
                        isInvalid={Boolean(fieldErrors['address.district'])}
                      >
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          Bairro
                          {formData.address.zipcode && (
                            <Tooltip label="Campo preenchido automaticamente pelo CEP">
                              <Lock
                                size={12}
                                style={{ display: 'inline', marginLeft: '4px' }}
                              />
                            </Tooltip>
                          )}
                        </FormLabel>
                        <Input
                          value={formData.address.district}
                          onChange={(e) =>
                            updateField('address.district', e.target.value)
                          }
                          placeholder="Nome do bairro"
                          bg={formData.address.zipcode ? 'gray.100' : 'gray.50'}
                          borderColor={
                            fieldErrors['address.district']
                              ? 'red.300'
                              : '#c8d4e6'
                          }
                          _hover={{
                            borderColor: fieldErrors['address.district']
                              ? 'red.400'
                              : 'blue.400',
                          }}
                          _focus={{
                            borderColor: fieldErrors['address.district']
                              ? 'red.500'
                              : 'blue.500',
                            bg: 'white',
                          }}
                          isReadOnly={Boolean(formData.address.zipcode)}
                          opacity={formData.address.zipcode ? 0.7 : 1}
                          cursor={
                            formData.address.zipcode ? 'not-allowed' : 'text'
                          }
                        />
                        <FormErrorMessage>
                          {fieldErrors['address.district']}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl
                        isInvalid={Boolean(fieldErrors['address.city'])}
                      >
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          Cidade
                          {formData.address.zipcode && (
                            <Tooltip label="Campo preenchido automaticamente pelo CEP">
                              <Lock
                                size={12}
                                style={{ display: 'inline', marginLeft: '4px' }}
                              />
                            </Tooltip>
                          )}
                        </FormLabel>
                        <Input
                          value={formData.address.city}
                          onChange={(e) =>
                            updateField('address.city', e.target.value)
                          }
                          placeholder="Nome da cidade"
                          bg={formData.address.zipcode ? 'gray.100' : 'gray.50'}
                          borderColor={
                            fieldErrors['address.city'] ? 'red.300' : '#c8d4e6'
                          }
                          _hover={{
                            borderColor: fieldErrors['address.city']
                              ? 'red.400'
                              : 'blue.400',
                          }}
                          _focus={{
                            borderColor: fieldErrors['address.city']
                              ? 'red.500'
                              : 'blue.500',
                            bg: 'white',
                          }}
                          isReadOnly={Boolean(formData.address.zipcode)}
                          opacity={formData.address.zipcode ? 0.7 : 1}
                          cursor={
                            formData.address.zipcode ? 'not-allowed' : 'text'
                          }
                        />
                        <FormErrorMessage>
                          {fieldErrors['address.city']}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl
                        isInvalid={Boolean(fieldErrors['address.state'])}
                      >
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          Estado
                          {formData.address.zipcode && (
                            <Tooltip label="Campo preenchido automaticamente pelo CEP">
                              <Lock
                                size={12}
                                style={{ display: 'inline', marginLeft: '4px' }}
                              />
                            </Tooltip>
                          )}
                        </FormLabel>
                        <Input
                          value={formData.address.state}
                          onChange={(e) =>
                            updateField('address.state', e.target.value)
                          }
                          placeholder="SP"
                          bg={formData.address.zipcode ? 'gray.100' : 'gray.50'}
                          borderColor={
                            fieldErrors['address.state'] ? 'red.300' : '#c8d4e6'
                          }
                          _hover={{
                            borderColor: fieldErrors['address.state']
                              ? 'red.400'
                              : 'blue.400',
                          }}
                          _focus={{
                            borderColor: fieldErrors['address.state']
                              ? 'red.500'
                              : 'blue.500',
                            bg: 'white',
                          }}
                          isReadOnly={Boolean(formData.address.zipcode)}
                          opacity={formData.address.zipcode ? 0.7 : 1}
                          cursor={
                            formData.address.zipcode ? 'not-allowed' : 'text'
                          }
                        />
                        <FormErrorMessage>
                          {fieldErrors['address.state']}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          País
                          {formData.address.zipcode && (
                            <Tooltip label="Campo preenchido automaticamente pelo CEP">
                              <Lock
                                size={12}
                                style={{ display: 'inline', marginLeft: '4px' }}
                              />
                            </Tooltip>
                          )}
                        </FormLabel>
                        <Input
                          value={formData.address.country}
                          onChange={(e) =>
                            updateField('address.country', e.target.value)
                          }
                          placeholder="Brasil"
                          bg={formData.address.zipcode ? 'gray.100' : 'gray.50'}
                          borderColor="#c8d4e6"
                          _hover={{ borderColor: 'blue.400' }}
                          _focus={{ borderColor: 'blue.500', bg: 'white' }}
                          isReadOnly={Boolean(formData.address.zipcode)}
                          opacity={formData.address.zipcode ? 0.7 : 1}
                          cursor={
                            formData.address.zipcode ? 'not-allowed' : 'text'
                          }
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>
                </Box>

                <Box
                  bg="white"
                  p={4}
                  borderRadius="xl"
                  borderWidth={1}
                  borderColor="#dee6f2"
                  className="container-shadow"
                >
                  <Flex align="center" gap={3} mb={4}>
                    <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                      <CreditCard size={16} color="#1F70F1" />
                    </Box>
                    <Text fontSize="xs" color="#131d5399" fontWeight="medium">
                      Dados Bancários
                    </Text>
                  </Flex>

                  <Grid
                    templateColumns={{
                      base: '1fr',
                      md: 'repeat(2, 1fr)',
                      lg: 'repeat(3, 1fr)',
                    }}
                    gap={4}
                  >
                    <GridItem>
                      <FormControl>
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          Banco
                        </FormLabel>
                        <Input
                          value={formData.bank.bank_name}
                          onChange={(e) =>
                            updateField('bank.bank_name', e.target.value)
                          }
                          placeholder="Nome do banco"
                          bg="gray.50"
                          borderColor="#c8d4e6"
                          _hover={{ borderColor: 'blue.400' }}
                          _focus={{ borderColor: 'blue.500', bg: 'white' }}
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          Tipo de Conta
                        </FormLabel>
                        <Select
                          value={formData.bank.account_type}
                          onChange={(e) =>
                            updateField(
                              'bank.account_type',
                              e.target.value as AccountType
                            )
                          }
                          bg="gray.50"
                          borderColor="#c8d4e6"
                          _hover={{ borderColor: 'blue.400' }}
                          _focus={{ borderColor: 'blue.500', bg: 'white' }}
                        >
                          {Object.entries(ACCOUNT_TYPE_LABELS).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            )
                          )}
                        </Select>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          Agência
                        </FormLabel>
                        <Input
                          value={formData.bank.agency_number}
                          onChange={(e) =>
                            updateField('bank.agency_number', e.target.value)
                          }
                          placeholder="1234-5"
                          bg="gray.50"
                          borderColor="#c8d4e6"
                          _hover={{ borderColor: 'blue.400' }}
                          _focus={{ borderColor: 'blue.500', bg: 'white' }}
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel
                          fontSize="sm"
                          color="#131D53"
                          fontWeight="400"
                        >
                          Conta
                        </FormLabel>
                        <Input
                          value={formData.bank.account_number}
                          onChange={(e) =>
                            updateField('bank.account_number', e.target.value)
                          }
                          placeholder="12345-6"
                          bg="gray.50"
                          borderColor="#c8d4e6"
                          _hover={{ borderColor: 'blue.400' }}
                          _focus={{ borderColor: 'blue.500', bg: 'white' }}
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>
                </Box>
              </VStack>
            </VStack>
          )}
        </PageContent>
      </AppLayout>
    </>
  )
}
