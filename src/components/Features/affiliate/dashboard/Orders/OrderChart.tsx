'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'
import { GetOrderEvolutionResponse } from '@/services/types/dashboard.types'

const MONTH_NAMES = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
] as const

interface OrderChartProps {
  ordersData?: GetOrderEvolutionResponse['data']
  monthlyMetricsData?: Array<{
    month: string
    monthName: string
    clicks: number
    orders: number
    date: string
  }>
}

export function OrderChart({ monthlyMetricsData }: OrderChartProps) {
  const chartData = useMemo(() => {
    if (!monthlyMetricsData || monthlyMetricsData.length === 0) {
      return []
    }

    return monthlyMetricsData.map((monthData) => {
      const [year, month] = monthData.month.split('-')
      const monthIndex = parseInt(month) - 1
      const monthName = MONTH_NAMES[monthIndex]
      const shortYear = year.slice(-2)

      return {
        month: monthName,
        monthWithYear: `${monthName}/${shortYear}`,
        monthFull: monthData.monthName,
        clicks: monthData.clicks,
        orders: monthData.orders,
        date: monthData.date,
        gap: (monthData.clicks + monthData.orders) * 0.01,
      }
    })
  }, [monthlyMetricsData])

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 1000000

    const maxClicks = Math.max(...chartData.map((d) => d.clicks))
    const maxOrders = Math.max(...chartData.map((d) => d.orders))
    const overallMax = Math.max(maxClicks, maxOrders)

    if (overallMax === 0) return 10

    if (overallMax < 100) {
      const result = Math.ceil(overallMax / 5) * 5
      return Math.max(result, 5)
    }

    if (overallMax < 1000) {
      const result = Math.ceil(overallMax / 100) * 100
      return result
    }

    const magnitude = Math.pow(10, Math.floor(Math.log10(overallMax)))
    const normalized = overallMax / magnitude
    let roundedUp

    if (normalized <= 1) roundedUp = 1
    else if (normalized <= 2) roundedUp = 2
    else if (normalized <= 5) roundedUp = 5
    else roundedUp = 10

    const result = roundedUp * magnitude

    return result
  }, [chartData])

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(774)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const updateWidth = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth
          setContainerWidth(Math.max(width, 774))
        }
      }, 100)
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => {
      window.removeEventListener('resize', updateWidth)
      clearTimeout(timeoutId)
    }
  }, [])

  const dynamicBarSize = useMemo(() => {
    const totalMonths = chartData.length
    if (totalMonths === 0) return 24

    const totalSpacing = (totalMonths - 1) * 24 + 60

    const internalGaps = totalMonths * 8

    const availableWidth = containerWidth - totalSpacing - internalGaps
    const totalBars = totalMonths * 2

    const barSize = Math.max(Math.floor(availableWidth / totalBars), 24)

    return barSize
  }, [chartData.length, containerWidth])

  return (
    <div ref={containerRef} className="h-[268px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          barGap={8}
          barCategoryGap={24}
          margin={{ left: 0, top: 10 }}
        >
          <defs>
            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5898FF" />
              <stop offset="100%" stopColor="#9EC3FF" />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#F0F6FF" vertical={false} />

          <XAxis
            dataKey="monthWithYear"
            axisLine={false}
            tickLine={false}
            tick={({ x, y, payload }) => (
              <text
                x={x}
                y={y + 16}
                textAnchor="middle"
                fontSize={12}
                fill="#131d5333"
                fontFamily="Geist, sans-serif"
              >
                {payload.value}
              </text>
            )}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tickCount={6}
            domain={[0, maxValue]}
            tick={({ x, y, payload }) => (
              <text
                x={x}
                y={y + 4}
                textAnchor="end"
                fontSize={12}
                fontFamily="Geist, sans-serif"
                fontWeight={500}
                fill="#131d5333"
              >
                {typeof payload.value === 'number'
                  ? payload.value === 0
                    ? '0'
                    : payload.value >= 1000
                    ? `${Math.round(payload.value / 1000)}K`
                    : payload.value.toString()
                  : ''}
              </text>
            )}
          />

          <Tooltip
            cursor={false}
            animationDuration={0}
            content={({ payload, label }) => {
              const items = payload?.filter((p) => p.name !== 'gap') ?? []

              const dataPoint = chartData.find((d) => d.monthWithYear === label)
              const fullMonthName = dataPoint?.monthFull || label

              return (
                <div className="bg-white shadow p-3 rounded text-xs">
                  <div className="font-medium mb-2 text-sm">
                    {fullMonthName}
                  </div>
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between gap-4 text-[#131d53]"
                    >
                      <div className="flex gap-1.5">
                        <div
                          className={`bg-linear-to-b ${
                            item.name === 'clicks'
                              ? 'border border-[#99adff] bg-[#d9e7ff]'
                              : 'from-[#5898FF] to-[#9EC3FF]'
                          }  rounded-sm w-5 h-3.5`}
                        ></div>

                        <span className="text-xs text-[#131d5399]">
                          {item.name === 'clicks'
                            ? 'Cliques'
                            : item.name === 'orders'
                            ? 'Pedidos'
                            : item.name}
                        </span>
                      </div>

                      <span className="text-[#131d53] text-xs">
                        {typeof item.value === 'number'
                          ? item.value === 0
                            ? '0'
                            : item.value >= 1000
                            ? `${Math.round(item.value / 1000)}K`
                            : item.value.toString()
                          : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )
            }}
          />

          <Bar
            barSize={dynamicBarSize}
            dataKey="clicks"
            fill="#D9E7FF"
            radius={[4, 4, 2, 2]}
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />

          <Bar
            barSize={dynamicBarSize}
            dataKey="orders"
            fill="url(#ordersGradient)"
            radius={[4, 4, 2, 2]}
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
