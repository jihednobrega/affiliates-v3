import { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  VStack,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
  Text,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  Skeleton,
  Box,
  useToast,
  HStack,
  useDisclosure,
} from '@chakra-ui/react'
import { Search, Eye, Trash2, Ellipsis, AlertTriangle } from 'lucide-react'
import { useAffiliateLinks } from '@/hooks/useAffiliateLinks'
import { Pagination, ProductImage } from '@/components/UI'
import { LinksService } from '@/services/links'

interface AffiliateLinksModalProps {
  isOpen: boolean
  onClose: () => void
  affiliateId: number
  affiliateName: string
}

export function AffiliateLinksModal({
  isOpen,
  onClose,
  affiliateId,
  affiliateName,
}: AffiliateLinksModalProps) {
  const toast = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchProduct, setSearchProduct] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [linkToDelete, setLinkToDelete] = useState<number | null>(null)
  const [isDeletingLink, setIsDeletingLink] = useState(false)
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchProduct)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchProduct])

  const { data, isLoading, refetch } = useAffiliateLinks({
    user: affiliateId,
    page: currentPage,
    perpage: 5,
    product: debouncedSearch || undefined,
  })

  const handleDeleteLink = (linkId: number) => {
    setLinkToDelete(linkId)
    onDeleteModalOpen()
  }

  const handleConfirmDelete = async () => {
    if (!linkToDelete) return

    setIsDeletingLink(true)

    try {
      const linksService = new LinksService()
      const { response, status } = await linksService.deleteAffiliateLink(
        linkToDelete
      )

      if (status === 200 && response?.success) {
        toast({
          title: response.message || 'Link excluído com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        await refetch()

        setIsDeletingLink(false)
        onDeleteModalClose()
        setLinkToDelete(null)
      } else {
        setIsDeletingLink(false)
        throw new Error('Falha ao excluir link')
      }
    } catch (error) {
      setIsDeletingLink(false)
      toast({
        title: 'Erro ao excluir link',
        description: 'Não foi possível excluir o link. Tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleCancelDelete = () => {
    setLinkToDelete(null)
    onDeleteModalClose()
  }

  const handleViewProduct = (sourceUrl: string) => {
    window.open(sourceUrl, '_blank')
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside" isCentered>
      <ModalOverlay />
      <ModalContent
        maxW={{ base: 'calc(100vw - 32px)', md: '1200px' }}
        maxH={{ base: 'calc(100vh - 64px)', md: '90vh' }}
        mx={{ base: 4, md: 'auto' }}
        my={{ base: 8, md: 'auto' }}
        borderRadius="xl"
      >
        <ModalHeader
          fontSize="lg"
          fontWeight="semibold"
          color="#131D53"
          borderBottom="1px solid"
          borderColor="#dee6f2"
        >
          Hotlinks de {affiliateName}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={4}>
          <VStack spacing={4} align="stretch">
            {/* Busca por produto */}
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
                placeholder="Buscar por produto..."
                border="none"
                flex="1"
                fontSize="sm"
                _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
              />
            </HStack>

            {/* Tabela de links */}
            <Box
              position="relative"
              border="1px solid"
              borderColor="#dee6f2"
              borderRadius="md"
              overflow="hidden"
            >
              <Box overflowX="auto">
                <Box minW="700px">
                  <TableContainer>
                    <Table variant="simple">
                      <Thead bg="white">
                        <Tr>
                          <Th
                            color="#131d53"
                            fontSize="xs"
                            fontWeight="normal"
                            textTransform="none"
                            px={4}
                            maxW="400px"
                          >
                            Hotlink
                          </Th>
                          <Th
                            color="#131d53"
                            fontSize="xs"
                            fontWeight="normal"
                            textTransform="none"
                            px={4}
                            textAlign="center"
                            w="150px"
                          >
                            Visualizações
                          </Th>
                          <Th px={8} w={{ base: '86px', md: '250px' }} />
                        </Tr>
                      </Thead>
                      <Tbody>
                        {isLoading ? (
                          Array.from({ length: 5 }).map((_, index) => (
                            <Tr key={index}>
                              <Td px={4}>
                                <Flex align="center" gap={3}>
                                  <Skeleton
                                    width="40px"
                                    height="40px"
                                    borderRadius="4px"
                                  />
                                  <VStack align="start" spacing={1} flex={1}>
                                    <Skeleton height="14px" width="200px" />
                                    <Skeleton height="12px" width="150px" />
                                  </VStack>
                                </Flex>
                              </Td>
                              <Td px={4}>
                                <Skeleton
                                  height="14px"
                                  width="40px"
                                  mx="auto"
                                />
                              </Td>
                              <Td px={4}>
                                <Skeleton
                                  height="32px"
                                  width="200px"
                                  display={{ base: 'none', md: 'block' }}
                                  ml="auto"
                                />
                              </Td>
                            </Tr>
                          ))
                        ) : data && data.links.length > 0 ? (
                          data.links.map((link) => (
                            <Tr
                              key={link.id}
                              _hover={{ bg: '#F3F6FA' }}
                              borderTop="1px solid #DEE6F2"
                              _first={{ borderTop: 'none' }}
                            >
                              {/* Hotlink (Produto + URL) */}
                              <Td px={4} maxW="400px">
                                <Flex align="center" gap={3} overflow="hidden">
                                  <Box
                                    w="40px"
                                    h="40px"
                                    border="1px solid #E6E6E6"
                                    borderRadius="4px"
                                    bg="white"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    flexShrink={0}
                                  >
                                    <ProductImage
                                      src={link.image}
                                      alt={link.product}
                                      width="40px"
                                      height="40px"
                                      objectFit="contain"
                                    />
                                  </Box>
                                  <VStack
                                    align="start"
                                    spacing={0.5}
                                    flex={1}
                                    minW={0}
                                  >
                                    <Text
                                      fontSize="sm"
                                      color="#131D53"
                                      noOfLines={1}
                                      fontWeight="500"
                                      overflow="hidden"
                                      textOverflow="ellipsis"
                                      whiteSpace="nowrap"
                                      width="100%"
                                    >
                                      {link.product || 'Produto não informado'}
                                    </Text>
                                    <Text
                                      fontSize="xs"
                                      color="#131D5399"
                                      noOfLines={1}
                                      overflow="hidden"
                                      textOverflow="ellipsis"
                                      whiteSpace="nowrap"
                                      width="100%"
                                    >
                                      {link.url || 'N/A'}
                                    </Text>
                                  </VStack>
                                </Flex>
                              </Td>

                              {/* Visualizações */}
                              <Td px={4} textAlign="center">
                                <Text fontSize="sm" color="#131D53">
                                  {link.total_views || 0}
                                </Text>
                              </Td>

                              {/* Ações */}
                              <Td px={4}>
                                {/* Desktop: Botões diretos */}
                                <Flex
                                  align="center"
                                  justify="end"
                                  display={{ base: 'none', md: 'flex' }}
                                >
                                  <Button
                                    onClick={() =>
                                      handleViewProduct(link.source_url)
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
                                    rightIcon={<Eye size={14} />}
                                    iconSpacing="6px"
                                  >
                                    Ver produto
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteLink(link.id)}
                                    bg="white"
                                    color="red.500"
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
                                    isDisabled={isDeletingLink}
                                    _hover={{
                                      bg: '#FEE',
                                      borderTop: '1px solid #feb2b2',
                                      borderRight: '1px solid #feb2b2',
                                      borderBottom: '1px solid #feb2b2',
                                      borderLeft: '1px solid #feb2b2',
                                    }}
                                    rightIcon={<Trash2 size={14} />}
                                    iconSpacing="6px"
                                  >
                                    Excluir
                                  </Button>
                                </Flex>

                                {/* Mobile: Menu de ações */}
                                <Box
                                  className="absolute w-[86px] h-15 right-0 bg-button-white-gradient flex items-center justify-end -translate-y-1/2"
                                  display={{ base: 'flex', md: 'none' }}
                                >
                                  <Menu placement="auto" strategy="fixed">
                                    <MenuButton
                                      as={IconButton}
                                      w={9}
                                      h={7}
                                      mr={3}
                                      aria-label="Opções"
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
                                          icon={<Eye size={16} />}
                                          onClick={() =>
                                            handleViewProduct(link.source_url)
                                          }
                                          fontSize="sm"
                                          _hover={{ bg: 'gray.100' }}
                                        >
                                          Ver produto
                                        </MenuItem>
                                        <MenuItem
                                          icon={<Trash2 size={16} />}
                                          onClick={() =>
                                            handleDeleteLink(link.id)
                                          }
                                          fontSize="sm"
                                          color="red.500"
                                          isDisabled={isDeletingLink}
                                          _hover={{ bg: 'red.50' }}
                                        >
                                          Excluir link
                                        </MenuItem>
                                      </MenuList>
                                    </Portal>
                                  </Menu>
                                </Box>
                              </Td>
                            </Tr>
                          ))
                        ) : (
                          <Tr>
                            <Td colSpan={3} textAlign="center" py={8}>
                              <Text color="gray.500">
                                Nenhum link encontrado
                              </Text>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </Box>

            {/* Paginação */}
            {data && data.meta && data.meta.last_page > 1 && (
              <Flex justify="center" mt={4}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={data.meta.last_page}
                  onPageChange={handlePageChange}
                />
              </Flex>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        isCentered
        size="sm"
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
            Confirmar exclusão
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={6}>
            <Text color="#131D53" fontSize="sm">
              Tem certeza que deseja excluir este link? Esta ação não pode ser
              desfeita.
            </Text>
          </ModalBody>

          <ModalFooter
            borderTop="1px solid"
            borderColor="#dee6f2"
            gap={3}
            pt={4}
          >
            <Button
              onClick={handleCancelDelete}
              bg="white"
              color="#131D53"
              fontSize="14px"
              fontWeight="500"
              h="32px"
              px="16px"
              border="1px solid #DEE6F2"
              borderRadius="6px"
              isDisabled={isDeletingLink}
              _hover={{ bg: 'gray.50' }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              bg="red.500"
              color="white"
              fontSize="14px"
              fontWeight="500"
              h="32px"
              px="16px"
              borderRadius="6px"
              isLoading={isDeletingLink}
              loadingText="Excluindo..."
              _hover={{ bg: 'red.600' }}
            >
              Excluir link
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Modal>
  )
}
