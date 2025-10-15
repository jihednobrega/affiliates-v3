import { useState, useRef, useCallback } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Icon,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Image,
  Flex,
  Divider,
} from '@chakra-ui/react'
import {
  Upload,
  User,
  Camera,
  Home,
  Building,
  TrendingUp,
  AlertCircle,
  Trash2,
} from 'lucide-react'
import { ProfileService } from '@/services/profile'

interface CreateAccountModalProps {
  isOpen: boolean
  onClose: () => void
  userType: 'PF' | 'PJ'
  reason?: string
  extraMessage?: string
  onSuccess?: () => void
}

interface FileUploadState {
  file: File | null
  preview: string | null
  error: string | null
  isValid: boolean
}

interface FormData {
  identification: FileUploadState
  selfie: FileUploadState
  address_proof: FileUploadState
  social_contract: FileUploadState
  balance_sheet: FileUploadState
}

const MAX_FILE_SIZE = 15 * 1024 * 1024
const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf',
]

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  userType,
  reason,
  extraMessage,
  onSuccess,
}) => {
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const profileService = new ProfileService()
  const [formData, setFormData] = useState<FormData>({
    identification: { file: null, preview: null, error: null, isValid: false },
    selfie: { file: null, preview: null, error: null, isValid: false },
    address_proof: { file: null, preview: null, error: null, isValid: false },
    social_contract: { file: null, preview: null, error: null, isValid: false },
    balance_sheet: { file: null, preview: null, error: null, isValid: false },
  })

  const identificationRef = useRef<HTMLInputElement>(null)
  const selfieRef = useRef<HTMLInputElement>(null)
  const addressProofRef = useRef<HTMLInputElement>(null)
  const socialContractRef = useRef<HTMLInputElement>(null)
  const balanceSheetRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (file: File): { isValid: boolean; error: string | null } => {
      if (file.size > MAX_FILE_SIZE) {
        return { isValid: false, error: 'Arquivo muito grande. Máximo 15MB.' }
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return {
          isValid: false,
          error: 'Formato inválido. Use PNG, JPEG, JPG ou PDF.',
        }
      }

      return { isValid: true, error: null }
    },
    []
  )

  const handleFileSelect = useCallback(
    (fieldName: keyof FormData, file: File | null) => {
      if (!file) return

      const validation = validateFile(file)
      let preview: string | null = null

      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file)
      }

      setFormData((prev) => {
        if (prev[fieldName].preview) {
          URL.revokeObjectURL(prev[fieldName].preview!)
        }

        return {
          ...prev,
          [fieldName]: {
            file,
            preview,
            error: validation.error,
            isValid: validation.isValid,
          },
        }
      })
    },
    [validateFile]
  )

  const handleClose = useCallback(() => {
    Object.values(formData).forEach((field) => {
      if (field.preview) {
        URL.revokeObjectURL(field.preview)
      }
    })

    setFormData({
      identification: {
        file: null,
        preview: null,
        error: null,
        isValid: false,
      },
      selfie: { file: null, preview: null, error: null, isValid: false },
      address_proof: { file: null, preview: null, error: null, isValid: false },
      social_contract: {
        file: null,
        preview: null,
        error: null,
        isValid: false,
      },
      balance_sheet: { file: null, preview: null, error: null, isValid: false },
    })

    onClose()
  }, [formData, onClose])

  const getRequiredFields = (): (keyof FormData)[] => {
    const base: (keyof FormData)[] = [
      'identification',
      'selfie',
      'address_proof',
    ]
    return userType === 'PJ' ? [...base, 'social_contract'] : base
  }

  const handleClearFile = useCallback((fieldName: keyof FormData) => {
    setFormData((prev) => {
      if (prev[fieldName].preview) {
        URL.revokeObjectURL(prev[fieldName].preview!)
      }

      return {
        ...prev,
        [fieldName]: {
          file: null,
          preview: null,
          error: null,
          isValid: false,
        },
      }
    })
  }, [])

  const isFormValid = useCallback((): boolean => {
    const required = getRequiredFields()
    return required.every(
      (field) => formData[field].isValid && formData[field].file
    )
  }, [formData, userType])

  const fieldConfigs = [
    {
      key: 'identification' as keyof FormData,
      label: 'Documento Pessoal (RG/CPF)',
      icon: User,
      required: true,
      ref: identificationRef,
      description: 'Envie foto ou scan do seu RG ou CPF',
    },
    {
      key: 'selfie' as keyof FormData,
      label: 'Foto Selfie',
      icon: Camera,
      required: true,
      ref: selfieRef,
      description: 'Selfie segurando o documento',
    },
    {
      key: 'address_proof' as keyof FormData,
      label: 'Comprovante de Residência',
      icon: Home,
      required: true,
      ref: addressProofRef,
      description: 'Conta de luz, água ou telefone (máx. 3 meses)',
    },
    ...(userType === 'PJ'
      ? [
          {
            key: 'social_contract' as keyof FormData,
            label: 'Contrato Social',
            icon: Building,
            required: true,
            ref: socialContractRef,
            description: 'Contrato social ou documento equivalente',
          },
          {
            key: 'balance_sheet' as keyof FormData,
            label: 'Relatório Financeiro',
            icon: TrendingUp,
            required: false,
            ref: balanceSheetRef,
            description: 'Balanço patrimonial (opcional)',
          },
        ]
      : []),
  ]

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({
        title: 'Documentos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        status: 'error',
        duration: 3000,
      })
      return
    }

    setIsSubmitting(true)

    try {
      const uploadData = new FormData()
      uploadData.append('account_type', userType)

      Object.entries(formData).forEach(([key, value]) => {
        if (value.file && value.isValid) {
          uploadData.append(key, value.file)
        }
      })

      const isReupload = reason === 'account_rejected'

      const { response, status } = isReupload
        ? await profileService.uploadDocuments(uploadData)
        : await profileService.createAccount(uploadData)

      if (status !== 200 && status !== 201) {
        throw new Error(response.message || 'Erro no servidor')
      }

      toast({
        title: 'Documentos enviados!',
        description: isReupload
          ? 'Documentos reenviados com sucesso. Aguarde a análise.'
          : 'Conta digital criada com sucesso. Aguarde a verificação.',
        status: 'success',
        duration: 5000,
      })

      onSuccess?.()
      handleClose()
    } catch (error: any) {
      console.error('Erro ao enviar documentos:', error)

      toast({
        title: 'Erro no envio',
        description:
          error.response?.data?.message || 'Tente novamente mais tarde.',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getModalTitle = (): string => {
    if (reason === 'account_rejected') {
      return 'Reenviar Documentos'
    }
    return `Criar Conta Digital ${userType}`
  }

  const getModalDescription = (): string => {
    if (reason === 'account_rejected') {
      return 'Reenvie os documentos corrigidos para análise.'
    }
    return userType === 'PF'
      ? 'Para receber seus pagamentos, precisamos verificar sua identidade.'
      : 'Para receber seus pagamentos, precisamos verificar os dados da sua empresa.'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: 'sm', md: '2xl' }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        rounded={16}
        p={{ base: 3, md: 4 }}
        maxH="90vh"
        overflow="hidden"
        mx={{ base: 4, md: 0 }}
        my={{ base: 4, md: 0 }}
      >
        <ModalHeader pb={0} px={{ base: 4, md: 6 }}>
          <VStack spacing={1} align="start">
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight={600}
              color="#131D53"
            >
              {getModalTitle()}
            </Text>
            <Text
              fontSize={{ base: 'xs', md: 'sm' }}
              fontWeight={400}
              color="#131D5399"
            >
              {getModalDescription()}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody
          overflow="auto"
          px={{ base: 4, md: 6 }}
          pb={{ base: 4, md: 6 }}
        >
          <VStack spacing={{ base: 4, md: 6 }} align="stretch">
            {reason === 'account_rejected' && extraMessage && (
              <Box bg="#FED7D7" border="1px solid #FC8181" rounded={8} p={3}>
                <HStack>
                  <Icon as={AlertCircle} color="#E53E3E" />
                  <Text fontSize="sm" color="#E53E3E" fontWeight={500}>
                    {extraMessage}
                  </Text>
                </HStack>
              </Box>
            )}

            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              {fieldConfigs.map((config) => {
                const fieldData = formData[config.key]
                const isRequired =
                  config.required && getRequiredFields().includes(config.key)

                return (
                  <Box key={config.key}>
                    <FormControl isInvalid={!!fieldData.error}>
                      <FormLabel
                        fontSize={{ base: 'xs', md: 'sm' }}
                        fontWeight={400}
                        color="#131D5399"
                        mb={2}
                      >
                        <HStack>
                          <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm">
                            <Icon
                              as={config.icon}
                              w={4}
                              h={4}
                              color="#1F70F1"
                            />
                          </Box>
                          <Text>{config.label}</Text>
                          {isRequired && <Text color="red.500">*</Text>}
                        </HStack>
                      </FormLabel>

                      <Box
                        border="2px dashed"
                        borderColor={
                          fieldData.error
                            ? 'red.300'
                            : fieldData.isValid
                            ? 'green.300'
                            : '#DEE6F2'
                        }
                        bg={
                          fieldData.error
                            ? 'red.50'
                            : fieldData.isValid
                            ? 'green.50'
                            : 'gray.50'
                        }
                        rounded={8}
                        p={{ base: 3, md: 4 }}
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{
                          borderColor: fieldData.error ? 'red.400' : 'blue.400',
                        }}
                        onClick={() => config.ref.current?.click()}
                      >
                        {fieldData.file ? (
                          <Flex justify="space-between" align="center" w="full">
                            <HStack flex={1} minW={0} spacing={3}>
                              {fieldData.preview && (
                                <Image
                                  src={fieldData.preview}
                                  alt="Preview"
                                  boxSize={{ base: '32px', md: '40px' }}
                                  objectFit="cover"
                                  rounded={4}
                                  flexShrink={0}
                                />
                              )}
                              <VStack
                                align="start"
                                spacing={0}
                                flex={1}
                                minW={0}
                              >
                                <Text
                                  fontSize={{ base: 'xs', md: 'sm' }}
                                  fontWeight={400}
                                  color="#131D53"
                                  noOfLines={1}
                                  overflow="hidden"
                                  textOverflow="ellipsis"
                                  w="full"
                                >
                                  {fieldData.file.name}
                                </Text>
                                <Text fontSize="xs" color="#131D5399">
                                  {(fieldData.file.size / 1024).toFixed(0)} KB
                                </Text>
                              </VStack>
                            </HStack>
                            <Button
                              size={{ base: 'xs', md: 'sm' }}
                              variant="ghost"
                              colorScheme="red"
                              p={1}
                              minW="auto"
                              h="auto"
                              flexShrink={0}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleClearFile(config.key)
                              }}
                              _hover={{ bg: 'red.100' }}
                            >
                              <Icon
                                as={Trash2}
                                w={{ base: 3.5, md: 4 }}
                                h={{ base: 3.5, md: 4 }}
                              />
                            </Button>
                          </Flex>
                        ) : (
                          <VStack spacing={2}>
                            <Icon
                              as={Upload}
                              w={{ base: 5, md: 6 }}
                              h={{ base: 5, md: 6 }}
                              color="#131D5399"
                            />
                            <Text
                              fontSize={{ base: 'xs', md: 'sm' }}
                              color="#131D53"
                              textAlign="center"
                            >
                              Clique para enviar
                            </Text>
                            <Text
                              fontSize="xs"
                              color="#131D5399"
                              textAlign="center"
                            >
                              {config.description}
                            </Text>
                          </VStack>
                        )}
                      </Box>

                      <Input
                        ref={config.ref}
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={(e) =>
                          handleFileSelect(
                            config.key,
                            e.target.files?.[0] || null
                          )
                        }
                        display="none"
                      />

                      {fieldData.error && (
                        <FormErrorMessage fontSize="xs">
                          {fieldData.error}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  </Box>
                )
              })}
            </VStack>

            <Box
              bg="#FFFBEB"
              border="1px solid #F59E0B"
              p={{ base: 3, md: 4 }}
              rounded={8}
            >
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                fontWeight={500}
                color="#131D53"
                mb={2}
              >
                📋 Informações importantes:
              </Text>
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="#131D5399">
                  • Tamanho máximo: 15MB por arquivo
                </Text>
                <Text fontSize="xs" color="#131D5399">
                  • Formatos aceitos: PNG, JPEG, JPG, PDF
                </Text>
                <Text fontSize="xs" color="#131D5399">
                  • Documentos legíveis e dentro da validade
                </Text>
                <Text fontSize="xs" color="#131D5399">
                  • Análise pode levar até 2 dias úteis
                </Text>
              </VStack>
            </Box>

            <Divider />

            <VStack spacing={{ base: 2, md: 3 }}>
              <Button
                w="full"
                size={{ base: 'sm', md: 'md' }}
                fontSize={{ base: 'xs', md: 'sm' }}
                fontWeight={500}
                color="white"
                bgGradient={
                  isFormValid()
                    ? 'linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)'
                    : 'linear-gradient(180deg, #A0AEC0 -27.08%, #718096 123.81%)'
                }
                shadow={
                  isFormValid()
                    ? '0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset'
                    : '0px 0px 0px 1px #A0AEC0'
                }
                _hover={
                  isFormValid()
                    ? {
                        bgGradient:
                          'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                        shadow:
                          '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                      }
                    : {}
                }
                transition="all 0.2s ease"
                isLoading={isSubmitting}
                loadingText="Enviando..."
                isDisabled={!isFormValid()}
                onClick={handleSubmit}
              >
                {reason === 'account_rejected'
                  ? 'Reenviar Documentos'
                  : 'Criar Conta Digital'}
              </Button>

              <Button
                w="full"
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
                isDisabled={isSubmitting}
              >
                Cancelar
              </Button>
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
