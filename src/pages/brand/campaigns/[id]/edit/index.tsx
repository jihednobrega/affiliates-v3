'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Head from 'next/head'
import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Text,
  VStack,
  Textarea,
  Badge,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  useToast,
  Image,
  FormControl,
  Grid,
  Skeleton,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import {
  Megaphone,
  Tags,
  ShoppingBasket,
  ImageIcon,
  Search,
  ArrowUpDown,
  Plus,
  X,
} from 'lucide-react'
import { ProductImage, Pagination } from '@/components/UI'
import {
  campaignSchema,
  isHighCommission,
  type CampaignFormValues,
} from '@/utils/campaignValidation'
import { CampaignsService } from '@/services/campaigns'
import { FilesService } from '@/services/files'
import { ProductsService } from '@/services/products'
import { CategoriesService } from '@/services/categories'
import { useCampaignById } from '@/hooks/useCampaigns'
import type { CampaignItemInput } from '@/services/types/campaigns.types'
import type { ProductItem } from '@/services/types/products.types'
import type { Category } from '@/services/types/categories.types'
import { ShimmerBadge } from '@/components/UI/Badges'

export default function EditCampaignPage() {
  const router = useRouter()
  const toast = useToast()
  const { id } = router.query

  const {
    data: campaignData,
    loading: campaignLoading,
    error: campaignError,
    retry,
  } = useCampaignById(id ? Number(id) : undefined)

  const campaignsService = useMemo(() => new CampaignsService(), [])
  const filesService = useMemo(() => new FilesService(), [])
  const productsService = useMemo(() => new ProductsService(), [])
  const categoriesService = useMemo(() => new CategoriesService(), [])

  const {
    isOpen: isProductsModalOpen,
    onOpen: onProductsModalOpen,
    onClose: onProductsModalClose,
  } = useDisclosure()
  const {
    isOpen: isCategoriesModalOpen,
    onOpen: onCategoriesModalOpen,
    onClose: onCategoriesModalClose,
  } = useDisclosure()
  const {
    isOpen: isHighCommissionModalOpen,
    onOpen: onHighCommissionModalOpen,
    onClose: onHighCommissionModalClose,
  } = useDisclosure()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      description: '',
      banner: '',
      commission: '',
      start_date: '',
      end_date: '',
      items: [],
    },
  })

  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<CampaignItemInput[]>(
    []
  )
  const [selectedProductsData, setSelectedProductsData] = useState<
    ProductItem[]
  >([])
  const [selectedCategories, setSelectedCategories] = useState<
    CampaignItemInput[]
  >([])
  const [selectedCategoriesData, setSelectedCategoriesData] = useState<
    Category[]
  >([])

  const [productSearch, setProductSearch] = useState('')
  const [debouncedProductSearch, setDebouncedProductSearch] = useState('')
  const [categorySearch, setCategorySearch] = useState('')
  const [debouncedCategorySearch, setDebouncedCategorySearch] = useState('')

  const [products, setProducts] = useState<ProductItem[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [productsMeta, setProductsMeta] = useState<{
    current_page: number
    last_page: number
    total_items: number
  } | null>(null)
  const [currentProductsPage, setCurrentProductsPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)
  const itemsPerPage = 12

  const [tempSelectedProducts, setTempSelectedProducts] = useState<
    CampaignItemInput[]
  >([])
  const [tempSelectedProductsData, setTempSelectedProductsData] = useState<
    ProductItem[]
  >([])

  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  const [tempSelectedCategories, setTempSelectedCategories] = useState<
    CampaignItemInput[]
  >([])
  const [tempSelectedCategoriesData, setTempSelectedCategoriesData] = useState<
    Category[]
  >([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedProductSearch(productSearch)
      setCurrentProductsPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [productSearch])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCategorySearch(categorySearch)
    }, 500)

    return () => clearTimeout(timer)
  }, [categorySearch])

  useEffect(() => {
    if (campaignData && !campaignLoading) {
      setValue('name', campaignData.title || '')
      setValue('description', campaignData.description || '')
      setValue('commission', String(campaignData.commission || ''))
      setValue(
        'start_date',
        campaignData.periodStart?.split('/').reverse().join('-') || ''
      )
      setValue(
        'end_date',
        campaignData.periodEnd?.split('/').reverse().join('-') || ''
      )

      if (campaignData.imageUrl) {
        setImageUrl(campaignData.imageUrl)
        setValue('banner', campaignData.imageUrl)
      }

      if (campaignData.products && campaignData.products.length > 0) {
        const productItems: CampaignItemInput[] = campaignData.products.map(
          (p) => ({
            id: String(p.id),
            type: 'product' as const,
          })
        )
        setSelectedProducts(productItems)
        setSelectedProductsData(
          campaignData.products as unknown as ProductItem[]
        )
        setValue('items', productItems)
      }
    }
  }, [campaignData, campaignLoading, setValue])

  useEffect(() => {
    if (isProductsModalOpen) {
      loadProducts()
    }
  }, [
    isProductsModalOpen,
    currentProductsPage,
    debouncedProductSearch,
    sortOrder,
  ])

  useEffect(() => {
    if (isCategoriesModalOpen) {
      loadCategories()
    }
  }, [isCategoriesModalOpen, debouncedCategorySearch])

  const loadProducts = async () => {
    try {
      setProductsLoading(true)
      setProductsError(null)

      const result = await productsService.getProducts({
        page: currentProductsPage,
        perpage: itemsPerPage,
        product: debouncedProductSearch || undefined,
        orderBy: sortOrder ? `commission:${sortOrder}` : undefined,
      })

      if (result.response?.success && result.response.data) {
        setProducts(result.response.data.list)
        setProductsMeta(result.response.data.meta)
      } else {
        setProductsError('Não foi possível carregar os produtos')
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      setProductsError('Erro ao carregar produtos. Tente novamente.')
    } finally {
      setProductsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true)
      setCategoriesError(null)

      const result = await categoriesService.getCategories({
        name: debouncedCategorySearch || undefined,
      })

      if (result.response?.success && result.response.data) {
        setCategories(result.response.data)
      } else {
        setCategoriesError('Não foi possível carregar as categorias')
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      setCategoriesError('Erro ao carregar categorias. Tente novamente.')
    } finally {
      setCategoriesLoading(false)
    }
  }

  const watchedName = watch('name')
  const watchedCommission = watch('commission')
  const watchedStartDate = watch('start_date')
  const watchedEndDate = watch('end_date')

  useEffect(() => {
    const allItems = [...selectedProducts, ...selectedCategories]
    setValue('items', allItems)
  }, [selectedProducts, selectedCategories, setValue])

  const handleAddProductToModal = (product: ProductItem) => {
    const productItem: CampaignItemInput = {
      id: String(product.id),
      type: 'product',
    }

    const isAlreadySelected = tempSelectedProducts.some(
      (p) => p.id === productItem.id
    )

    if (isAlreadySelected) {
      return
    }

    setTempSelectedProducts((prev) => [...prev, productItem])
    setTempSelectedProductsData((prev) => [...prev, product])
  }

  const handleRemoveProductFromModal = (productId: string) => {
    setTempSelectedProducts((prev) => prev.filter((p) => p.id !== productId))
    setTempSelectedProductsData((prev) =>
      prev.filter((p) => String(p.id) !== productId)
    )
  }

  const handleConfirmProducts = () => {
    setSelectedProducts(tempSelectedProducts)
    setSelectedProductsData(tempSelectedProductsData)
    onProductsModalClose()
    if (tempSelectedProducts.length > 0) {
      toast({
        title: 'Produtos adicionados!',
        description: `${tempSelectedProducts.length} produto(s) adicionado(s) à campanha.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId))
    setSelectedProductsData((prev) =>
      prev.filter((p) => String(p.id) !== productId)
    )
  }

  const handleAddCategoryToModal = (category: Category) => {
    const categoryItem: CampaignItemInput = {
      id: String(category.id),
      type: 'category',
    }

    const isAlreadySelected = tempSelectedCategories.some(
      (c) => c.id === categoryItem.id
    )

    if (isAlreadySelected) {
      return
    }

    setTempSelectedCategories((prev) => [...prev, categoryItem])
    setTempSelectedCategoriesData((prev) => [...prev, category])
  }

  const handleRemoveCategoryFromModal = (categoryId: string) => {
    setTempSelectedCategories((prev) => prev.filter((c) => c.id !== categoryId))
    setTempSelectedCategoriesData((prev) =>
      prev.filter((c) => String(c.id) !== categoryId)
    )
  }

  const handleConfirmCategories = () => {
    setSelectedCategories(tempSelectedCategories)
    setSelectedCategoriesData(tempSelectedCategoriesData)
    onCategoriesModalClose()
    if (tempSelectedCategories.length > 0) {
      toast({
        title: 'Categorias adicionadas!',
        description: `${tempSelectedCategories.length} categoria(s) adicionada(s) à campanha.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategories((prev) => prev.filter((c) => c.id !== categoryId))
    setSelectedCategoriesData((prev) =>
      prev.filter((c) => String(c.id) !== categoryId)
    )
  }

  const handleSortChange = (order: 'asc' | 'desc' | null) => {
    setSortOrder(order)
  }

  const isProductSelectedInModal = (productId: number) => {
    return tempSelectedProducts.some((p) => p.id === String(productId))
  }

  const isCategorySelectedInModal = (categoryId: number) => {
    return tempSelectedCategories.some((c) => c.id === String(categoryId))
  }

  const handleOpenProductsModal = () => {
    setTempSelectedProducts(selectedProducts)
    setTempSelectedProductsData(selectedProductsData)
    onProductsModalOpen()
  }

  const handleOpenCategoriesModal = () => {
    setTempSelectedCategories(selectedCategories)
    setTempSelectedCategoriesData(selectedCategoriesData)
    onCategoriesModalOpen()
  }

  const formatCommissionPercentage = (commission: number) => {
    const numCommission = Number(commission)
    return numCommission % 1 === 0
      ? numCommission.toFixed(0)
      : numCommission.toString()
  }

  const formatCommissionInput = (value: string) => {
    if (!value) return ''
    const num = parseFloat(value)
    if (isNaN(num)) return value

    if (num % 1 === 0) {
      return num.toString()
    }

    const formatted = num.toString()
    const parts = formatted.split('.')
    if (parts.length === 2) {
      const decimals = parts[1].replace(/0+$/, '')
      return decimals ? `${parts[0]}.${decimals}` : parts[0]
    }

    return formatted
  }

  const getCommissionInputWidth = (value: string) => {
    if (!value) return '32px'
    const formatted = formatCommissionInput(value)

    const width = Math.max(32, formatted.length * 11 + 10)
    return `${width}px`
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'A imagem deve ter no máximo 5MB',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImageUrl('')
    setValue('banner', '')
  }

  const handleCloseProductsModal = () => {
    setProductSearch('')
    onProductsModalClose()
  }

  const handleCloseCategoriesModal = () => {
    setCategorySearch('')
    onCategoriesModalClose()
  }

  const uploadBanner = async (): Promise<string | undefined> => {
    if (!imageFile) return undefined

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', imageFile)
      formData.append('type', 'banner')

      const result = await filesService.upload(formData)

      if (result.response?.success && result.response.data?.url) {
        return result.response.data.url
      } else {
        throw new Error('Erro ao fazer upload do banner')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast({
        title: 'Erro no upload',
        description:
          'Não foi possível fazer upload da imagem. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: CampaignFormValues) => {
    try {
      console.log('📝 onSubmit chamado!')
      console.log('📝 Dados do formulário:', data)
      console.log('📝 Erros do formulário:', errors)

      if (isHighCommission(data.commission)) {
        console.log('⚠️ Comissão alta detectada, abrindo modal de confirmação')
        onHighCommissionModalOpen()
        return
      }

      console.log('✅ Chamando submitCampaign...')
      await submitCampaign(data)
    } catch (error) {
      console.error('❌ Erro no onSubmit:', error)
    }
  }

  const submitCampaign = async (data: CampaignFormValues) => {
    if (!id) {
      toast({
        title: 'Erro',
        description: 'ID da campanha não encontrado.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    try {
      let bannerUrl = data.banner
      if (imageFile) {
        bannerUrl = await uploadBanner()
      }

      const updatedCampaignData = {
        id: Number(id),
        name: data.name,
        description: data.description || '',
        banner: bannerUrl || '',
        commission: data.commission,
        start_date: data.start_date,
        end_date: data.end_date,
        items: data.items,
      }

      console.log('🚀 Atualizando campanha:', updatedCampaignData)

      const result = await campaignsService.updateCampaign(updatedCampaignData)

      if (result.response?.success) {
        toast({
          title: 'Campanha atualizada!',
          description: 'A campanha foi atualizada com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

        router.push(`/brand/campaigns/${id}`)
      } else {
        throw new Error(
          result.response?.message || 'Erro ao atualizar campanha'
        )
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar campanha:', error)
      toast({
        title: 'Erro ao atualizar campanha',
        description:
          error.message ||
          'Ocorreu um erro ao atualizar a campanha. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleConfirmHighCommission = () => {
    onHighCommissionModalClose()
    const data = watch()
    submitCampaign(data as CampaignFormValues)
  }

  if (!router.isReady || campaignLoading) {
    return (
      <>
        <Head>
          <title>Carregando... | Affiliates</title>
        </Head>
        <AppLayout>
          <PageHeader>
            <Box display="flex" flexDirection="column" gap={2} w="full">
              <HStack justify="space-between" mb={1} flex={1}>
                <Flex gap={3} align="center" color="#131d53" flex={1}>
                  <Skeleton height="24px" width="24px" borderRadius="4px" />
                  <Skeleton height="32px" width="200px" borderRadius="md" />
                  <Skeleton height="28px" width="150px" borderRadius="4px" />
                </Flex>
                <HStack spacing={2}>
                  <Skeleton height="32px" width="120px" borderRadius="4px" />
                  <Skeleton height="32px" width="150px" borderRadius="4px" />
                </HStack>
              </HStack>
              <Skeleton height="100px" width="100%" borderRadius="md" />
            </Box>
          </PageHeader>
          <PageContent>
            <VStack spacing={4} align="stretch">
              <HStack spacing={3}>
                <Skeleton height="36px" width="180px" borderRadius="6px" />
                <Skeleton height="36px" width="180px" borderRadius="6px" />
              </HStack>

              <Box>
                <Skeleton height="16px" width="200px" mb={3} />
                <Grid
                  templateColumns={{
                    base: '1fr',
                    md: 'repeat(auto-fill, minmax(270px, 1fr))',
                  }}
                  gap={3}
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Box
                      key={i}
                      bg="white"
                      borderWidth={1}
                      borderColor="#E6EEFA"
                      borderRadius="md"
                      overflow="hidden"
                    >
                      <Flex justify="center" align="center" h="120px" py={3}>
                        <Skeleton height="100px" width="80%" />
                      </Flex>

                      <Box
                        h="200px"
                        p={3}
                        shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between"
                        borderTopWidth={1}
                        borderTopColor="#E6EEFA"
                      >
                        <Skeleton
                          height="24px"
                          width="100px"
                          borderRadius="4px"
                          mb={3}
                        />
                        <Box flex="1" mb={2}>
                          <Skeleton height="14px" width="100%" mb={1} />
                          <Skeleton height="14px" width="80%" />
                        </Box>
                        <Skeleton height="16px" width="80px" mb={2} />
                        <Skeleton
                          height="32px"
                          width="100%"
                          borderRadius="6px"
                        />
                      </Box>
                    </Box>
                  ))}
                </Grid>
              </Box>
            </VStack>
          </PageContent>
        </AppLayout>
      </>
    )
  }

  if (campaignError || !campaignData) {
    return (
      <>
        <Head>
          <title>Erro | Affiliates</title>
        </Head>
        <AppLayout>
          <PageHeader>
            <Flex gap={2} align="center">
              <Megaphone size={24} color="#131D53" />
              <Text fontSize="sm" color="#131D53">
                Editar Campanha
              </Text>
            </Flex>
          </PageHeader>
          <PageContent>
            <Box p={8} textAlign="center">
              <Text fontSize="lg" color="#131D53" fontWeight={600} mb={2}>
                Erro ao carregar campanha
              </Text>
              <Text fontSize="sm" color="#131D5399" mb={4}>
                Não foi possível carregar os dados da campanha. Verifique sua
                conexão e tente novamente.
              </Text>
              <Button
                onClick={retry}
                size="md"
                px={3}
                py={1.5}
                rounded={4}
                fontSize="sm"
                fontWeight={400}
                color="#131D53"
                bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                _hover={{
                  bgGradient:
                    'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                }}
              >
                Tentar Novamente
              </Button>
            </Box>
          </PageContent>
        </AppLayout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Editar Campanha | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Box display="flex" flexDirection="column" gap={2} w="full">
            <HStack justify="space-between" mb={1} flex={1}>
              <Flex gap={3} align="center" color="#131d53">
                <Megaphone size={24} color="#131D53" />

                <FormControl isInvalid={!!errors.name} w={'max-content'}>
                  <Input
                    {...register('name')}
                    placeholder="Título da campanha"
                    fontSize="sm"
                    size="sm"
                    w="200px"
                    variant="unstyled"
                    px={2}
                    py={1}
                    borderRadius="md"
                    bg="#F7FAFC"
                    border="1px solid"
                    borderColor={errors.name ? 'red.300' : '#E6EEFA'}
                    color="#131D53"
                    _placeholder={{ color: '#131D5399' }}
                    _hover={{ borderColor: '#C5CDDC' }}
                    _focus={{
                      bg: 'white',
                      borderColor: '#1F70F1',
                      boxShadow: '0 0 0 1px #1F70F1',
                    }}
                  />
                </FormControl>

                <HStack spacing={1}>
                  <HStack
                    w="max-content"
                    py={0.5}
                    px={1}
                    gap={1}
                    rounded={4}
                    bg="#C085FF4D"
                    color="#2F0062"
                    fontSize="xs"
                    fontWeight="semibold"
                    position="relative"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="rgba(192, 133, 255, 0.3)"
                    transition="all 0.2s"
                    _hover={{ borderColor: 'rgba(192, 133, 255, 0.5)' }}
                    _focusWithin={{
                      borderColor: '#8B5CF6',
                      boxShadow: '0 0 0 1px #8B5CF6',
                    }}
                  >
                    <Box>
                      <img
                        src="/assets/icons/extra-commission.svg"
                        alt="Comissão"
                        style={{ width: '20px', height: '20px' }}
                      />
                    </Box>
                    <Text
                      fontWeight={300}
                      textTransform="uppercase"
                      fontSize="xs"
                    >
                      Comissões de
                    </Text>
                    <Input
                      type="text"
                      placeholder="0"
                      fontSize="xs"
                      fontWeight={600}
                      w={getCommissionInputWidth(watchedCommission)}
                      minW="32px"
                      maxW="70px"
                      h="auto"
                      p={0}
                      px={1}
                      textAlign="center"
                      variant="unstyled"
                      color="#2F0062"
                      value={
                        watchedCommission
                          ? formatCommissionInput(watchedCommission)
                          : ''
                      }
                      onChange={(e) => {
                        const value = e.target.value

                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          setValue('commission', value, {
                            shouldValidate: true,
                          })
                        }
                      }}
                      onBlur={() => {
                        const currentValue = watchedCommission
                        if (currentValue) {
                          setValue('commission', String(currentValue), {
                            shouldValidate: true,
                          })
                        }
                      }}
                      _hover={{
                        borderWidth: 1,
                        borderColor: '#8b5cf67f',
                      }}
                      _focusWithin={{
                        borderColor: '#8B5CF6',
                        bg: '#C085FF70',
                      }}
                      _placeholder={{ color: '#2F006299' }}
                    />
                    <Text fontWeight={600} fontSize="xs">
                      %
                    </Text>
                  </HStack>
                </HStack>
              </Flex>

              <HStack spacing={2}>
                <Button
                  size="sm"
                  px={3}
                  py={1.5}
                  gap={0}
                  rounded={4}
                  fontSize="sm"
                  fontWeight={400}
                  color="#131D53"
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  onClick={() => router.push(`/brand/campaigns/${id}`)}
                  leftIcon={<X size={16} />}
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit(onSubmit)}
                  size="sm"
                  px={3}
                  py={1.5}
                  gap={0}
                  rounded={4}
                  fontSize="sm"
                  fontWeight={600}
                  color="#fff"
                  bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
                  shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                  }}
                  isLoading={isSubmitting || isUploading}
                  loadingText={
                    isUploading ? 'Fazendo upload...' : 'Atualizando...'
                  }
                  isDisabled={
                    !watchedName ||
                    !watchedCommission ||
                    !watchedStartDate ||
                    !watchedEndDate
                  }
                >
                  Atualizar Campanha
                </Button>
              </HStack>
            </HStack>

            <Flex
              gap={2}
              align="center"
              justify="space-between"
              color="#131d53"
              mb={3}
            >
              <HStack gap={2.5}>
                <Box>
                  <div className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm p-0.5">
                    <img
                      src="/assets/icons/calendar-in-progress.svg"
                      alt="Calendário"
                    />
                  </div>
                </Box>
                <HStack spacing={2}>
                  <HStack spacing={1}>
                    <Text fontSize="xs" color="#131D53">
                      De:
                    </Text>
                    <Input
                      {...register('start_date')}
                      type="date"
                      fontSize="xs"
                      size="xs"
                      w="auto"
                      h="auto"
                      px={2}
                      py={0.5}
                      borderRadius="md"
                      bg="#F7FAFC"
                      border="1px solid"
                      borderColor={errors.start_date ? 'red.300' : '#E6EEFA'}
                      color="#131D53"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        bg: 'white',
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                    />
                  </HStack>
                  <Divider
                    orientation="vertical"
                    w={0.5}
                    h={5}
                    color="#131D5380"
                    bg="#131D5380"
                  />
                  <HStack spacing={1}>
                    <Text fontSize="xs" color="#131D53">
                      Até:
                    </Text>
                    <Input
                      {...register('end_date')}
                      type="date"
                      fontSize="xs"
                      size="xs"
                      w="auto"
                      h="auto"
                      px={2}
                      py={0.5}
                      borderRadius="md"
                      bg="#F7FAFC"
                      border="1px solid"
                      borderColor={errors.end_date ? 'red.300' : '#E6EEFA'}
                      color="#131D53"
                      _hover={{ borderColor: '#C5CDDC' }}
                      _focus={{
                        bg: 'white',
                        borderColor: '#1F70F1',
                        boxShadow: '0 0 0 1px #1F70F1',
                      }}
                    />
                  </HStack>
                </HStack>
              </HStack>
            </Flex>

            <HStack spacing={4} align="start">
              <Box flex={1}>
                <Textarea
                  {...register('description')}
                  placeholder="Adicione uma descrição para a campanha..."
                  fontSize="13px"
                  minH="100px"
                  borderRadius="md"
                  bg="#F7FAFC"
                  border="1px solid"
                  borderColor="#E6EEFA"
                  color="#131D5399"
                  _placeholder={{ color: '#131D5380' }}
                  _hover={{ borderColor: '#C5CDDC' }}
                  _focus={{
                    bg: 'white',
                    borderColor: '#1F70F1',
                    boxShadow: '0 0 0 1px #1F70F1',
                  }}
                />
              </Box>

              <HStack spacing={2.5}>
                <Box
                  as="label"
                  htmlFor="image-upload"
                  w="100px"
                  h="100px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="md"
                  cursor="pointer"
                  overflow="hidden"
                  bg={imageUrl ? 'transparent' : '#F7FAFC'}
                  border="2px dashed"
                  borderColor={imageUrl ? '#1F70F1' : '#E6EEFA'}
                  flexShrink={0}
                  _hover={{
                    borderColor: imageUrl ? '#1854DD' : '#C5CDDC',
                    bg: imageUrl ? 'transparent' : '#FAFBFC',
                  }}
                  transition="all 0.2s"
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Preview"
                      w="full"
                      h="full"
                      objectFit="cover"
                    />
                  ) : (
                    <Text
                      fontSize="40px"
                      color="#C5CDDC"
                      fontWeight={300}
                      lineHeight={1}
                    >
                      +
                    </Text>
                  )}
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    display="none"
                  />
                </Box>

                <VStack align="start" spacing={0.5}>
                  <HStack spacing={1.5}>
                    <Box className="bg-[#dfefff] w-5 h-5 flex items-center justify-center rounded-sm">
                      <ImageIcon size={14} color="#1F70F1" strokeWidth={1.5} />
                    </Box>
                    <Text fontSize="sm" color="#131D5399">
                      Imagem da campanha
                    </Text>
                  </HStack>
                  {imageUrl ? (
                    <Button
                      size="xs"
                      variant="link"
                      color="#131D5399"
                      fontSize="xs"
                      onClick={handleRemoveImage}
                      textDecoration="underline"
                      p={0}
                      h="auto"
                      minW="auto"
                      ml="26px"
                      _hover={{ color: 'red.500' }}
                    >
                      Remover imagem
                    </Button>
                  ) : (
                    <Text fontSize="xs" color="#131D5399" ml="26px">
                      PNG, JPG até 5MB
                    </Text>
                  )}
                </VStack>
              </HStack>
            </HStack>

            <VStack spacing={3} align="start" mt={2}>
              <HStack spacing={2.5} justify="space-between" w="full">
                <HStack spacing={2.5}>
                  <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm">
                    <Tags size={20} color="#1F70F1" strokeWidth={1.5} />
                  </Box>
                  <Text fontSize="sm" color="#131D5399">
                    Produtos em foco{' '}
                    <Text as="span" color="#131D53">
                      {selectedCategories.length}
                    </Text>
                  </Text>
                </HStack>
                <Button
                  size="sm"
                  px={3}
                  py={1.5}
                  gap={0}
                  rounded={4}
                  fontSize="sm"
                  fontWeight={400}
                  color="#131D53"
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  onClick={handleOpenCategoriesModal}
                  leftIcon={<Tags size={16} />}
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                  }}
                >
                  Adicionar Categorias
                </Button>
              </HStack>

              <HStack spacing={2.5} justify="space-between" w="full">
                <HStack spacing={2.5}>
                  <Box className="bg-[#dfefff] w-6 h-6 flex items-center justify-center rounded-sm">
                    <ShoppingBasket
                      size={20}
                      color="#1F70F1"
                      strokeWidth={1.5}
                    />
                  </Box>
                  <Text fontSize="sm" color="#131D5399">
                    Produtos{' '}
                    <Text as="span" color="#131D53">
                      {selectedProducts.length}
                    </Text>
                  </Text>
                </HStack>
                <Button
                  size="sm"
                  px={3}
                  py={1.5}
                  gap={0}
                  rounded={4}
                  fontSize="sm"
                  fontWeight={400}
                  color="#131D53"
                  bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                  shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                  onClick={handleOpenProductsModal}
                  leftIcon={<ShoppingBasket size={16} />}
                  _hover={{
                    bgGradient:
                      'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                    shadow:
                      '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                  }}
                >
                  Adicionar Produtos
                </Button>
              </HStack>
            </VStack>
          </Box>
        </PageHeader>

        <PageContent>
          <VStack spacing={4} align="stretch">
            {selectedProductsData.length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight={600} color="#131D53" mb={3}>
                  Produtos Selecionados ({selectedProductsData.length})
                </Text>
                <Box
                  display="grid"
                  gridTemplateColumns={{
                    base: '1fr',
                    md: 'repeat(auto-fill, minmax(270px, 1fr))',
                  }}
                  gap={3}
                >
                  {selectedProductsData.map((product) => (
                    <Box
                      key={product.id}
                      bg="white"
                      borderWidth={1}
                      borderColor="#E6EEFA"
                      borderRadius="md"
                      overflow="hidden"
                    >
                      <Flex justify="center" align="center" h="120px" py={3}>
                        <ProductImage
                          src={product.image}
                          alt={product.name}
                          maxHeight="100%"
                          width="auto"
                          objectFit="contain"
                        />
                      </Flex>

                      <Box
                        h="200px"
                        p={3}
                        shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between"
                        borderTopWidth={1}
                        borderTopColor="#E6EEFA"
                      >
                        <ShimmerBadge
                          icon="/assets/icons/extra-commission.svg"
                          percentage={`${formatCommissionPercentage(
                            product.commission || Number(watchedCommission) || 0
                          )}%`}
                          className="mb-3"
                        />

                        <Box flex="1" mb={2} overflow="hidden">
                          <Text
                            fontSize="xs"
                            color="#131D5399"
                            noOfLines={2}
                            lineHeight="1.3"
                            display="-webkit-box"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            sx={{
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {product.name}
                          </Text>
                        </Box>

                        <Text
                          fontSize="sm"
                          color="#131D53"
                          mb={3}
                          fontWeight={500}
                        >
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(product.price)}
                        </Text>

                        <Button
                          w="full"
                          maxH={8}
                          px={3}
                          py={1.5}
                          size="sm"
                          fontSize="xs"
                          borderRadius="md"
                          color="#E53E3E"
                          bgGradient="linear-gradient(180deg, #fef5f5 47.86%, #fed7d7 123.81%)"
                          shadow="0px 0px 0px 1px #f56565 inset, 0px 0px 0px 2px #fff inset"
                          _hover={{
                            bgGradient:
                              'linear-gradient(180deg, #fed7d7 47.86%, #feb2b2 123.81%)',
                            shadow:
                              '0px 0px 0px 1px #e53e3e inset, 0px 0px 0px 2px #fff inset',
                          }}
                          _active={{
                            bgGradient:
                              'linear-gradient(180deg, #feb2b2 47.86%, #fc8181 123.81%)',
                          }}
                          transition="all 0.2s ease"
                          onClick={() =>
                            handleRemoveProduct(String(product.id))
                          }
                          leftIcon={<X size={16} />}
                        >
                          Remover
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {selectedCategoriesData.length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight={600} color="#131D53" mb={3}>
                  Categorias Selecionadas ({selectedCategoriesData.length})
                </Text>
                <Box
                  display="grid"
                  gridTemplateColumns={{
                    base: '1fr',
                    md: 'repeat(auto-fill, minmax(270px, 1fr))',
                  }}
                  gap={3}
                >
                  {selectedCategoriesData.map((category) => (
                    <Box
                      key={category.id}
                      bg="white"
                      borderWidth={1}
                      borderColor="#E6EEFA"
                      borderRadius="md"
                      overflow="hidden"
                      p={4}
                      shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
                      display="flex"
                      flexDirection="column"
                      justifyContent="space-between"
                      minH="140px"
                    >
                      {category.percentage && (
                        <ShimmerBadge
                          icon="/assets/icons/extra-commission.svg"
                          percentage={`${formatCommissionPercentage(
                            Number(category.percentage)
                          )}%`}
                          className="mb-3"
                        />
                      )}

                      <Box flex="1" mb={3}>
                        <Text
                          fontSize="sm"
                          color="#131D53"
                          fontWeight={600}
                          noOfLines={2}
                          lineHeight="1.4"
                        >
                          {category.name}
                        </Text>
                      </Box>

                      <Button
                        w="full"
                        maxH={8}
                        px={3}
                        py={1.5}
                        size="sm"
                        fontSize="xs"
                        borderRadius="md"
                        color="#E53E3E"
                        bgGradient="linear-gradient(180deg, #fef5f5 47.86%, #fed7d7 123.81%)"
                        shadow="0px 0px 0px 1px #f56565 inset, 0px 0px 0px 2px #fff inset"
                        _hover={{
                          bgGradient:
                            'linear-gradient(180deg, #fed7d7 47.86%, #feb2b2 123.81%)',
                          shadow:
                            '0px 0px 0px 1px #e53e3e inset, 0px 0px 0px 2px #fff inset',
                        }}
                        _active={{
                          bgGradient:
                            'linear-gradient(180deg, #feb2b2 47.86%, #fc8181 123.81%)',
                        }}
                        transition="all 0.2s ease"
                        onClick={() =>
                          handleRemoveCategory(String(category.id))
                        }
                        leftIcon={<X size={16} />}
                      >
                        Remover
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {selectedProducts.length === 0 &&
              selectedCategories.length === 0 && (
                <Box
                  p={8}
                  borderWidth={1}
                  borderColor="#E6EEFA"
                  borderRadius="md"
                  bg="white"
                  textAlign="center"
                >
                  <VStack spacing={3}>
                    <Text fontSize="sm" color="#131D5399">
                      Nenhum produto ou categoria adicionado.
                    </Text>
                    <Text fontSize="xs" color="#131D5399">
                      Use os botões acima para adicionar produtos ou categorias
                      à campanha.
                    </Text>
                  </VStack>
                </Box>
              )}
          </VStack>
        </PageContent>

        <Modal
          isOpen={isProductsModalOpen}
          onClose={handleCloseProductsModal}
          size="6xl"
        >
          <ModalOverlay />
          <ModalContent maxW="1280px">
            <ModalHeader
              fontSize="md"
              fontWeight="600"
              color="#131D53"
              borderBottom="1px solid #DEE6F2"
              pb={3}
            >
              <HStack spacing={2}>
                <Text>Adicionar Produtos</Text>
                {productsMeta && (
                  <Box
                    alignContent="center"
                    justifyContent="center"
                    bgColor="#DFEFFF"
                    px={2}
                    py={0.5}
                    rounded={4}
                    lineHeight="120%"
                  >
                    <Text fontSize="sm" fontWeight="400" color="#131D53">
                      {productsMeta.total_items}
                    </Text>
                  </Box>
                )}
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={4}>
              <VStack spacing={4} align="stretch">
                <HStack spacing={3}>
                  <HStack
                    h="32px"
                    position="relative"
                    rounded={4}
                    borderWidth={1}
                    borderColor="#DEE6F2"
                    gap={0}
                    flex={1}
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
                      w="32px"
                      h="32px"
                      borderRightWidth={1}
                      borderRightColor="#dee6f2"
                    >
                      <Search color="#C5CDDC" size={20} />
                    </HStack>
                    <Input
                      p={2}
                      variant="unstyled"
                      placeholder="Buscar por nome ou SKU"
                      border="none"
                      flex="1"
                      h="full"
                      fontSize="sm"
                      _placeholder={{ color: '#C5CDDC' }}
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </HStack>

                  <Menu>
                    <MenuButton
                      as={Button}
                      size="sm"
                      px={3}
                      gap={2}
                      rounded={4}
                      fontSize="sm"
                      fontWeight={400}
                      color="#131D53"
                      bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                      shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                      _hover={{
                        bgGradient:
                          'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                      }}
                      _active={{
                        bgGradient:
                          'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                      }}
                    >
                      <HStack spacing={2}>
                        <ArrowUpDown size={16} />
                        <Text>
                          {sortOrder === null
                            ? 'Ordenar por'
                            : sortOrder === 'desc'
                            ? 'Maior Comissão'
                            : 'Menor Comissão'}
                        </Text>
                      </HStack>
                    </MenuButton>
                    <MenuList
                      borderRadius="md"
                      borderColor="#DEE6F2"
                      boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
                    >
                      <MenuItem
                        fontSize="sm"
                        color="#131D53"
                        bg={sortOrder === 'desc' ? '#F7FAFC' : 'white'}
                        fontWeight={sortOrder === 'desc' ? 600 : 400}
                        _hover={{ bg: '#F7FAFC' }}
                        onClick={() => handleSortChange('desc')}
                      >
                        Maior Comissão
                      </MenuItem>
                      <MenuItem
                        fontSize="sm"
                        color="#131D53"
                        bg={sortOrder === 'asc' ? '#F7FAFC' : 'white'}
                        fontWeight={sortOrder === 'asc' ? 600 : 400}
                        _hover={{ bg: '#F7FAFC' }}
                        onClick={() => handleSortChange('asc')}
                      >
                        Menor Comissão
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>

                {productsLoading ? (
                  <Grid
                    templateColumns="repeat(4, 1fr)"
                    gap="12px"
                    minH="400px"
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <Box
                        key={i}
                        borderRadius="md"
                        borderWidth={1}
                        borderColor="#E6EEFA"
                        overflow="hidden"
                        bg="white"
                        minW="270px"
                        maxW="300px"
                      >
                        <Flex justify="center" align="center" h="120px" py={3}>
                          <Skeleton height="100px" width="80%" />
                        </Flex>

                        <Box
                          h="200px"
                          p={3}
                          borderTopWidth={1}
                          borderTopColor="#E6EEFA"
                          display="flex"
                          flexDirection="column"
                          justifyContent="space-between"
                          shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
                        >
                          <Flex align="center" gap={3} mb={3}>
                            <Skeleton
                              height="18px"
                              width="70px"
                              borderRadius="4px"
                            />
                            <Skeleton
                              height="24px"
                              width="60px"
                              borderRadius="4px"
                            />
                          </Flex>

                          <Box flex="1" mb={2} overflow="hidden">
                            <Skeleton height="14px" width="100%" mb={1} />
                            <Skeleton height="14px" width="80%" />
                          </Box>

                          <Box mb={2}>
                            <Skeleton height="12px" width="50%" mb={1} />
                            <Skeleton height="12px" width="60%" />
                          </Box>

                          <Skeleton height="12px" width="70%" mb={3} />

                          <Skeleton
                            height="32px"
                            width="100%"
                            borderRadius="6px"
                          />
                        </Box>
                      </Box>
                    ))}
                  </Grid>
                ) : productsError ? (
                  <Box textAlign="center" py={12}>
                    <VStack spacing={4}>
                      <Text fontSize="lg" color="#131D53" fontWeight={600}>
                        Erro ao carregar produtos
                      </Text>
                      <Text fontSize="sm" color="#131D5399">
                        {productsError}
                      </Text>
                      <Button
                        size="sm"
                        onClick={loadProducts}
                        colorScheme="blue"
                      >
                        Tentar Novamente
                      </Button>
                    </VStack>
                  </Box>
                ) : products.length === 0 ? (
                  <Box textAlign="center" py={12}>
                    <VStack spacing={2}>
                      <ShoppingBasket size={48} color="#C5CDDC" />
                      <Text fontSize="lg" color="#131D53" fontWeight={600}>
                        Nenhum produto encontrado
                      </Text>
                      <Text fontSize="sm" color="#131D5399">
                        {debouncedProductSearch
                          ? `Não encontramos produtos com "${debouncedProductSearch}"`
                          : 'Nenhum produto disponível no momento'}
                      </Text>
                    </VStack>
                  </Box>
                ) : (
                  <>
                    <Grid templateColumns="repeat(4, 1fr)" gap="12px">
                      {products.map((product) => (
                        <Box
                          key={product.id}
                          bg="white"
                          borderWidth={1}
                          borderColor={
                            isProductSelectedInModal(product.id)
                              ? '#1F70F1'
                              : '#E6EEFA'
                          }
                          borderRadius="md"
                          overflow="hidden"
                          minW="270px"
                          maxW="300px"
                          transition="all 0.2s"
                          _hover={{
                            borderColor: '#1F70F1',
                            boxShadow: '0 2px 8px rgba(31, 112, 241, 0.1)',
                          }}
                          position="relative"
                        >
                          {isProductSelectedInModal(product.id) && (
                            <Badge
                              position="absolute"
                              top={2}
                              right={2}
                              bg="#1F70F1"
                              color="white"
                              fontSize="xs"
                              px={2}
                              py={1}
                              borderRadius="md"
                              zIndex={1}
                            >
                              Selecionado
                            </Badge>
                          )}

                          <Flex
                            justify="center"
                            align="center"
                            h="120px"
                            py={3}
                          >
                            <ProductImage
                              src={product.image}
                              alt={product.name}
                              maxHeight="100%"
                              width="auto"
                              objectFit="contain"
                            />
                          </Flex>

                          <Box
                            h="200px"
                            p={3}
                            shadow="0px 1px 1px 0px rgba(0, 13, 53, 0.15)"
                            display="flex"
                            flexDirection="column"
                            justifyContent="space-between"
                            borderTopWidth={1}
                            borderTopColor="#E6EEFA"
                          >
                            <Flex align="center" gap={3} mb={3}>
                              <Text
                                fontSize="sm"
                                color="#131D53"
                                fontWeight={500}
                              >
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(product.price)}
                              </Text>

                              <ShimmerBadge
                                icon="/assets/icons/extra-commission.svg"
                                percentage={`${formatCommissionPercentage(
                                  product.commission
                                )}%`}
                              />
                            </Flex>

                            <Box flex="1" mb={2} overflow="hidden">
                              <Text
                                fontSize="xs"
                                color="#131D53"
                                noOfLines={2}
                                lineHeight="1.3"
                                display="-webkit-box"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                sx={{
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                                mb={1}
                              >
                                {product.name}
                              </Text>
                              <Text
                                fontSize="xs"
                                color="#131D5399"
                                noOfLines={1}
                                overflow="hidden"
                                textOverflow="ellipsis"
                                whiteSpace="nowrap"
                                mb={1}
                              >
                                SKU: {product.sku}
                              </Text>
                              <Text
                                fontSize="xs"
                                color="#131D5399"
                                noOfLines={1}
                                overflow="hidden"
                                textOverflow="ellipsis"
                                whiteSpace="nowrap"
                              >
                                {product.category}
                              </Text>
                            </Box>

                            <Button
                              w="full"
                              h="full"
                              maxH={8}
                              px={3}
                              py={1.5}
                              size="sm"
                              fontSize="xs"
                              borderRadius="md"
                              color={
                                isProductSelectedInModal(product.id)
                                  ? '#E53E3E'
                                  : '#fff'
                              }
                              bgGradient={
                                isProductSelectedInModal(product.id)
                                  ? 'linear-gradient(180deg, #fef5f5 47.86%, #fed7d7 123.81%)'
                                  : 'linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)'
                              }
                              shadow={
                                isProductSelectedInModal(product.id)
                                  ? '0px 0px 0px 1px #f56565 inset, 0px 0px 0px 2px #fff inset'
                                  : '0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset'
                              }
                              _hover={{
                                bgGradient: isProductSelectedInModal(product.id)
                                  ? 'linear-gradient(180deg, #fed7d7 47.86%, #feb2b2 123.81%)'
                                  : 'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                                shadow: isProductSelectedInModal(product.id)
                                  ? '0px 0px 0px 1px #e53e3e inset, 0px 0px 0px 2px #fff inset'
                                  : '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                              }}
                              _active={{
                                bgGradient: isProductSelectedInModal(product.id)
                                  ? 'linear-gradient(180deg, #feb2b2 47.86%, #fc8181 123.81%)'
                                  : undefined,
                              }}
                              transition="all 0.2s ease"
                              onClick={() => {
                                if (isProductSelectedInModal(product.id)) {
                                  handleRemoveProductFromModal(
                                    String(product.id)
                                  )
                                } else {
                                  handleAddProductToModal(product)
                                }
                              }}
                              leftIcon={
                                isProductSelectedInModal(product.id) ? (
                                  <X size={16} />
                                ) : (
                                  <Plus size={16} />
                                )
                              }
                            >
                              {isProductSelectedInModal(product.id)
                                ? 'Remover'
                                : 'Adicionar'}
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Grid>

                    {productsMeta && productsMeta.last_page > 1 && (
                      <Flex
                        pt={3}
                        borderTop="1px solid #E6EEFA"
                        justify="space-between"
                        align="center"
                      >
                        <Text fontSize="sm" color="#131D5399">
                          {selectedProducts.length + selectedCategories.length}
                          /10 itens selecionados
                        </Text>

                        <Pagination
                          currentPage={currentProductsPage}
                          totalPages={productsMeta.last_page}
                          onPageChange={setCurrentProductsPage}
                          isLoading={productsLoading}
                          align="flex-end"
                        />
                      </Flex>
                    )}
                  </>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter borderTop="1px solid #DEE6F2">
              <HStack spacing={3} w="full" justify="flex-end">
                <Button
                  onClick={handleCloseProductsModal}
                  variant="ghost"
                  size="md"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmProducts}
                  colorScheme="blue"
                  size="md"
                >
                  Adicionar Produtos Selecionados ({tempSelectedProducts.length}
                  )
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={isCategoriesModalOpen}
          onClose={handleCloseCategoriesModal}
          size="xl"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              fontSize="md"
              fontWeight="600"
              color="#131D53"
              borderBottom="1px solid #DEE6F2"
            >
              Adicionar Categorias
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={6}>
              <VStack spacing={4} align="stretch">
                <HStack
                  h="32px"
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
                    w="32px"
                    h="32px"
                    borderRightWidth={1}
                    borderRightColor="#dee6f2"
                  >
                    <Search color="#C5CDDC" size={20} />
                  </HStack>
                  <Input
                    p={2}
                    variant="unstyled"
                    placeholder="Buscar por nome da categoria"
                    border="none"
                    flex="1"
                    h="full"
                    fontSize="sm"
                    _placeholder={{ color: '#C5CDDC' }}
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                  />
                </HStack>

                {categoriesLoading ? (
                  <VStack spacing={3} minH="300px" justify="center">
                    <Spinner size="lg" color="#1F70F1" />
                    <Text fontSize="sm" color="#131D5399">
                      Carregando categorias...
                    </Text>
                  </VStack>
                ) : categoriesError ? (
                  <Box
                    minH="300px"
                    borderWidth={1}
                    borderColor="#E6EEFA"
                    borderRadius="md"
                    p={8}
                    bg="white"
                    textAlign="center"
                  >
                    <VStack spacing={3}>
                      <Text fontSize="sm" color="#E53E3E">
                        {categoriesError}
                      </Text>
                      <Button
                        size="sm"
                        onClick={loadCategories}
                        color="#131D53"
                        bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                        shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                      >
                        Tentar novamente
                      </Button>
                    </VStack>
                  </Box>
                ) : categories.length === 0 ? (
                  <Box
                    minH="300px"
                    borderWidth={1}
                    borderColor="#E6EEFA"
                    borderRadius="md"
                    p={8}
                    bg="white"
                    textAlign="center"
                  >
                    <Text fontSize="sm" color="#131D5399">
                      Nenhuma categoria encontrada.
                    </Text>
                  </Box>
                ) : (
                  <VStack
                    spacing={2}
                    align="stretch"
                    maxH="400px"
                    overflowY="auto"
                  >
                    {categories.map((category) => (
                      <Box
                        key={category.id}
                        p={4}
                        borderWidth={1}
                        borderColor={
                          isCategorySelectedInModal(category.id)
                            ? '#1F70F1'
                            : '#E6EEFA'
                        }
                        borderRadius="md"
                        bg="white"
                        transition="all 0.2s"
                        _hover={{
                          borderColor: '#1F70F1',
                          boxShadow: '0 2px 8px rgba(31, 112, 241, 0.1)',
                        }}
                      >
                        <Flex justify="space-between" align="center" gap={3}>
                          <Box flex="1">
                            <Text
                              fontSize="sm"
                              fontWeight={600}
                              color="#131D53"
                              mb={1}
                            >
                              {category.name}
                            </Text>
                            {category.percentage && (
                              <Badge
                                bg="#C085FF4D"
                                color="#2F0062"
                                fontSize="xs"
                                px={2}
                                py={1}
                                borderRadius="md"
                              >
                                Comissão: {category.percentage}%
                              </Badge>
                            )}
                          </Box>
                          <Button
                            size="sm"
                            px={3}
                            py={1.5}
                            fontSize="xs"
                            borderRadius="md"
                            color={
                              isCategorySelectedInModal(category.id)
                                ? '#E53E3E'
                                : '#fff'
                            }
                            bgGradient={
                              isCategorySelectedInModal(category.id)
                                ? 'linear-gradient(180deg, #fef5f5 47.86%, #fed7d7 123.81%)'
                                : 'linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)'
                            }
                            shadow={
                              isCategorySelectedInModal(category.id)
                                ? '0px 0px 0px 1px #f56565 inset, 0px 0px 0px 2px #fff inset'
                                : '0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset'
                            }
                            _hover={{
                              bgGradient: isCategorySelectedInModal(category.id)
                                ? 'linear-gradient(180deg, #fed7d7 47.86%, #feb2b2 123.81%)'
                                : 'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                            }}
                            onClick={() => {
                              if (isCategorySelectedInModal(category.id)) {
                                handleRemoveCategoryFromModal(
                                  String(category.id)
                                )
                              } else {
                                handleAddCategoryToModal(category)
                              }
                            }}
                            leftIcon={
                              isCategorySelectedInModal(category.id) ? (
                                <X size={16} />
                              ) : (
                                <Plus size={16} />
                              )
                            }
                          >
                            {isCategorySelectedInModal(category.id)
                              ? 'Remover'
                              : 'Adicionar'}
                          </Button>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter borderTop="1px solid #DEE6F2">
              <HStack spacing={3} w="full" justify="flex-end">
                <Button
                  onClick={handleCloseCategoriesModal}
                  variant="ghost"
                  size="md"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmCategories}
                  colorScheme="blue"
                  size="md"
                >
                  Adicionar Categorias Selecionadas (
                  {tempSelectedCategories.length})
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={isHighCommissionModalOpen}
          onClose={onHighCommissionModalClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              fontSize="md"
              fontWeight="600"
              color="#131D53"
              borderBottom="1px solid #DEE6F2"
            >
              Comissão Alta
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={6}>
              <Text fontSize="sm" color="#131D53">
                Sua comissão está maior que 30%. Deseja prosseguir mesmo assim?
              </Text>
            </ModalBody>
            <ModalFooter gap={3}>
              <Button
                variant="ghost"
                onClick={onHighCommissionModalClose}
                fontSize="sm"
                color="#131D53"
                _hover={{ bg: '#F7FAFC' }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmHighCommission}
                fontSize="sm"
                color="#fff"
                bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
                shadow="0px 0px 0px 1px #0055F4"
                _hover={{
                  bgGradient:
                    'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                }}
                isLoading={isSubmitting}
              >
                Confirmar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </AppLayout>
    </>
  )
}
