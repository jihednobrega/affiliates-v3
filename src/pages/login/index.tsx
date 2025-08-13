import {
  Box,
  Flex,
  Heading,
  Button,
  Checkbox,
  Link,
  Text,
  useToast,
  Stack,
  Input,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import Head from 'next/head'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AuthSigninRequest } from '@/services/types/auth.types'

export default function Login() {
  const { signin, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const toast = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const values: AuthSigninRequest = { email, password }

    signin(values, {
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || 'Erro ao fazer login'
        setError(errorMessage)
        toast({
          title: 'Erro no login',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      },
      onSuccess: () => {
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Redirecionando...',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      },
    })
  }

  return (
    <>
      <Head>
        <title>Login | Affiliates</title>
      </Head>
      <Box
        bg="#021165"
        h={{ base: 12, lg: '72px' }}
        display="flex"
        alignItems="center"
        p={2}
      >
        <img src="/assets/affiliates.svg" alt="affiliates logo" />
      </Box>
      <Box
        as="main"
        width="full"
        height="calc(100vh - 72px)"
        display="flex"
        justifyContent="center"
        flexDirection="column"
        padding={6}
        bg="white"
      >
        <Flex
          width={{ base: 'full', md: '400px' }}
          maxWidth="400px"
          mt={{ lg: '60px' }}
          mb="auto"
          mx="auto"
          justifyContent="center"
        >
          <Stack as="form" width="full" spacing={4} onSubmit={handleSubmit}>
            <Stack px={2} width="full" spacing={2}>
              <Heading fontSize="2xl" color="#131D53">
                Entrar
              </Heading>
              <Text fontSize="sm" color="#131D5399">
                Digite seu e-mail e senha para iniciar sessão
              </Text>
            </Stack>

            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <Input
              bg="white"
              type="email"
              placeholder="Digite seu e-mail cadastrado"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              bg="white"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              pb={6}
            >
              <Checkbox size="sm">Salvar meus dados</Checkbox>

              <Link
                as="button"
                type="button"
                title="Esqueci minha senha"
                color="blue.500"
                fontWeight={400}
                padding={0}
                fontSize="sm"
              >
                Esqueci minha senha
              </Link>
            </Stack>

            <Button
              type="submit"
              transition="bottom 1.2s cubic-bezier(0.645, 0.045, 0.355, 1.000) 0.3s"
              fontWeight={600}
              color="#fff"
              bgGradient="linear-gradient(180deg, #559DFF -27.08%, #1854DD 123.81%)"
              shadow="0px 0px 0px 1px #0055F4, 0px -1px 0px 0px rgba(0, 56, 169, 0.30) inset, 0px 1px 1px 0px rgba(255, 255, 255, 0.60) inset"
              _hover={{
                bgGradient:
                  'linear-gradient(180deg, #1854DD -27.08%, #1854DD 123.81%)',
              }}
              isLoading={isLoading}
              loadingText="Entrando..."
            >
              Entrar
            </Button>
          </Stack>
        </Flex>
      </Box>
    </>
  )
}
