import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import Head from 'next/head'
import { Box, Flex, Text } from '@chakra-ui/react'
import { SettingsCogIcon } from '@/components/Icons'

export default function Settings() {
  return (
    <>
      <Head>
        <title>Configurações | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Flex gap={2} align="center">
            <SettingsCogIcon boxSize={6} color="#131D53" />
            <Text fontSize="sm" color="#131D53">
              Configurações
            </Text>
          </Flex>
          <Box h="34px" />
        </PageHeader>

        <PageContent>Em breve, página de Ajustes...</PageContent>
      </AppLayout>
    </>
  )
}
