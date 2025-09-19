import { useState } from 'react'
import {
  Box,
  Button,
  Input,
  Stack,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  Heading,
  VStack,
} from '@chakra-ui/react'
import { useAuth } from '@/hooks/useAuth'
import { AuthSigninRequest } from '@/services/types/auth.types'

export function LoginForm() {
  const { signin, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const values: AuthSigninRequest = { email, password }

    signin(values, {
      onError: (error: any) => {
        setError(error.response?.data?.message || 'Erro ao fazer login')
      },
      onSuccess: () => {
        console.log('Login realizado com sucesso!')
      },
    })
  }

  return (
    <Box
      maxWidth="400px"
      width="full"
      p={8}
      bg="background.card"
      borderRadius="md"
      boxShadow="card"
      borderWidth="1px"
      borderColor="border.primary"
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing={6}>
          <Heading size="lg" textAlign="center" color="text.primary">
            Entrar na sua conta
          </Heading>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <Stack spacing={4} width="full">
            <FormControl isRequired>
              <FormLabel color="text.primary">E-mail</FormLabel>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg="background.page"
                borderColor="border.primary"
                _hover={{ borderColor: 'primary.500' }}
                _focus={{
                  borderColor: 'primary.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
                }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color="text.primary">Senha</FormLabel>
              <Input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg="background.page"
                borderColor="border.primary"
                _hover={{ borderColor: 'primary.500' }}
                _focus={{
                  borderColor: 'primary.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
                }}
              />
            </FormControl>
          </Stack>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            width="full"
            isLoading={isLoading}
            loadingText="Entrando..."
            _loading={{
              cursor: 'not-allowed',
            }}
          >
            Entrar
          </Button>
        </VStack>
      </form>
    </Box>
  )
}
