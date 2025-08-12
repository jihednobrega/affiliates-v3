'use client'

import {
  LayoutDashboard,
  Link as LinkIcon,
  Megaphone,
  Info,
  BadgeDollarSign,
  Star,
  Medal,
  GraduationCap,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Box, VStack } from '@chakra-ui/react'
import { NavigationSection } from './NavigationSection'
import { NavigationSection as NavigationSectionType } from './types'

interface NavigationContentProps {
  onClose?: () => void
}

export function NavigationContent({ onClose }: NavigationContentProps) {
  const pathname = usePathname()

  const sections: NavigationSectionType[] = [
    {
      label: 'Gestão',
      items: [
        {
          label: 'Painel Geral',
          href: '/affiliate/dashboard/',
          icon: LayoutDashboard,
        },
        {
          label: 'Meus Hot Links',
          href: '/affiliate/hotlinks/',
          icon: LinkIcon,
        },
        {
          label: 'Campanhas',
          href: '/affiliate/campaigns/',
          icon: Megaphone,
        },
      ],
    },
    {
      label: 'Central do Afiliado',
      items: [
        { label: 'Missões', href: '/affiliate/missions/', icon: Medal },
        {
          label: 'Affiliates Academy',
          href: '/affiliate/academy/',
          icon: GraduationCap,
        },
        { label: 'Criativos', href: '/affiliate/creatives/', icon: Star },
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

  return (
    <Box bg="white" w="full" h="full" maxW="286px">
      <VStack spacing={8} p={4} align="stretch">
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