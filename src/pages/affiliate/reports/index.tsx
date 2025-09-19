import { AppLayout } from '@/components/Layout'
import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import Head from 'next/head'
import { Box, Flex, Text } from '@chakra-ui/react'
import { CustomBarIcon } from '@/components/Icons'

export default function Settings() {
  return (
    <>
      <Head>
        <title>Relatórios | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Flex gap={2} align="center">
            <CustomBarIcon boxSize={6} color="#131D53" />
            <Text fontSize="sm" color="#131D53">
              Relatórios
            </Text>
          </Flex>
          <Box h="34px" />
        </PageHeader>

        <PageContent>Em breve, página de Relatórios...</PageContent>
      </AppLayout>
    </>
  )
}
