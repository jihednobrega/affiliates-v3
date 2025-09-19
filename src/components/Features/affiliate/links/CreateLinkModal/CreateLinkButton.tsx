import { Icon, IconButton } from '@chakra-ui/react'
import { LinkAddIcon } from '@/components/Icons'

export function CreateLinkButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton
      aria-label="Novo link"
      onClick={onClick}
      icon={<Icon as={LinkAddIcon} boxSize={6} color="#001589" />}
      bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
      shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
      borderRadius="md"
      w="64px"
      h="40px"
      px={3}
    />
  )
}
