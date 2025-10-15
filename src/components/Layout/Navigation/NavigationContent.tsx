'use client'

import {
  LayoutDashboard,
  Link as LinkIcon,
  Megaphone,
  Info,
  BadgeDollarSign,
  GraduationCap,
  Network,
  PackageSearch,
  Users,
  Package,
  Ticket,
  Trophy,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Box, VStack, Skeleton, Stack } from '@chakra-ui/react'
import { NavigationSection } from './NavigationSection'
import { NavigationSection as NavigationSectionType } from './types'
import { useAuth } from '@/hooks/useAuth'

interface NavigationContentProps {
  onClose?: () => void
}

export function NavigationContent({ onClose }: NavigationContentProps) {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  const affiliateSections: NavigationSectionType[] = [
    {
      label: 'Gestão',
      items: [
        {
          label: 'Painel Geral',
          href: '/affiliate/dashboard/',
          icon: LayoutDashboard,
        },
        {
          label: 'Meus Links',
          href: '/affiliate/hotlinks/',
          icon: LinkIcon,
        },
        {
          label: 'Produtos',
          href: '/affiliate/products/',
          icon: PackageSearch,
        },
        {
          label: 'Campanhas',
          href: '/affiliate/campaigns/',
          icon: Megaphone,
        },
        {
          label: 'Minha Rede',
          href: '/affiliate/network/',
          icon: Network,
        },
      ].filter((item) => {
        if (item.href === '/affiliate/network/' && !user?.canHaveReferrals) {
          return false
        }
        return true
      }),
    },
    {
      label: 'Central do Afiliado',
      items: [
        {
          label: 'Affiliates Academy',
          href: '/affiliate/academy/',
          icon: GraduationCap,
        },
      ],
    },
    {
      label: 'Finanças',
      items: [
        {
          label: 'Meus Pagamentos',
          href: '/affiliate/payments/',
          icon: BadgeDollarSign,
        },
      ],
    },
    {
      label: 'Ajuda',
      items: [{ label: 'Suporte', href: '/affiliate/support/', icon: Info }],
    },
  ]

  const brandSections: NavigationSectionType[] = [
    {
      label: 'Gestão',
      items: [
        {
          label: 'Meu Painel',
          href: '/brand/dashboard/',
          icon: LayoutDashboard,
        },
        {
          label: 'Meus Produtos',
          href: '/brand/products/',
          icon: Package,
        },
        {
          label: 'Minhas Campanhas',
          href: '/brand/campaigns/',
          icon: Megaphone,
        },
        {
          label: 'Meus Afiliados',
          href: '/brand/affiliates/',
          icon: Users,
        },
        {
          label: 'Ranking de Afiliados',
          href: '/brand/ranking/',
          icon: Trophy,
        },
        {
          label: 'Cupons',
          href: '/brand/coupons/',
          icon: Ticket,
        },
      ],
    },
    {
      label: 'Finanças',
      items: [
        {
          label: 'Financeiro',
          href: '/brand/finances/',
          icon: BadgeDollarSign,
        },
      ],
    },
    {
      label: 'Ajuda',
      items: [
        {
          label: 'Suporte',
          href: '/brand/support/',
          icon: Info,
        },
      ],
    },
  ]

  const sections =
    user?.role === 'brand' || user?.role === 'agent' || user?.role === 'seller'
      ? brandSections
      : affiliateSections

  if (isLoading) {
    return (
      <Box bg="white" w="full" h="full" maxW="286px">
        <VStack spacing={8} p={4} pb={10} align="stretch">
          {[1, 2, 3, 4].map((i) => (
            <Stack key={i} spacing={2}>
              <Skeleton height="16px" width="80px" mb={2} />
              <Skeleton height="40px" width="full" />
              <Skeleton height="40px" width="full" />
              <Skeleton height="40px" width="full" />
            </Stack>
          ))}
        </VStack>
      </Box>
    )
  }

  return (
    <Box bg="white" w="full" h="full" maxW="286px">
      <VStack spacing={8} p={4} pb={10} align="stretch">
        {sections.map((section) => (
          <NavigationSection
            key={section.label}
            label={section.label}
            items={section.items}
            pathname={pathname}
            onClose={onClose}
          />
        ))}
      </VStack>
    </Box>
  )
}
