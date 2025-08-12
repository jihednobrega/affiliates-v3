import { AppLayout } from '@/components/AppLayout'
import { PageHeader, PageContent } from '@/components/PageHeader'
import Head from 'next/head'
import Image from 'next/image'
import { Flex, Text } from '@chakra-ui/react'
import { Info } from 'lucide-react'

export default function Support() {
  return (
    <>
      <Head>
        <title>Suporte | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Flex gap={2} align="center">
            <Info size={24} color="#131D53" />
            <Text fontSize="sm" color="#131D53">
              Suporte
            </Text>
          </Flex>
        </PageHeader>

        <PageContent>Em breve, página de Suporte...</PageContent>
      </AppLayout>
    </>
  )
}
