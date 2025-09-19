import { Box, Flex, Icon, Text } from '@chakra-ui/react'

export function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ElementType
  label: string
  active?: boolean
}) {
  return (
    <Flex w="68px" direction="column" align="center" gap={1} py={1}>
      <Box>
        <Icon as={icon} boxSize={6} color={active ? '#5898ff' : '#9298b5'} />
      </Box>
      <Text
        fontSize="xs"
        fontWeight="medium"
        color={active ? '#5898ff' : '#9298b5'}
      >
        {label}
      </Text>
    </Flex>
  )
}
