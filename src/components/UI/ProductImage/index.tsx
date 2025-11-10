'use client'

import { useState } from 'react'
import { Box } from '@chakra-ui/react'

interface ProductImageProps {
  src?: string | null
  alt?: string
  className?: string
  fallbackSrc?: string
  width?: string | number
  height?: string | number
  maxHeight?: string
  maxWidth?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
}

export function ProductImage({
  src,
  alt = 'Produto',
  className = '',
  fallbackSrc = '/assets/no-image.png',
  width = 'auto',
  height = 'auto',
  maxHeight,
  maxWidth,
  objectFit = 'contain',
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false)

  // Verificar se deve usar fallback antes de renderizar
  const shouldUseFallback = !src || src.trim() === '' || hasError

  const handleError = () => {
    setHasError(true)
  }

  return (
    <Box
      as="img"
      src={shouldUseFallback ? fallbackSrc : src}
      alt={shouldUseFallback ? 'Imagem não disponível' : alt}
      className={className}
      onError={shouldUseFallback ? undefined : handleError}
      style={{
        width,
        height,
        maxHeight,
        maxWidth,
        objectFit,
        display: 'block',
      }}
    />
  )
}
