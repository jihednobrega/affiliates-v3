import { Box, VStack, Text, Button, Alert } from '@chakra-ui/react'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { COLORS } from '@/constants/colors'

interface ErrorStateProps {
  title?: string
  description: string
  onRetry?: () => void
  type?: 'error' | 'warning' | 'network'
  size?: 'sm' | 'md' | 'lg'
}

export const ErrorState = ({
  title,
  description,
  onRetry,
  type = 'error',
  size = 'md',
}: ErrorStateProps) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: RefreshCw,
          defaultTitle: 'Problema de Conexão',
          color: 'orange.500',
          bgColor: 'orange.50',
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          defaultTitle: 'Aviso',
          color: 'yellow.500',
          bgColor: 'yellow.50',
        }
      default:
        return {
          icon: AlertTriangle,
          defaultTitle: 'Erro ao Carregar',
          color: 'red.500',
          bgColor: 'red.50',
        }
    }
  }

  const config = getErrorConfig()
  const Icon = config.icon

  const containerPadding = {
    sm: 6,
    md: 8,
    lg: 10,
  } as const

  const titleSizes = {
    sm: 'md',
    md: 'lg',
    lg: 'xl',
  } as const

  return (
    <Box py={containerPadding[size]}>
      <Alert
        status="error"
        borderRadius="lg"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        minH="200px"
        bg={config.bgColor}
        borderColor={config.color}
        borderWidth="1px"
      >
        <VStack spacing={4}>
          <Box
            w="48px"
            h="48px"
            bg="white"
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            shadow="sm"
          >
            <Icon size={24} color={config.color} />
          </Box>

          <VStack spacing={2}>
            <Text
              fontSize={titleSizes[size]}
              fontWeight="600"
              color={COLORS.PRIMARY}
            >
              {title || config.defaultTitle}
            </Text>
            <Text
              fontSize="sm"
              color={COLORS.PRIMARY_OPACITY}
              maxW="400px"
              lineHeight="1.5"
            >
              {description}
            </Text>
          </VStack>

          {onRetry && (
            <Button
              leftIcon={<RefreshCw size={16} />}
              onClick={onRetry}
              variant="outline"
              colorScheme="blue"
              size="sm"
            >
              Tentar Novamente
            </Button>
          )}
        </VStack>
      </Alert>
    </Box>
  )
}
