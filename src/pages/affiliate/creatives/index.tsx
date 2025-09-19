import { PageHeader, PageContent } from '@/components/Layout/PageLayout'
import Head from 'next/head'
import { Flex, Text } from '@chakra-ui/react'
import { Star } from 'lucide-react'
import { AppLayout } from '@/components/Layout'

export default function Creatives() {
  return (
    <>
      <Head>
        <title>Criativos | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Flex gap={2} align="center">
            <Star size={24} color="#131D53" />

            <Text fontSize="sm" color="#131D53">
              Criativos
            </Text>
          </Flex>
        </PageHeader>

        <PageContent>Em breve, página de Criativos...</PageContent>
      </AppLayout>
    </>
  )
}
