import { ReactNode } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { theme } from '@/libs/chakraui'
import { queryClient } from '@/libs/react-query'
import { AuthProvider } from '@/context/AuthContext'

interface ProvidersProps {
  children: ReactNode
}

function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  )
}

export default Providers
