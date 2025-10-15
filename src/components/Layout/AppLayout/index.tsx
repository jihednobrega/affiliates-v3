'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Box, Grid, useDisclosure } from '@chakra-ui/react'
import { Header } from '../Header'
import { Navigation } from '../Navigation'
import { NavBar } from '../NavBar'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [isClient, setIsClient] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const mediaQuery = window.matchMedia('(min-width: 992px)')
    const updateIsDesktop = () => setIsDesktop(mediaQuery.matches)
    updateIsDesktop()
    mediaQuery.addEventListener('change', updateIsDesktop)

    return () => {
      mediaQuery.removeEventListener('change', updateIsDesktop)
    }
  }, [])

  return (
    <Grid
      templateAreas={{
        base: `'header' 'main' 'navbar'`,
        lg: `'header header' 'sidebar main'`,
      }}
      templateColumns={{ base: '1fr', lg: '240px 1fr' }}
      templateRows={{ base: 'auto 1fr auto', lg: 'auto 1fr' }}
      minH="100vh"
      bg="#EEF2FD"
      pb={{ base: '92px', lg: 0 }}
    >
      <Box
        gridArea="header"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={10}
      >
        <Header onOpen={onOpen} />
      </Box>

      {isClient && isDesktop && (
        <Box
          gridArea="sidebar"
          position="fixed"
          top={16}
          left={0}
          bottom={0}
          w="240px"
          zIndex={10}
          borderRightWidth={1}
          roundedTopLeft={{ base: 0, lg: 12 }}
          overflow={'hidden'}
        >
          <Navigation isMobile={false} />
        </Box>
      )}

      <Box gridArea="main" mt={16} overflowY="auto">
        {children}
      </Box>

      {isClient && !isDesktop && (
        <>
          <Box gridArea="navbar">
            <NavBar />
          </Box>
          <Navigation isMobile={true} isOpen={isOpen} onClose={onClose} />
        </>
      )}
    </Grid>
  )
}
