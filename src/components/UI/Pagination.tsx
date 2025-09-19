import { Box, HStack, Button } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  align?: 'center' | 'flex-end' | 'flex-start' | { base?: string; md?: string }
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  align = { base: 'center', md: 'flex-end' },
}: PaginationProps) {
  if (totalPages <= 1) return null

  const generatePages = () => {
    const pages: (number | string)[] = []

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...')
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          '...',
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        )
      } else {
        pages.push(
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages
        )
      }
    }

    return pages
  }

  const pages = generatePages()

  return (
    <HStack justify={align} spacing={2} px={3} pt={3} pb={1}>
      <Button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        isDisabled={currentPage <= 1 || isLoading}
        bg="transparent"
        border="none"
        borderRadius="6px"
        px={2.5}
        py={2.5}
        minW="auto"
        h="auto"
        fontSize="12px"
        fontWeight={500}
        lineHeight="140%"
        fontFamily="Geist"
        color="#131D53"
        gap={1}
        _hover={{
          bg: 'transparent',
        }}
        _disabled={{
          opacity: 0.5,
          cursor: 'not-allowed',
        }}
      >
        <ChevronLeft size={16} />
        Ant.
      </Button>

      <HStack spacing={2}>
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <Box
                key={`ellipsis-${index}`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                px={3}
                py={2.5}
              >
                <MoreHorizontal size={16} color="#131D53" />
              </Box>
            )
          }

          const isActive = page === currentPage
          return (
            <Button
              key={page}
              onClick={() => onPageChange(page as number)}
              isDisabled={isLoading}
              w="32px"
              h="32px"
              minW="32px"
              px={3}
              py={2.5}
              borderRadius="6px"
              fontSize="12px"
              fontWeight={500}
              lineHeight="140%"
              fontFamily="Geist"
              color="#131D53"
              bg={isActive ? undefined : '#EEF2FD'}
              bgGradient={
                isActive
                  ? 'linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)'
                  : undefined
              }
              shadow={
                isActive
                  ? '0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset'
                  : undefined
              }
              border={isActive ? undefined : 'none'}
              _hover={{
                bg: isActive ? undefined : '#C8E4FF99',
              }}
              _disabled={{
                opacity: 0.5,
                cursor: 'not-allowed',
              }}
            >
              {page}
            </Button>
          )
        })}
      </HStack>

      <Button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        isDisabled={currentPage >= totalPages || isLoading}
        bg="transparent"
        border="none"
        borderRadius="6px"
        px={2.5}
        py={2.5}
        minW="auto"
        h="auto"
        fontSize="12px"
        fontWeight={500}
        lineHeight="140%"
        fontFamily="Geist"
        color="#131D53"
        gap={1}
        _hover={{
          bg: 'transparent',
        }}
        _disabled={{
          opacity: 0.5,
          cursor: 'not-allowed',
        }}
      >
        Próx.
        <ChevronRight size={16} />
      </Button>
    </HStack>
  )
}
