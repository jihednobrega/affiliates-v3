'use client'

import { CreateLinkDrawer } from '../CreateLinkModal/CreateLinkDrawer'
import { CreateLinkButton } from '../CreateLinkModal/CreateLinkButton'
import { Flex, useDisclosure } from '@chakra-ui/react'
import { NavItem } from './NavItem'
import { House } from 'lucide-react'
import { SettingsCogIcon, LinkEditIcon, CustomBarIcon } from '../CustomIcons'
import { usePathname } from 'next/navigation'
import NextLink from 'next/link'

const navItems = [
  { label: 'Início', icon: House, href: '/affiliate/dashboard/' },
  { label: 'Meus Links', icon: LinkEditIcon, href: '/affiliate/hotlinks/' },
  { label: 'Relatórios', icon: CustomBarIcon, href: '/affiliate/reports/' },
  { label: 'Ajustes', icon: SettingsCogIcon, href: '/affiliate/settings/' },
]

export function NavBar() {
  const pathname = usePathname()
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Flex
        w="100%"
        maxW="414px"
        justifySelf="center"
        h="92px"
        bg="white"
        px={3}
        pt={3}
        pb={4}
        position="fixed"
        bottom={0}
        zIndex={10}
        borderTop="1px solid #dee6f2"
        borderX="1px solid #dee6f2"
        borderTopLeftRadius="18px"
        borderTopRightRadius="18px"
        justify="space-between"
        align="center"
        gap={2}
      >
        {navItems.slice(0, 2).map((item) => (
          <NextLink href={item.href} key={item.href} passHref>
            <NavItem
              icon={item.icon}
              label={item.label}
              active={
                pathname?.startsWith(item.href.replace(/\/$/, '')) ?? false
              }
            />
          </NextLink>
        ))}
        <CreateLinkButton onClick={onOpen} />
        {navItems.slice(2).map((item) => (
          <NextLink href={item.href} key={item.href} passHref>
            <NavItem
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
            />
          </NextLink>
        ))}
      </Flex>
      <CreateLinkDrawer isOpen={isOpen} onClose={onClose} />
    </>
  )
}
