import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import Head from 'next/head'
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Image,
  Skeleton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { Network as NetworkIcon, Search, SlidersHorizontal } from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import { useNetwork } from '@/hooks/useNetwork'
import { EmptyState, ErrorState, Pagination } from '@/components/UI'

const STATUS_OPTIONS: Array<{
  value: 'enabled' | 'disabled' | 'new' | 'blocked' | undefined
  label: string
}> = [
  { value: undefined, label: 'Todos os Status' },
  { value: 'enabled', label: 'Ativo' },
  { value: 'disabled', label: 'Inativo' },
  { value: 'new', label: 'Novo' },
  { value: 'blocked', label: 'Bloqueado' },
]

function NetworkLoadingSkeleton() {
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
      <Flex justify="space-between" align="center">
        <Text fontSize="sm" color="#131d53" pl={3}>
          Minha Rede de Subafiliados
        </Text>
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
                <Th px={4} fontSize="xs">
                  <Skeleton height="12px" width="40px" />
                </Th>
                <Th px={4} fontSize="xs">
                  <Skeleton height="12px" width="50px" />
                </Th>
                <Th px={4} fontSize="xs">
                  <Skeleton height="12px" width="100px" />
                </Th>
                <Th px={4} fontSize="xs">
                  <Skeleton height="12px" width="120px" />
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <Tr key={i} borderTop="1px solid #DEE6F2">
                  <Td px={4} maxW="200px">
                    <Flex align="center" gap={2.5}>
                      <Skeleton
                        w="32px"
                        h="32px"
                        borderRadius="full"
                        flexShrink={0}
                      />
                      <Skeleton height="16px" width="120px" />
                    </Flex>
                  </Td>
                  <Td px={4}>
                    <Skeleton height="16px" width="150px" />
                  </Td>
                  <Td px={4}>
                    <Skeleton height="20px" width="60px" borderRadius="6px" />
                  </Td>
                  <Td px={4}>
                    <Skeleton height="16px" width="80px" />
                  </Td>
                  <Td px={4}>
                    <Skeleton height="16px" width="90px" />
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

export default function Network() {
  const [currentPage, setCurrentPage] = useState(1)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  const [selectedStatus, setSelectedStatus] = useState<
    'enabled' | 'disabled' | 'new' | 'blocked' | undefined
  >(undefined)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedSearchTerm, selectedStatus])

  const {
    data: networkData,
    meta,
    loading,
    error,
    errorStatus,
    retry,
  } = useNetwork({
    page: currentPage,
    search: debouncedSearchTerm || undefined,
    status: selectedStatus,
  })

  const isInitialLoading = loading && networkData.length === 0

  const handleClearSearch = () => {
    setSearchTerm('')
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }

  const filteredData = networkData
  const hasActiveSearch = !!debouncedSearchTerm

  function AffiliateAvatar({ src, name }: { src: string; name: string }) {
    const [imgSrc, setImgSrc] = useState(src)
    const [hasError, setHasError] = useState(false)

    const handleError = useCallback(() => {
      if (!hasError) {
        setHasError(true)
        setImgSrc('')
      }
    }, [hasError])

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    if (!imgSrc || hasError) {
      return (
        <Box
          w="32px"
          h="32px"
          bg="#DFEFFF"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="xs"
          fontWeight="medium"
          color="#131D53"
          flexShrink={0}
        >
          {getInitials(name)}
        </Box>
      )
    }

    return (
      <Image
        src={imgSrc}
        alt={name}
        w="32px"
        h="32px"
        borderRadius="full"
        objectFit="cover"
        flexShrink={0}
        onError={handleError}
      />
    )
  }

  if (isInitialLoading) {
    return (
      <>
        <Head>
          <title>Minha Rede | Affiliates</title>
        </Head>
        <AppLayout>
          <PageHeader>
            <Box display="flex" flexDirection="column" gap={2} w="full">
              <Flex justifyContent="space-between">
                <Flex gap={2} align="center">
                  <NetworkIcon size={24} color="#131D53" />
                  <HStack fontSize="sm" color="#131D53">
                    <Text>Minha Rede:</Text>
                    <Skeleton height="24px" width="40px" borderRadius="4px" />
                  </HStack>
                </Flex>
              </Flex>

              <Box display={{ base: 'block', md: 'none' }}>
                <Skeleton height="40px" borderRadius="4px" mb={2} />
                <HStack gap={2}>
                  <Skeleton height="32px" flex={1} borderRadius="4px" />
                </HStack>
              </Box>

              <HStack display={{ base: 'none', md: 'flex' }} gap={3}>
                <Skeleton height="32px" flex={1} borderRadius="4px" />
                <Skeleton height="32px" width="160px" borderRadius="4px" />
              </HStack>
            </Box>
          </PageHeader>
          <PageContent>
            <NetworkLoadingSkeleton />
          </PageContent>
        </AppLayout>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Minha Rede | Affiliates</title>
        </Head>
        <AppLayout>
          <PageHeader>
            <Flex gap={2} align="center">
              <NetworkIcon size={24} color="#131D53" />
              <Text fontSize="sm" color="#131D53">
                Minha Rede
              </Text>
            </Flex>
          </PageHeader>
          <PageContent>
            <ErrorState
              description={
                errorStatus === 422
                  ? error
                  : 'Não foi possível carregar sua rede de afiliados. Verifique sua conexão e tente novamente.'
              }
              onRetry={errorStatus === 422 ? undefined : retry}
            />
          </PageContent>
        </AppLayout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Minha Rede | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Box display="flex" flexDirection="column" gap={4} w="full">
            <Flex justifyContent="space-between">
              <Flex gap={2} align="center">
                <NetworkIcon size={24} color="#131D53" />
                <HStack fontSize="sm" color="#131D53">
                  <Text>Minha Rede:</Text>
                  {loading ? (
                    <Skeleton height="24px" width="40px" borderRadius="4px" />
                  ) : (
                    <Box
                      alignContent="center"
                      justifyContent="center"
                      bgColor="#DFEFFF"
                      px={2}
                      py={0.5}
                      rounded={4}
                      lineHeight="120%"
                    >
                      {hasActiveSearch
                        ? filteredData.length
                        : meta?.total_items || networkData.length}
                    </Box>
                  )}
                </HStack>
              </Flex>
            </Flex>

            <Box display={{ base: 'block', md: 'none' }}>
              <HStack
                h={10}
                position="relative"
                rounded={4}
                borderWidth={1}
                borderColor="#DEE6F2"
                gap={0}
                transition="all 0.2s"
                mb={2}
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
                  placeholder="Pesquise pelo nome do subafiliado"
                  flex="1"
                  minW="fit-content"
                  _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </HStack>
              <HStack gap={2} justify="space-between">
                <Menu>
                  <MenuButton w="full">
                    <Button
                      w="full"
                      rounded={4}
                      size="sm"
                      fontSize="xs"
                      fontWeight={500}
                      px={3}
                      py={1.5}
                      bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                      shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                      color="#131D53"
                      leftIcon={<SlidersHorizontal size={16} />}
                    >
                      {STATUS_OPTIONS.find(
                        (option) => option.value === selectedStatus
                      )?.label || 'Filtrar por Status'}
                    </Button>
                  </MenuButton>
                  <MenuList>
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem
                        key={option.value || 'all'}
                        onClick={() => setSelectedStatus(option.value)}
                        bg={
                          selectedStatus === option.value
                            ? 'blue.50'
                            : 'transparent'
                        }
                        color={
                          selectedStatus === option.value
                            ? 'blue.600'
                            : 'inherit'
                        }
                        fontSize="sm"
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </HStack>
            </Box>

            <HStack
              display={{ base: 'none', md: 'flex' }}
              gap={3}
              align="center"
            >
              <HStack
                h={8}
                position="relative"
                rounded={4}
                borderWidth={1}
                borderColor="#DEE6F2"
                gap={0}
                transition="all 0.2s"
                flex={1}
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
                  py={1}
                  px={2}
                  variant="unstyled"
                  placeholder="Pesquise pelo nome do subafiliado"
                  flex="1"
                  minW="fit-content"
                  _placeholder={{ color: '#C5CDDC', fontSize: 'sm' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </HStack>

              <Menu>
                <MenuButton>
                  <Button
                    rounded={4}
                    size="sm"
                    fontSize="xs"
                    fontWeight={500}
                    px={3}
                    py={1.5}
                    bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
                    shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
                    color="#131D53"
                    flexShrink={0}
                    leftIcon={<SlidersHorizontal size={16} />}
                  >
                    {STATUS_OPTIONS.find(
                      (option) => option.value === selectedStatus
                    )?.label || 'Filtrar por Status'}
                  </Button>
                </MenuButton>
                <MenuList>
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem
                      key={option.value || 'all'}
                      onClick={() => setSelectedStatus(option.value)}
                      bg={
                        selectedStatus === option.value
                          ? 'blue.50'
                          : 'transparent'
                      }
                      color={
                        selectedStatus === option.value ? 'blue.600' : 'inherit'
                      }
                      fontSize="sm"
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </HStack>
          </Box>
        </PageHeader>

        <PageContent>
          {loading && !isInitialLoading ? (
            <NetworkLoadingSkeleton />
          ) : filteredData.length === 0 && hasActiveSearch ? (
            <EmptyState
              icon={Search}
              title="Nenhum afiliado encontrado"
              description={`Não encontramos afiliados para "${debouncedSearchTerm}". Tente ajustar o termo de busca.`}
              actionButton={{
                label: 'Limpar Busca',
                onClick: handleClearSearch,
                variant: 'outline',
              }}
            />
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={NetworkIcon}
              title={
                hasActiveSearch || selectedStatus
                  ? 'Nenhum subafiliado encontrado'
                  : 'Nenhum subafiliado cadastrado ainda'
              }
              description={
                hasActiveSearch || selectedStatus
                  ? 'Não encontramos subafiliados com os filtros aplicados. Tente ajustar os critérios de busca.'
                  : 'Convide novos afiliados para expandir sua rede. Seus subafiliados aparecerão aqui quando se cadastrarem.'
              }
            />
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
                  Minha Rede de Subafiliados
                </Text>
              </Flex>

              <Box
                border="1px solid #DEE6F2"
                borderRadius="md"
                overflow="scroll"
                position="relative"
              >
                <TableContainer>
                  <Table
                    variant="simple"
                    sx={{
                      td: {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <Thead>
                      <Tr>
                        <Th
                          px={4}
                          fontSize="xs"
                          textTransform="none"
                          fontWeight="normal"
                          color="#131d53"
                        >
                          Afiliado
                        </Th>
                        <Th
                          px={4}
                          fontSize="xs"
                          textTransform="none"
                          fontWeight="normal"
                          color="#131d53"
                        >
                          Email
                        </Th>
                        <Th
                          px={4}
                          fontSize="xs"
                          textTransform="none"
                          fontWeight="normal"
                          color="#131d53"
                          textAlign="center"
                        >
                          Status
                        </Th>
                        <Th
                          px={4}
                          fontSize="xs"
                          textTransform="none"
                          fontWeight="normal"
                          color="#131d53"
                        >
                          Total em Vendas
                        </Th>
                        <Th
                          px={4}
                          fontSize="xs"
                          textTransform="none"
                          fontWeight="normal"
                          color="#131d53"
                        >
                          Total em Comissões
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody fontSize="xs">
                      {filteredData.map((item) => (
                        <Tr
                          key={item.id}
                          _hover={{ bg: '#F3F6FA' }}
                          borderTop="1px solid #DEE6F2"
                          _first={{ borderTop: 'none' }}
                        >
                          <Td px={4} maxW="200px">
                            <Flex align="center" gap={2.5}>
                              <AffiliateAvatar
                                src={item.avatar}
                                name={item.affiliateName}
                              />
                              <Text
                                noOfLines={1}
                                color="#131D53"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                maxW="120px"
                                fontSize="sm"
                              >
                                {item.affiliateName}
                              </Text>
                            </Flex>
                          </Td>
                          <Td px={4} color="#131D53" fontSize="sm">
                            {item.email}
                          </Td>
                          <Td px={4} textAlign="center">
                            <Badge
                              colorScheme={
                                item.status === 'Ativo'
                                  ? 'green'
                                  : item.status === 'Novo'
                                  ? 'blue'
                                  : item.status === 'Bloqueado'
                                  ? 'red'
                                  : 'gray'
                              }
                              fontSize="xs"
                              px={2}
                              py={1}
                              borderRadius="6px"
                              textTransform="none"
                              fontWeight="500"
                            >
                              {item.status}
                            </Badge>
                          </Td>
                          <Td px={4} color="#131D53" fontSize="sm">
                            {item.totalSales}
                          </Td>
                          <Td
                            px={4}
                            color="#131D53"
                            fontSize="sm"
                            fontWeight="medium"
                          >
                            {item.totalCommissions}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>

              {meta && (
                <>
                  <Flex
                    justify="flex-end"
                    px={3}
                    display={{ base: 'flex', md: 'none' }}
                  >
                    <Text fontSize="xs" color="#131D5399">
                      Mostrando{' '}
                      {meta
                        ? `${
                            (meta.current_page - 1) * meta.pagesize + 1
                          }-${Math.min(
                            meta.current_page * meta.pagesize,
                            meta.total_items
                          )} de ${meta.total_items}`
                        : filteredData.length}{' '}
                      registros
                    </Text>
                  </Flex>

                  <Flex
                    justify="space-between"
                    align="center"
                    display={{ base: 'none', md: 'flex' }}
                  >
                    <Text fontSize="sm" pl={3} color="#131D5399">
                      Mostrando{' '}
                      {meta
                        ? `${
                            (meta.current_page - 1) * meta.pagesize + 1
                          }-${Math.min(
                            meta.current_page * meta.pagesize,
                            meta.total_items
                          )} de ${meta.total_items}`
                        : filteredData.length}{' '}
                      registros
                    </Text>

                    {meta.last_page > 1 && (
                      <Pagination
                        currentPage={meta.current_page}
                        totalPages={meta.last_page}
                        onPageChange={setCurrentPage}
                        isLoading={loading}
                        align="flex-end"
                      />
                    )}
                  </Flex>

                  {meta.last_page > 1 && (
                    <Box display={{ base: 'block', md: 'none' }}>
                      <Pagination
                        currentPage={meta.current_page}
                        totalPages={meta.last_page}
                        onPageChange={setCurrentPage}
                        isLoading={loading}
                        align="center"
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </PageContent>
      </AppLayout>
    </>
  )
}
