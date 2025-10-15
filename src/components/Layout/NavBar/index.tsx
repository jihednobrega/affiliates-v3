'use client'

import { CreateLinkDrawer } from '@/components/Features/affiliate/links'
import { Flex, useDisclosure } from '@chakra-ui/react'
import { NavItem } from './NavItem'
import {
  House,
  User,
  Megaphone,
  PackageSearch,
  Users,
  BadgeDollarSign,
  Package,
  Trophy,
} from 'lucide-react'
import { LinkEditIcon } from '@/components/Icons'
import { usePathname } from 'next/navigation'
import NextLink from 'next/link'
import { useAuth } from '@/hooks/useAuth'

const affiliateNavItems = [
  { label: 'Início', icon: House, href: '/affiliate/dashboard/' },
  { label: 'Meus Links', icon: LinkEditIcon, href: '/affiliate/hotlinks/' },
  { label: 'Produtos', icon: PackageSearch, href: '/affiliate/products/' },
  { label: 'Campanhas', icon: Megaphone, href: '/affiliate/campaigns/' },
  { label: 'Meu Perfil', icon: User, href: '/affiliate/profile/' },
]

const brandNavItems = [
  { label: 'Início', icon: House, href: '/brand/dashboard/' },
  { label: 'Produtos', icon: Package, href: '/brand/products/' },
  { label: 'Afiliados', icon: Users, href: '/brand/affiliates/' },
  { label: 'Ranking', icon: Trophy, href: '/brand/ranking/' },
  { label: 'Financeiro', icon: BadgeDollarSign, href: '/brand/finances/' },
]

export function NavBar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { isOpen, onClose } = useDisclosure()

  const navItems =
    user?.role === 'brand' || user?.role === 'agent' || user?.role === 'seller'
      ? brandNavItems
      : affiliateNavItems

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
