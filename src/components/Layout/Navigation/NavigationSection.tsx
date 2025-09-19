import { Box, VStack, Text, Link, Icon } from '@chakra-ui/react'
import NextLink from 'next/link'
import { NavigationItem } from './types'

interface NavigationSectionProps {
  label: string
  items: NavigationItem[]
  pathname: string
  onClose?: () => void
}

export function NavigationSection({
  label,
  items,
  pathname,
  onClose,
}: NavigationSectionProps) {
  return (
    <Box>
      <Text
        fontSize="xs"
        color="#131d534d"
        fontWeight="medium"
        textTransform="uppercase"
        letterSpacing="0.48px"
        mb={4}
      >
        {label}
      </Text>
      <VStack as="ul" gap={1} align="stretch">
        {items.map(({ label, href, icon }) => {
          const isActive = pathname
            ? pathname.startsWith(href.replace(/\/$/, ''))
            : false
          return (
            <Box as="li" key={href} listStyleType="none">
              <NextLink href={href} passHref>
                <Link
                  display="flex"
                  alignItems="center"
                  gap="12px"
                  h="42px"
                  p="8px"
                  fontSize="sm"
                  fontWeight="medium"
                  borderRadius="8px"
                  border={
                    isActive ? '1px solid #DEE6F2' : '1px solid transparent'
                  }
                  bg={
                    isActive
                      ? 'linear-gradient(90deg, #EEF1FF 0%, #FFF 100%)'
                      : 'transparent'
                  }
                  boxShadow={
                    isActive ? '0px 1px 1px 0px rgba(0, 13, 53, 0.25)' : 'none'
                  }
                  color={isActive ? '#284AFF' : '#131d537f'}
                  _hover={{
                    textDecoration: 'none',
                    bg: isActive ? undefined : 'gray.50',
                  }}
                  onClick={onClose}
                >
                  <Icon
                    as={icon}
                    boxSize={5}
                    color={isActive ? '#284AFF' : '#131d537f'}
                  />
                  {label}
                </Link>
              </NextLink>
            </Box>
          )
        })}
      </VStack>
    </Box>
  )
}