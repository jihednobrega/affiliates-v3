'use client'

import { ReactNode, useLayoutEffect, useRef, useState } from 'react'
import { Box } from '@chakra-ui/react'

interface PageHeaderProps {
  children: ReactNode
}

interface PageContentProps {
  children: ReactNode
  headerHeight?: number
}

export function PageHeader({ children }: PageHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const newHeight = headerRef.current.offsetHeight

        const event = new CustomEvent('pageHeaderResize', {
          detail: { height: newHeight },
        })
        window.dispatchEvent(event)
      }
    }

    updateHeight()

    const resizeObserver = new ResizeObserver(updateHeight)
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <Box
      ref={headerRef}
      borderBottomWidth={1}
      borderBottomColor="#c8d4e6"
      bg="white"
      p={4}
      display="flex"
      justifyContent="space-between"
      position="fixed"
      roundedTopEnd={12}
      roundedTopStart={{ base: 12, lg: 0 }}
      top={16}
      left={{ base: 0, lg: '240px' }}
      right={0}
      zIndex={10}
    >
      {children}
    </Box>
  )
}

export function PageContent({ children }: PageContentProps) {
  const [headerHeight, setHeaderHeight] = useState(0)

  useLayoutEffect(() => {
    const handleHeaderResize = (event: CustomEvent) => {
      setHeaderHeight(event.detail.height)
    }

    window.addEventListener(
      'pageHeaderResize',
      handleHeaderResize as EventListener
    )

    return () => {
      window.removeEventListener(
        'pageHeaderResize',
        handleHeaderResize as EventListener
      )
    }
  }, [])

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2.5}
      p={3}
      mt={`${headerHeight}px`}
    >
      {children}
    </Box>
  )
}
