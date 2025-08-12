import { useState } from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Image,
  Flex,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Portal,
} from '@chakra-ui/react'
import {
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Ellipsis,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { RankingProduct } from '@/services/types/dashboard.types'
import { ShimmerBadge } from '@/components/ShimmerBadge'

type ColumnKey = keyof RankingProduct | 'index'

interface ProductTableProps {
  data: RankingProduct[]
}

export function ProductTable({ data }: ProductTableProps) {
  const [sortKey, setSortKey] = useState<ColumnKey>('index')
  const [sortAsc, setSortAsc] = useState(true)
  const toast = useToast()

  const limitedData = data.slice(0, 5)

  const handleCopyLink = async (product: RankingProduct) => {
    try {
      if (product.short_url) {
        await navigator.clipboard.writeText(product.short_url)
        toast({
          title: 'Link copiado!',
          description:
            'O link do produto foi copiado para a área de transferência.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'Erro',
          description: 'Link do produto não encontrado.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Erro ao copiar link:', error)
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleViewProduct = (product: RankingProduct) => {
    if (product.url) {
      window.open(product.url, '_blank', 'noopener,noreferrer')
    } else {
      toast({
        title: 'Erro',
        description: 'URL do produto não encontrada.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleSort = (key: ColumnKey) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const sortedData = [...limitedData].sort((a, b) => {
    if (sortKey === 'index') {
      const aIndex = limitedData.indexOf(a)
      const bIndex = limitedData.indexOf(b)
      return sortAsc ? aIndex - bIndex : bIndex - aIndex
    }

    const aValue = a[sortKey]
    const bValue = b[sortKey]

    if (aValue === undefined && bValue === undefined) return 0
    if (aValue === undefined) return 1
    if (bValue === undefined) return -1

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortAsc ? aValue - bValue : bValue - aValue
    }
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortAsc
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    return 0
  })

  return (
    <TableContainer>
      <Table
        variant="simple"
        className="w-full border-collapse rounded-md shadow"
        sx={{
          td: {
            borderBottom: 'none',
          },
        }}
      >
        <Thead>
          <Tr>
            <ThSortable
              title="Nome"
              column="name"
              sortKey={sortKey}
              sortAsc={sortAsc}
              onClick={handleSort}
            />
            <ThSortable
              title="Valor"
              column="price"
              sortKey={sortKey}
              sortAsc={sortAsc}
              onClick={handleSort}
            />
            <ThSortable
              title="Comissão"
              column="commission"
              sortKey={sortKey}
              sortAsc={sortAsc}
              onClick={handleSort}
            />
            <ThSortable
              title="Receita Gerada"
              column="revenue"
              sortKey={sortKey}
              sortAsc={sortAsc}
              onClick={handleSort}
            />
            <Th />
          </Tr>
        </Thead>
        <Tbody className="text-xs">
          {sortedData.map((item, i) => (
            <Tr
              key={i}
              _hover={{ bg: '#F3F6FA' }}
              borderTop="1px solid #DEE6F2"
              _first={{ borderTop: 'none' }}
            >
              <Td px={4} maxW="230px">
                <Flex align="center" gap={2.5}>
                  <Box
                    w="32px"
                    h="32px"
                    border="1px solid #E6E6E6"
                    rounded="base"
                    overflow="hidden"
                    bg="white"
                    className="flex items-center justify-center"
                    flexShrink={0}
                  >
                    <Image src={item.image} alt={item.name} h="32px" />
                  </Box>
                  <Text
                    noOfLines={1}
                    color="#131D53"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    maxW="275px"
                  >
                    {item.name}
                  </Text>
                </Flex>
              </Td>
              <Td px={4}>
                <Text textColor="#131D53">
                  R${' '}
                  {Number(item.price).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </Td>
              <Td px={4}>
                <ShimmerBadge
                  icon={
                    item.commission >= 20
                      ? '/assets/icons/extra-commission.svg'
                      : '/assets/icons/commission.svg'
                  }
                  percentage={`${item.commission}%`}
                />
              </Td>
              <Td px={4} textColor="#131D53">
                R${' '}
                {(
                  Math.floor(
                    ((Number(item.price) * Number(item.commission)) / 100) *
                      100,
                  ) / 100
                ).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Td>

              <Td px={4} textColor="#131D53">
                <Box className="absolute w-[86px] h-15 right-0 bg-button-white-gradient flex items-center justify-end -translate-y-1/2 mr-[1px]">
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
                      _hover={{ bg: 'linear-gradient(to-r, #61abc9, #1f39c4)' }}
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
                          icon={<Copy size={16} />}
                          onClick={() => handleCopyLink(item)}
                          fontSize="sm"
                          _hover={{ bg: 'gray.100' }}
                        >
                          Copiar Link
                        </MenuItem>
                        <MenuItem
                          icon={<ExternalLink size={16} />}
                          onClick={() => handleViewProduct(item)}
                          fontSize="sm"
                          _hover={{ bg: 'gray.100' }}
                        >
                          Ver Produto
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
  )
}

interface ThProps {
  title: string
  column: ColumnKey
  sortKey: ColumnKey
  sortAsc: boolean
  onClick: (key: ColumnKey) => void
}

function ThSortable({ title, column, sortKey, sortAsc, onClick }: ThProps) {
  const isActive = sortKey === column
  const Icon = !isActive ? ChevronsUpDown : sortAsc ? ChevronUp : ChevronDown

  return (
    <Th
      px={4}
      onClick={() => onClick(column)}
      cursor="pointer"
      _hover={{ bg: '#F9FAFB', color: '#131d53' }}
      whiteSpace="nowrap"
      fontSize="xs"
      textTransform="none"
      fontWeight="normal"
    >
      <Flex align="center" gap={2.5}>
        {title}
        <Box as={Icon} w={4} h={4} color="#131d5399" />
      </Flex>
    </Th>
  )
}
