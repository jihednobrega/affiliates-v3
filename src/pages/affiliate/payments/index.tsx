import { AppLayout } from '@/components/AppLayout'
import { PageHeader, PageContent } from '@/components/PageHeader'
import Head from 'next/head'
import { Box, Flex, Text } from '@chakra-ui/react'
import { BadgeDollarSign } from 'lucide-react'

export default function Settings() {
  return (
    <>
      <Head>
        <title>Meus Pagamentos | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Flex gap={2} align="center">
            <BadgeDollarSign size={24} color="#131D53" />

            <Text fontSize="sm" color="#131D53">
              Meus Pagamentos
            </Text>
          </Flex>
          <Box h="34px" />
        </PageHeader>

        <PageContent>Em breve, página de Pagamentos...</PageContent>
      </AppLayout>
    </>
  )
}
