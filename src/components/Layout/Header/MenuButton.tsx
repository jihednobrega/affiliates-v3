import { AlignJustify } from 'lucide-react'
import { IconButton } from '@chakra-ui/react'

interface MenuButtonProps {
  onOpen: () => void
}

export function MenuButton({ onOpen }: MenuButtonProps) {
  return (
    <IconButton
      aria-label="Abrir menu"
      icon={<AlignJustify size={20} color="#131d53" />}
      justifyContent="center"
      onClick={onOpen}
      display={{ base: 'flex', lg: 'none' }}
      borderWidth={1}
      borderColor="#96C5FF"
      bgGradient="linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)"
      shadow="0px 0px 0px 1px #99c7ff inset, 0px 0px 0px 2px #fff inset"
      rounded={8}
      h={8}
      py={1.5}
      px={3}
    />
  )
}
