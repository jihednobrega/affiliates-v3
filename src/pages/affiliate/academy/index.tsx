import { AppLayout } from '@/components/AppLayout'
import { PageHeader, PageContent } from '@/components/PageHeader'
import Head from 'next/head'
import Image from 'next/image'
import { Flex, Text } from '@chakra-ui/react'
import { GraduationCap } from 'lucide-react'

export default function Academy() {
  return (
    <>
      <Head>
        <title>Affiliates Academy | Affiliates</title>
      </Head>
      <AppLayout>
        <PageHeader>
          <Flex gap={2} align="center">
            <GraduationCap size={24} color="#131D53" />
            <Text fontSize="sm" color="#131D53">
              Affiliates Academy
            </Text>
          </Flex>
        </PageHeader>

        <PageContent>Em breve, página de Affiliates Academy...</PageContent>
      </AppLayout>
    </>
  )
}
