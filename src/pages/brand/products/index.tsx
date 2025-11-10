'use client'

import { useState, useEffect, useMemo } from 'react'
import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import { Pagination } from '@/components/UI'
import Head from 'next/head'
import {
  Box,
  Flex,
  Text,
  HStack,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  VStack,
  Grid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Switch,
  useToast,
  Tooltip,
  Skeleton,
} from '@chakra-ui/react'
import { Package, Search, ArrowUpDown, Star, Edit, Pencil } from 'lucide-react'
import { ProductImage } from '@/components/UI'
import { ShimmerBadge } from '@/components/UI/Badges'
import { ProductsService } from '@/services/products'
import { CategoriesService } from '@/services/categories'
import type { ProductItem } from '@/services/types/products.types'
import type { Category } from '@/services/types/categories.types'

type SortOrder = 'highest' | 'lowest' | null

function ProductsLoadingSkeleton() {
  return (
    <Grid
      templateColumns={{
        base: 'repeat(2, 1fr)',
        md: 'repeat(auto-fill, minmax(270px, 1fr))',
      }}
      gap={3}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <Box
          key={i}
          bg="white"
          borderRadius="md"
          borderWidth={1}
          borderColor="#DEE6F2"
          overflow="hidden"
        >
          <Flex justify="center" align="center" h="120px" bg="#F7FAFC">
            <Skeleton height="100px" width="100px" />
          </Flex>

          <Box h="200px" p={3} borderTopWidth={1} borderTopColor="#E6EEFA">
            <Skeleton height="20px" width="60px" borderRadius="4px" mb={3} />
            <Skeleton height="14px" width="90%" mb={1} />
            <Skeleton height="14px" width="70%" mb={2} />
            <Skeleton height="12px" width="50%" mb={1} />
            <Skeleton height="12px" width="80%" mb={3} />
            <Skeleton height="16px" width="60%" mb={3} />
            <HStack gap={2}>
              <Skeleton height="32px" flex={1} borderRadius="md" />
              <Skeleton height="32px" flex={1} borderRadius="md" />
            </HStack>
          </Box>
        </Box>
      ))}
    </Grid>
  )
}

function CategoriesLoadingSkeleton() {
  return (
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
                <Skeleton height="12px" width="80px" />
              </Th>
              <Th px={4} fontSize="xs">
                <Skeleton height="12px" width="100px" />
              </Th>
              <Th px={4} fontSize="xs">
                <Skeleton height="12px" width="60px" />
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <Tr key={i} borderTop="1px solid #DEE6F2">
                <Td px={4}>
                  <Skeleton height="16px" width="180px" />
                </Td>
                <Td px={4}>
                  <Skeleton height="16px" width="220px" />
                </Td>
                <Td px={4}>
                  <Flex align="center" justify="end">
                    <Skeleton height="32px" width="80px" borderRadius="md" />
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default function BrandProducts() {
  const toast = useToast()

  const productsService = useMemo(() => new ProductsService(), [])
  const categoriesService = useMemo(() => new CategoriesService(), [])

  const [activeTab, setActiveTab] = useState<'products' | 'categories'>(
    'products'
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)

  const [products, setProducts] = useState<ProductItem[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [productsMeta, setProductsMeta] = useState<{
    current_page: number
    last_page: number
    total_items: number
  } | null>(null)
  const [currentProductsPage, setCurrentProductsPage] = useState(1)
  const itemsPerPage = 12

  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [currentCategoriesPage, setCurrentCategoriesPage] = useState(1)
  const categoriesPerPage = 10

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null
  )
  const [editCommission, setEditCommission] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editFeatured, setEditFeatured] = useState(false)
  const [togglingProductId, setTogglingProductId] = useState<number | null>(
    null
  )

  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  )
  const [editCategoryCommission, setEditCategoryCommission] = useState('')
  const [propagateToTree, setPropagateToTree] = useState(false)
  const [propagateToProducts, setPropagateToProducts] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentProductsPage(1)
      setCurrentCategoriesPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadProducts = async () => {
    try {
      setProductsLoading(true)
      setProductsError(null)

      const orderByParam =
        sortOrder === 'highest'
          ? 'commission:desc'
          : sortOrder === 'lowest'
          ? 'commission:asc'
          : undefined

      const result = await productsService.getProducts({
        page: currentProductsPage,
        perpage: itemsPerPage,
        product: debouncedSearchTerm || undefined,
        orderBy: orderByParam,
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
        name: debouncedSearchTerm || undefined,
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

  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts()
    }
  }, [currentProductsPage, sortOrder, debouncedSearchTerm, activeTab])

  useEffect(() => {
    loadCategories()
  }, [debouncedSearchTerm])

  const filteredAndSortedProducts = products

  const filteredCategories = categories

  const totalCategoriesPages = Math.ceil(
    filteredCategories.length / categoriesPerPage
  )
  const startCategoryIndex = (currentCategoriesPage - 1) * categoriesPerPage
  const endCategoryIndex = startCategoryIndex + categoriesPerPage
  const paginatedCategories = filteredCategories.slice(
    startCategoryIndex,
    endCategoryIndex
  )

  const handleToggleFeatured = async (productId: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    setTogglingProductId(productId)

    const newFeaturedState = !product.featured

    try {
      const result = await productsService.updateProduct({
        id: productId,
        featured: newFeaturedState,
      })

      if (result.response?.success) {
        toast({
          title: 'Produto atualizado!',
          description: `Produto ${
            newFeaturedState ? 'marcado como' : 'removido de'
          } destaque.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        await loadProducts()
        setTogglingProductId(null)
      } else {
        setTogglingProductId(null)
        throw new Error('Falha ao atualizar produto')
      }
    } catch (error) {
      setTogglingProductId(null)
      toast({
        title: 'Erro ao atualizar produto',
        description: 'Não foi possível atualizar o produto. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleEditProduct = (productId: number) => {
    const product = products.find((p) => p.id === productId)
    if (product) {
      setSelectedProduct(product)

      const formattedValue = formatCommissionInput(
        product.commission.toString()
      )
      setEditCommission(formattedValue)
      setEditUrl(product.url)
      setEditFeatured(product.featured || false)
      setIsEditModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setSelectedProduct(null)
    setEditCommission('')
    setEditUrl('')
    setEditFeatured(false)
  }

  const handleProductCommissionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setEditCommission(value)
  }

  const handleProductCommissionBlur = () => {
    if (editCommission) {
      const formatted = formatCommissionInput(editCommission)
      setEditCommission(formatted)
    }
  }

  const handleSaveProduct = async () => {
    if (!selectedProduct) return

    try {
      const commissionValue = parseFloat(
        parseCommissionForPayload(editCommission)
      )

      const result = await productsService.updateProduct({
        id: selectedProduct.id,
        commission: commissionValue,
        url: editUrl,
        featured: editFeatured,
      })

      if (result.response?.success) {
        toast({
          title: 'Produto atualizado!',
          description: 'As alterações foram salvas com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        handleCloseModal()

        loadProducts()
      } else {
        throw new Error('Falha ao atualizar produto')
      }
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const formatCommissionInput = (value: string): string => {
    const numbers = value.replace(/[^\d.,]/g, '').replace('.', ',')

    if (!numbers) return ''

    const parts = numbers.split(',')
    const mainPart = parts[0]
    const decimalPart = parts[1] || ''

    const cleanedForParse = `${mainPart}.${decimalPart}`
    const numValue = parseFloat(cleanedForParse)

    if (isNaN(numValue)) return ''

    return numValue.toFixed(2).replace('.', ',')
  }

  const parseCommissionForPayload = (value: string): string => {
    const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.')

    if (!cleaned) return '0.00'

    const numValue = parseFloat(cleaned)
    if (isNaN(numValue)) return '0.00'

    return numValue.toFixed(2)
  }

  const handleEditCategory = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId)
    if (category) {
      setSelectedCategory(category)

      const formattedValue = category.percentage
        ? formatCommissionInput(category.percentage)
        : '0,00'
      setEditCategoryCommission(formattedValue)
      setPropagateToTree(false)
      setPropagateToProducts(false)
      setIsEditCategoryModalOpen(true)
    }
  }

  const handleCloseCategoryModal = () => {
    setIsEditCategoryModalOpen(false)
    setSelectedCategory(null)
    setEditCategoryCommission('')
    setPropagateToTree(false)
    setPropagateToProducts(false)
  }

  const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEditCategoryCommission(value)
  }

  const handleCommissionBlur = () => {
    if (editCategoryCommission) {
      const formatted = formatCommissionInput(editCategoryCommission)
      setEditCategoryCommission(formatted)
    }
  }

  const handleSaveCategory = async () => {
    if (!selectedCategory) return

    try {
      const percentageForPayload = parseCommissionForPayload(
        editCategoryCommission
      )

      const result = await categoriesService.updateCategory({
        id: String(selectedCategory.id),
        percentage: percentageForPayload,
        propagate_to_category_tree: propagateToTree,
        propagate_to_products: propagateToProducts,
      })

      if (result.response?.success) {
        toast({
          title: 'Categoria atualizada!',
          description: 'As alterações foram salvas com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        handleCloseCategoryModal()

        loadCategories()
      } else {
        throw new Error('Falha ao atualizar categoria')
      }
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const getSortLabel = () => {
    if (sortOrder === 'highest') return 'Comissão mais alta'
    if (sortOrder === 'lowest') return 'Comissão mais baixa'
    return 'Ordenar por'
  }

  return (
    <>
      <Head>
        <title>Meus Produtos | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Box display="flex" flexDirection="column" gap={4} w="full">
            <Flex gap={2} align="center">
              <Package size={24} color="#131D53" />
              <Text fontSize="sm" color="#131D53">
                Meus Produtos
              </Text>
            </Flex>

            <VStack spacing={3} align="stretch">
              <Flex gap={3} display={{ base: 'none', md: 'flex' }}>
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
                    placeholder={
                      activeTab === 'products'
                        ? 'Buscar por nome do produto'
                        : 'Buscar por nome da categoria'
                    }
                    border="none"
                    flex="1"
                    minW="fit-content"
                    fontSize="sm"
                    _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </HStack>

                <Menu>
                  <MenuButton
                    as={Button}
                    size="sm"
                    h={8}
                    px={3}
                    fontSize="xs"
                    fontWeight={500}
                    leftIcon={<ArrowUpDown size={16} />}
                    color="#131D53"
                    bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                    shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                    _hover={{
                      bgGradient:
                        'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                      shadow:
                        '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                    }}
                    flexShrink={0}
                  >
                    {getSortLabel()}
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={() => setSortOrder('highest')}
                      bg={sortOrder === 'highest' ? 'blue.50' : 'transparent'}
                      color={sortOrder === 'highest' ? 'blue.600' : 'inherit'}
                      fontSize="sm"
                    >
                      Comissão mais alta
                    </MenuItem>
                    <MenuItem
                      onClick={() => setSortOrder('lowest')}
                      bg={sortOrder === 'lowest' ? 'blue.50' : 'transparent'}
                      color={sortOrder === 'lowest' ? 'blue.600' : 'inherit'}
                      fontSize="sm"
                    >
                      Comissão mais baixa
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>

              <Flex
                gap={3}
                flexDirection="column"
                display={{ base: 'flex', md: 'none' }}
              >
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
                    placeholder={
                      activeTab === 'products'
                        ? 'Buscar por nome do produto'
                        : 'Buscar por nome da categoria'
                    }
                    border="none"
                    flex="1"
                    fontSize="sm"
                    _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </HStack>

                <Menu>
                  <MenuButton
                    as={Button}
                    size="sm"
                    h={10}
                    px={3}
                    fontSize="xs"
                    fontWeight={500}
                    leftIcon={<ArrowUpDown size={20} />}
                    color="#131D53"
                    bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                    shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                    _hover={{
                      bgGradient:
                        'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                      shadow:
                        '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                    }}
                    w="full"
                  >
                    {getSortLabel()}
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={() => setSortOrder('highest')}
                      bg={sortOrder === 'highest' ? 'blue.50' : 'transparent'}
                      color={sortOrder === 'highest' ? 'blue.600' : 'inherit'}
                      fontSize="sm"
                    >
                      Comissão mais alta
                    </MenuItem>
                    <MenuItem
                      onClick={() => setSortOrder('lowest')}
                      bg={sortOrder === 'lowest' ? 'blue.50' : 'transparent'}
                      color={sortOrder === 'lowest' ? 'blue.600' : 'inherit'}
                      fontSize="sm"
                    >
                      Comissão mais baixa
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            </VStack>
          </Box>
        </PageHeader>

        <PageContent>
          <Box w="full" h={8}>
            <Flex
              w="full"
              bg="#F7FAFC"
              borderRadius={6}
              border="1px solid #DEE6F2"
              overflow="hidden"
            >
              <Button
                flex={1}
                h={8}
                py="6px"
                borderRadius={6}
                border="none"
                fontSize="sm"
                fontWeight={400}
                lineHeight="120%"
                fontFamily="Geist"
                color="#131D53"
                bg={activeTab === 'products' ? undefined : 'transparent'}
                bgGradient={
                  activeTab === 'products'
                    ? 'linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)'
                    : undefined
                }
                shadow={
                  activeTab === 'products'
                    ? '0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset'
                    : undefined
                }
                _hover={
                  activeTab === 'products'
                    ? {
                        bgGradient:
                          'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                        shadow:
                          '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                      }
                    : { bg: '#E6F3FF' }
                }
                onClick={() => setActiveTab('products')}
                transition="all 0.2s ease"
              >
                <Flex gap={2} align="center">
                  <Text>Produtos</Text>
                  {productsMeta && (
                    <Box
                      bg="#DFEFFF"
                      px={2}
                      py={0.5}
                      borderRadius="4px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text
                        fontSize="sm"
                        color="#131D53"
                        fontWeight="400"
                        lineHeight="120%"
                      >
                        {productsMeta.total_items}
                      </Text>
                    </Box>
                  )}
                </Flex>
              </Button>

              <Button
                flex={1}
                h={8}
                py="6px"
                borderRadius={6}
                border="none"
                fontSize="sm"
                fontWeight={400}
                lineHeight="120%"
                fontFamily="Geist"
                color="#131D53"
                bg={activeTab === 'categories' ? undefined : 'transparent'}
                bgGradient={
                  activeTab === 'categories'
                    ? 'linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)'
                    : undefined
                }
                shadow={
                  activeTab === 'categories'
                    ? '0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset'
                    : undefined
                }
                _hover={
                  activeTab === 'categories'
                    ? {
                        bgGradient:
                          'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                        shadow:
                          '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                      }
                    : { bg: '#E6F3FF' }
                }
                onClick={() => setActiveTab('categories')}
                transition="all 0.2s ease"
              >
                <Flex gap={2} align="center">
                  <Text>Categorias</Text>
                  {categories.length > 0 && (
                    <Box
                      bg="#DFEFFF"
                      px={2}
                      py={0.5}
                      borderRadius="4px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text
                        fontSize="sm"
                        color="#131D53"
                        fontWeight="400"
                        lineHeight="120%"
                      >
                        {categories.length}
                      </Text>
                    </Box>
                  )}
                </Flex>
              </Button>
            </Flex>
          </Box>

          {activeTab === 'products' ? (
            <>
              {filteredAndSortedProducts.length > 0 ? (
                <>
                  <Grid
                    templateColumns={{
                      base: 'repeat(2, 1fr)',
                      md: 'repeat(auto-fill, minmax(270px, 1fr))',
                    }}
                    gap={3}
                  >
                    {filteredAndSortedProducts.map((product) => (
                      <Box
                        key={product.id}
                        bg="white"
                        borderWidth={1}
                        borderColor="#E6EEFA"
                        borderRadius="md"
                        overflow="hidden"
                        minW={{ base: 'auto', md: '270px' }}
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
                            percentage={`${product.commission}%`}
                            className="mb-3"
                          />

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
                            <Tooltip
                              label={product.url}
                              fontSize="xs"
                              bg="#131D53"
                              color="white"
                              px={3}
                              py={2}
                              borderRadius="md"
                              hasArrow
                              placement="top"
                            >
                              <Text
                                fontSize="xs"
                                color="#1F70F1"
                                noOfLines={1}
                                overflow="hidden"
                                textOverflow="ellipsis"
                                whiteSpace="nowrap"
                                cursor="pointer"
                                _hover={{ textDecoration: 'underline' }}
                                onClick={() =>
                                  window.open(product.url, '_blank')
                                }
                              >
                                {product.url}
                              </Text>
                            </Tooltip>
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

                          <HStack
                            maxH={{ base: 7, md: 8 }}
                            justify="space-between"
                            gap={2}
                          >
                            <Button
                              w="full"
                              h="full"
                              px={3}
                              py={1.5}
                              size="sm"
                              fontSize="xs"
                              borderRadius="md"
                              color={product.featured ? '#fff' : '#131D53'}
                              bgGradient={
                                product.featured
                                  ? 'linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)'
                                  : 'linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)'
                              }
                              shadow={
                                product.featured
                                  ? '0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset'
                                  : '0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset'
                              }
                              _hover={{
                                bgGradient: product.featured
                                  ? 'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)'
                                  : 'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                                shadow: product.featured
                                  ? '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset'
                                  : '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                              }}
                              transition="all 0.2s ease"
                              onClick={() => handleToggleFeatured(product.id)}
                              isDisabled={togglingProductId === product.id}
                              gap={{ base: 0, md: 1 }}
                              leftIcon={
                                product.featured ? (
                                  <Star size={16} fill="#fff" />
                                ) : (
                                  <Star size={16} />
                                )
                              }
                            >
                              <Text
                                display={{ base: 'none', md: 'block' }}
                                fontSize="xs"
                              >
                                {product.featured ? 'Destacado' : 'Destacar'}
                              </Text>
                            </Button>

                            <Button
                              w="full"
                              h="full"
                              px={3}
                              py={1.5}
                              size="sm"
                              fontSize="xs"
                              borderRadius="md"
                              color="#131D53"
                              bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                              shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                              _hover={{
                                bgGradient:
                                  'linear-gradient(180deg, #eef7fe 47.86%, #c5ddff 123.81%)',
                                shadow:
                                  '0px 0px 0px 1px #80b3ff inset, 0px 0px 0px 2px #fff inset',
                              }}
                              transition="all 0.2s ease"
                              onClick={() => handleEditProduct(product.id)}
                              gap={{ base: 0, md: 1 }}
                              leftIcon={<Pencil size={16} />}
                            >
                              <Text
                                display={{ base: 'none', md: 'block' }}
                                fontSize="xs"
                              >
                                Editar
                              </Text>
                            </Button>
                          </HStack>
                        </Box>
                      </Box>
                    ))}
                  </Grid>

                  {productsMeta && productsMeta.last_page > 1 && (
                    <Box
                      mt={3}
                      pb={4}
                      bg="white"
                      borderRadius="12px"
                      borderWidth={1}
                      borderColor="#DEE6F2"
                    >
                      <Pagination
                        currentPage={currentProductsPage}
                        totalPages={productsMeta.last_page}
                        onPageChange={setCurrentProductsPage}
                        isLoading={productsLoading}
                        align={{ base: 'center', md: 'flex-end' }}
                      />
                    </Box>
                  )}
                </>
              ) : productsLoading ? (
                <ProductsLoadingSkeleton />
              ) : productsError ? (
                <Box textAlign="center" py={12}>
                  <VStack spacing={4}>
                    <Box
                      w="64px"
                      h="64px"
                      bg="#FEE"
                      borderRadius="50%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Package size={32} color="#E53E3E" />
                    </Box>
                    <VStack spacing={2}>
                      <Text fontSize="lg" fontWeight="600" color="#131D53">
                        Erro ao carregar produtos
                      </Text>
                      <Text fontSize="sm" color="#131D5399">
                        {productsError}
                      </Text>
                      <Button
                        mt={2}
                        size="sm"
                        colorScheme="blue"
                        onClick={loadProducts}
                      >
                        Tentar novamente
                      </Button>
                    </VStack>
                  </VStack>
                </Box>
              ) : (
                <Box textAlign="center" py={12}>
                  <VStack spacing={4}>
                    <Box
                      w="64px"
                      h="64px"
                      bg="#F7FAFC"
                      borderRadius="50%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Package size={32} color="#A0AEC0" />
                    </Box>
                    <VStack spacing={2}>
                      <Text fontSize="lg" fontWeight="600" color="#131D53">
                        Nenhum produto encontrado
                      </Text>
                      <Text
                        fontSize="sm"
                        color="#131D5399"
                        maxW="400px"
                        textAlign="center"
                      >
                        {searchTerm
                          ? `Não encontramos produtos com o termo "${searchTerm}".`
                          : 'Adicione produtos para começar.'}
                      </Text>
                    </VStack>
                  </VStack>
                </Box>
              )}
            </>
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
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color="#131d53" pl={3}>
                  Categorias
                </Text>
              </Flex>

              {categoriesLoading && categories.length === 0 ? (
                <CategoriesLoadingSkeleton />
              ) : categoriesError ? (
                <Box textAlign="center" py={12}>
                  <VStack spacing={4}>
                    <Box
                      w="64px"
                      h="64px"
                      bg="#FEE"
                      borderRadius="50%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Package size={32} color="#E53E3E" />
                    </Box>
                    <VStack spacing={2}>
                      <Text fontSize="lg" fontWeight="600" color="#131D53">
                        Erro ao carregar categorias
                      </Text>
                      <Text fontSize="sm" color="#131D5399">
                        {categoriesError}
                      </Text>
                      <Button
                        mt={2}
                        size="sm"
                        colorScheme="blue"
                        onClick={loadCategories}
                      >
                        Tentar novamente
                      </Button>
                    </VStack>
                  </VStack>
                </Box>
              ) : filteredCategories.length > 0 ? (
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
                            Nome
                          </Th>
                          <Th
                            px={4}
                            color="#131d53"
                            fontSize="xs"
                            textTransform="none"
                            fontWeight="normal"
                            textAlign="center"
                          >
                            Comissão (%)
                          </Th>
                          <Th px={4} w="100px" />
                        </Tr>
                      </Thead>
                      <Tbody>
                        {paginatedCategories.map((category) => (
                          <Tr
                            key={category.id}
                            _hover={{ bg: '#F3F6FA' }}
                            borderTop="1px solid #DEE6F2"
                            _first={{ borderTop: 'none' }}
                          >
                            <Td px={4}>
                              <Text fontSize="sm" color="#131D53" noOfLines={1}>
                                {category.name}
                              </Text>
                            </Td>
                            <Td px={4} textAlign="center">
                              <Text
                                fontSize="sm"
                                color="#131D53"
                                fontWeight="600"
                              >
                                {category.percentage || '0'}%
                              </Text>
                            </Td>
                            <Td px={4}>
                              <Button
                                size="sm"
                                fontSize="xs"
                                leftIcon={<Edit size={14} />}
                                color="#131D53"
                                bg="white"
                                border="1px solid #DEE6F2"
                                _hover={{ bg: 'gray.50' }}
                                onClick={() => handleEditCategory(category.id)}
                              >
                                Editar
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : null}

              {!categoriesLoading &&
                !categoriesError &&
                filteredCategories.length > 0 && (
                  <Flex
                    justify="space-between"
                    align="center"
                    pt={3}
                    px={3}
                    display={{ base: 'none', md: 'flex' }}
                  >
                    <Text fontSize="sm" color="#131D5399">
                      Mostrando{' '}
                      {`${
                        (currentCategoriesPage - 1) * categoriesPerPage + 1
                      }-${Math.min(
                        currentCategoriesPage * categoriesPerPage,
                        filteredCategories.length
                      )} de ${filteredCategories.length}`}{' '}
                      categorias
                    </Text>

                    {totalCategoriesPages > 1 && (
                      <Pagination
                        currentPage={currentCategoriesPage}
                        totalPages={totalCategoriesPages}
                        onPageChange={setCurrentCategoriesPage}
                        isLoading={categoriesLoading}
                        align="flex-end"
                      />
                    )}
                  </Flex>
                )}

              {!categoriesLoading &&
                !categoriesError &&
                filteredCategories.length > 0 &&
                totalCategoriesPages > 1 && (
                  <Box display={{ base: 'block', md: 'none' }} pt={3}>
                    <Pagination
                      currentPage={currentCategoriesPage}
                      totalPages={totalCategoriesPages}
                      onPageChange={setCurrentCategoriesPage}
                      isLoading={categoriesLoading}
                      align="center"
                    />
                  </Box>
                )}

              {!categoriesLoading &&
                !categoriesError &&
                filteredCategories.length === 0 && (
                  <Box textAlign="center" py={12}>
                    <VStack spacing={4}>
                      <Box
                        w="64px"
                        h="64px"
                        bg="#F7FAFC"
                        borderRadius="50%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Package size={32} color="#A0AEC0" />
                      </Box>
                      <VStack spacing={2}>
                        <Text fontSize="lg" fontWeight="600" color="#131D53">
                          Nenhuma categoria encontrada
                        </Text>
                        <Text
                          fontSize="sm"
                          color="#131D5399"
                          maxW="400px"
                          textAlign="center"
                        >
                          {searchTerm
                            ? `Não encontramos categorias com o termo "${searchTerm}".`
                            : 'Adicione categorias para organizar seus produtos.'}
                        </Text>
                      </VStack>
                    </VStack>
                  </Box>
                )}
            </Box>
          )}
        </PageContent>

        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          size="md"
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              fontSize="md"
              fontWeight="600"
              color="#131D53"
              borderBottom="1px solid #DEE6F2"
            >
              Editar produto
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody py={6}>
              <VStack spacing={5} align="stretch">
                {selectedProduct && (
                  <Box>
                    <Flex
                      gap={3}
                      align="center"
                      p={3}
                      bg="#F7FAFC"
                      borderRadius="md"
                      border="1px solid #DEE6F2"
                    >
                      <Box
                        w="60px"
                        h="60px"
                        flexShrink={0}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bg="white"
                        borderRadius="md"
                        border="1px solid #E6EEFA"
                      >
                        <ProductImage
                          src={selectedProduct.image}
                          alt={selectedProduct.name}
                          maxHeight="50px"
                          width="auto"
                          objectFit="contain"
                        />
                      </Box>
                      <VStack
                        align="start"
                        spacing={1}
                        flex={1}
                        overflow="hidden"
                      >
                        <Text
                          fontSize="sm"
                          fontWeight="500"
                          color="#131D53"
                          noOfLines={2}
                        >
                          {selectedProduct.name}
                        </Text>
                        <Text fontSize="xs" color="#131D5399">
                          SKU: {selectedProduct.sku}
                        </Text>
                      </VStack>
                    </Flex>
                  </Box>
                )}

                <FormControl>
                  <Flex
                    justify="space-between"
                    align="center"
                    p={3}
                    bg="#F7FAFC"
                    borderRadius="md"
                    border="1px solid #DEE6F2"
                  >
                    <Box>
                      <FormLabel
                        fontSize="sm"
                        color="#131D53"
                        mb={0}
                        fontWeight="500"
                      >
                        Produto em destaque
                      </FormLabel>
                      <Text fontSize="xs" color="#131D5399" mt={1}>
                        Destaque este produto na vitrine
                      </Text>
                    </Box>
                    <Switch
                      isChecked={editFeatured}
                      onChange={(e) => setEditFeatured(e.target.checked)}
                      colorScheme="blue"
                      size="md"
                    />
                  </Flex>
                </FormControl>

                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="#131D53"
                    mb={2}
                    fontWeight="500"
                  >
                    Comissão (%)
                  </FormLabel>
                  <Input
                    type="text"
                    value={editCommission}
                    onChange={handleProductCommissionChange}
                    onBlur={handleProductCommissionBlur}
                    placeholder="Ex: 15,00"
                    fontSize="sm"
                    borderColor="#DEE6F2"
                    _hover={{ borderColor: '#1F70F1' }}
                    _focus={{
                      borderColor: '#1F70F1',
                      boxShadow: '0 0 0 1px #1F70F1',
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="#131D53"
                    mb={2}
                    fontWeight="500"
                  >
                    URL do produto
                  </FormLabel>
                  <Input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    placeholder="https://exemplo.com/produto"
                    fontSize="sm"
                    borderColor="#DEE6F2"
                    _hover={{ borderColor: '#1F70F1' }}
                    _focus={{
                      borderColor: '#1F70F1',
                      boxShadow: '0 0 0 1px #1F70F1',
                    }}
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter borderTop="1px solid #DEE6F2" gap={3}>
              <Button
                variant="ghost"
                onClick={handleCloseModal}
                fontSize="sm"
                color="#131D53"
                _hover={{ bg: '#F7FAFC' }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveProduct}
                fontSize="sm"
                color="#fff"
                bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
                shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                _hover={{
                  bgGradient:
                    'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                  shadow:
                    '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                }}
              >
                Salvar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={isEditCategoryModalOpen}
          onClose={handleCloseCategoryModal}
          size="md"
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              fontSize="md"
              fontWeight="600"
              color="#131D53"
              borderBottom="1px solid #DEE6F2"
            >
              Editar categoria
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody py={6}>
              <VStack spacing={5} align="stretch">
                {selectedCategory && (
                  <Box>
                    <Flex
                      gap={3}
                      align="center"
                      p={3}
                      bg="#F7FAFC"
                      borderRadius="md"
                      border="1px solid #DEE6F2"
                    >
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontSize="sm" fontWeight="500" color="#131D53">
                          {selectedCategory.name}
                        </Text>
                        <Text fontSize="xs" color="#131D5399">
                          Comissão atual: {selectedCategory.percentage || '0'}%
                        </Text>
                      </VStack>
                    </Flex>
                  </Box>
                )}

                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="#131D53"
                    mb={2}
                    fontWeight="500"
                  >
                    Comissão (%)
                  </FormLabel>
                  <Input
                    type="text"
                    value={editCategoryCommission}
                    onChange={handleCommissionChange}
                    onBlur={handleCommissionBlur}
                    placeholder="Ex: 15,00"
                    fontSize="sm"
                    borderColor="#DEE6F2"
                    _hover={{ borderColor: '#1F70F1' }}
                    _focus={{
                      borderColor: '#1F70F1',
                      boxShadow: '0 0 0 1px #1F70F1',
                    }}
                  />
                </FormControl>

                <FormControl>
                  <Flex
                    justify="space-between"
                    align="center"
                    p={3}
                    bg="#F7FAFC"
                    borderRadius="md"
                    border="1px solid #DEE6F2"
                  >
                    <Box flex={1}>
                      <FormLabel
                        fontSize="sm"
                        color="#131D53"
                        mb={0}
                        fontWeight="500"
                      >
                        Propagar para a árvore da categoria
                      </FormLabel>
                      <Text fontSize="xs" color="#131D5399" mt={1}>
                        Selecione caso queira que toda a hierarquia de
                        subcategorias abaixo dessa tenha o mesmo valor de
                        comissão.
                      </Text>
                    </Box>
                    <Switch
                      isChecked={propagateToTree}
                      onChange={(e) => setPropagateToTree(e.target.checked)}
                      colorScheme="blue"
                      size="md"
                      ml={3}
                    />
                  </Flex>
                </FormControl>

                <FormControl>
                  <Flex
                    justify="space-between"
                    align="center"
                    p={3}
                    bg="#F7FAFC"
                    borderRadius="md"
                    border="1px solid #DEE6F2"
                  >
                    <Box flex={1}>
                      <FormLabel
                        fontSize="sm"
                        color="#131D53"
                        mb={0}
                        fontWeight="500"
                      >
                        Propagar para todos os produtos
                      </FormLabel>
                      <Text fontSize="xs" color="#131D5399" mt={1}>
                        Selecione para que todos os produtos dessa categoria e
                        de suas respectivas subcategorias tenham o mesmo valor
                        de comissão.
                      </Text>
                    </Box>
                    <Switch
                      isChecked={propagateToProducts}
                      onChange={(e) => setPropagateToProducts(e.target.checked)}
                      colorScheme="blue"
                      size="md"
                      ml={3}
                    />
                  </Flex>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter borderTop="1px solid #DEE6F2" gap={3}>
              <Button
                variant="ghost"
                onClick={handleCloseCategoryModal}
                fontSize="sm"
                color="#131D53"
                _hover={{ bg: '#F7FAFC' }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveCategory}
                fontSize="sm"
                color="#fff"
                bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
                shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
                _hover={{
                  bgGradient:
                    'linear-gradient(180deg, #6BA6FF -27.08%, #2A65E8 123.81%)',
                  shadow:
                    '0px 0px 0px 1px #1F70F1, 0px -1px 0px 0px rgba(0, 56, 169, 0.40) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.70) inset',
                }}
              >
                Salvar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </AppLayout>
    </>
  )
}
