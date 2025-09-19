import { GetOrderEvolutionResponse } from '@/services/types/dashboard.types'

type SummaryItem = {
  label: string;
  value: string | number;
};

interface OrdersSummaryProps {
  ordersData?: GetOrderEvolutionResponse['data'];
}

export function OrdersSummary({ ordersData }: OrdersSummaryProps) {
  const summaryData: SummaryItem[] = [
    { label: "Concluídos", value: ordersData?.done || 0 },
    { label: "Em Processamento", value: ordersData?.processing || 0 },
    { label: "Pagamentos Aprovados", value: ordersData?.approved || 0 },
    { label: "Aguardando", value: ordersData?.awaiting || 0 },
    { label: "Novos", value: ordersData?.new || 0 },
    { label: "Cancelados", value: ordersData?.canceled || 0 },
  ];
  return (
    <div className="border border-[#dee6f2] rounded-md">
      {summaryData.map((item, index) => (
        <div
          key={index}
          className="max-h-[38px] flex items-center justify-between py-3 not-first:border-t not-first:border-t-[#dee6f2]"
        >
          <span className="text-xs text-[#131d5399] pl-4">{item.label}</span>
          <span className="text-sm text-[#131d53] pr-4">
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
