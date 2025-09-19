import { useState, useEffect } from 'react'
import { Mission, Boost, Level, Combo } from '../types/missions'

export const useMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([])
  const [boosts, setBoosts] = useState<Boost[]>([])
  const [level, setLevel] = useState<Level | null>(null)
  const [combo, setCombo] = useState<Combo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMissions = async () => {
      setLoading(true)

      const mockMissions: Mission[] = [
        {
          id: '1',
          title: 'Black Friday Seller',
          badge: 'BLACK FRIDAY',
          badgeImage: '/assets/campaigns/campaign-black-friday.png',
          progress: 90,
          total: 100,
          description: 'Venda 100 itens ou mais da coleção black friday',
          reward: '+10% Comissão por 7 dias',
          expiresIn: '1 dia',
          type: 'weekly',
        },
        {
          id: '2',
          title: 'Primeira venda do dia',
          badge: 'DIÁRIO',
          badgeImage: '/assets/missions/mission-daily.png',
          progress: 1,
          total: 1,
          description: 'Faça sua primeira venda hoje',
          reward: 'R$ 50,00',
          expiresIn: '1 dia',
          type: 'daily',
        },
        {
          id: '3',
          title: 'Campanha especial Natal',
          badge: 'NATAL',
          badgeImage: '/assets/campaigns/campaign-christmas.png',
          progress: 2,
          total: 10,
          description: 'Participe da campanha especial de Natal',
          reward: 'R$ 500,00',
          expiresIn: '15 dias',
          type: 'special',
        },
      ]

      const mockBoosts: Boost[] = [
        {
          id: '1',
          title: 'Boost Semanal',
          description: 'Aumente sua comissão em 2% por 7 dias',
          commission: 2,
          duration: 7,
          isActive: true,
          progress: 0,
          total: 5,
        },
        {
          id: '2',
          title: 'Boost Mensal',
          description: 'Aumente sua comissão em 5% por 30 dias',
          commission: 5,
          duration: 30,
          isActive: false,
        },
      ]

      const mockLevel: Level = {
        current: 300,
        title: 'Super Vendedor',
        currentCommission: 6,
        nextLevel: 500,
        nextCommission: 8,
        sales: 300,
        nextSales: 500,
      }

      const mockCombo: Combo = {
        streakDays: 14,
        totalDays: 60,
        commission: 2,
        duration: 2,
      }

      setMissions(mockMissions)
      setBoosts(mockBoosts)
      setLevel(mockLevel)
      setCombo(mockCombo)
      setLoading(false)
    }

    fetchMissions()
  }, [])

  const getCompletedMissions = () => {
    return missions.filter((m) => m.progress >= m.total).length
  }

  const getAvailableMissions = () => {
    return missions.filter((m) => m.progress < m.total).length
  }

  const getActiveBoosts = () => {
    return boosts.filter((b) => b.isActive).length
  }

  const getTotalBoosts = () => {
    return boosts.length
  }

  const activateBoost = (boostId: string) => {
    setBoosts((prev) =>
      prev.map((boost) =>
        boost.id === boostId ? { ...boost, isActive: true } : boost
      )
    )
  }

  const deactivateBoost = (boostId: string) => {
    setBoosts((prev) =>
      prev.map((boost) =>
        boost.id === boostId ? { ...boost, isActive: false } : boost
      )
    )
  }

  return {
    missions,
    boosts,
    level,
    combo,
    loading,
    getCompletedMissions,
    getAvailableMissions,
    getActiveBoosts,
    getTotalBoosts,
    activateBoost,
    deactivateBoost,
  }
}
