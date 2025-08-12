import Image from 'next/image'
import {
  Box,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from '@chakra-ui/react'
import { NavigationContent } from './NavigationContent'
import { NavigationProps } from './types'

export function Navigation({
  isMobile = false,
  isOpen = false,
  onClose,
}: NavigationProps) {
  const handleClose = () => {
    try {
      onClose?.()
    } catch (error) {
      console.error('Error closing navigation:', error)
    }
  }

  if (!isMobile) {
    return <NavigationContent onClose={onClose} />
  }

  return (
    <Drawer
      isOpen={isOpen}
      placement="left"
      onClose={handleClose}
      key="navigation-drawer"
    >
      <DrawerOverlay />
      <DrawerContent
        maxW={286}
        w="full"
        h="full"
        overflowY="auto"
        borderTopRightRadius={24}
        borderBottomRightRadius={24}
      >
        <DrawerHeader borderBottomWidth="1px">
          <Box>
            <Box h={45} />
            <Image
              src="/assets/affiliates-logo.svg"
              alt="affiliates logo"
              width={186}
              height={42}
            />
          </Box>
        </DrawerHeader>
        <DrawerBody p={0}>
          <NavigationContent onClose={onClose} />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export type {
  NavigationProps,
  NavigationItem,
  NavigationSection,
} from './types'
