'use client'

import { ProductTable } from './ProductTable'
import { useDashboard } from '@/hooks/useDashboard'
import { Spinner, Box, Text } from '@chakra-ui/react'
import { ShimmerBadge } from '@/components/ShimmerBadge'

export default function Ranking() {
  const { productsData, isLoadingProducts, productsError, hasProductsData } =
    useDashboard()

  if (isLoadingProducts) {
    return (
      <div className="flex flex-col gap-3 p-3 pb-4 border border-[#dee6f2] bg-white rounded-xl overflow-hidden container-shadow">
        <h2 className="text-sm text-[#131d53] px-3">Meu Ranking</h2>
        <Box display="flex" justifyContent="center" py={8}>
          <Spinner size="lg" color="blue.500" />
        </Box>
      </div>
    )
  }

  if (productsError) {
    return (
      <div className="flex flex-col gap-3 p-3 pb-4 border border-[#dee6f2] bg-white rounded-xl overflow-hidden container-shadow">
        <h2 className="text-sm text-[#131d53] px-3">Meu Ranking</h2>
        <Box textAlign="center" py={8} color="red.500">
          <Text>Erro ao carregar produtos</Text>
        </Box>
      </div>
    )
  }

  if (!hasProductsData || productsData.length === 0) {
    return (
      <div className="flex flex-col gap-3 p-3 pb-4 border border-[#dee6f2] bg-white rounded-xl overflow-hidden container-shadow">
        <h2 className="text-sm text-[#131d53] px-3">Meu Ranking</h2>
        <Box textAlign="center" py={8} color="gray.500">
          <Text>Nenhum produto encontrado</Text>
        </Box>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-3 pb-4 border border-[#dee6f2] bg-white rounded-xl overflow-hidden container-shadow">
      <h2 className="text-sm text-[#131d53] px-3">Meu Ranking</h2>
      <div className="flex flex-col gap-6">
        <div className="overflow-hidden relative">
          <div className="border rounded-md border-[#DEE6F2] overflow-scroll ">
            <ProductTable data={productsData} />
          </div>
        </div>
        <div className="flex gap-5 px-3">
          <div className="flex items-center gap-2">
            <ShimmerBadge
              icon="/assets/icons/commission.svg"
              text=""
              percentage=""
            />
            <span className="text-xs text-[#131d5399]">Comissão</span>
          </div>
          <div className="flex items-center gap-2">
            <ShimmerBadge
              icon="/assets/icons/extra-commission.svg"
              text=""
              percentage=""
            />
            <span className="text-xs text-[#131d5399]">Comissão Extra</span>
          </div>
        </div>
      </div>
    </div>
  )
}
