export interface Mission {
  id: string
  title: string
  badge: string
  badgeColor?: string
  badgeImage?: string
  progress: number
  total: number
  description: string
  reward: string
  expiresIn?: string
  type: 'daily' | 'weekly' | 'special'
  completed?: boolean
}

export interface MissionCard {
  id: string
  type: 'combos' | 'boosts' | 'missions' | 'level'
  title: string
  subtitle?: string
  count?: number
  icon: string | React.ReactNode
  gradient: string
}

export interface Boost {
  id: string
  title: string
  description: string
  commission: number
  duration: number
  isActive: boolean
  progress?: number
  total?: number
}

export interface Level {
  current: number
  title: string
  currentCommission: number
  nextLevel: number
  nextCommission: number
  sales: number
  nextSales: number
}

export interface Combo {
  streakDays: number
  totalDays: number
  commission: number
  duration: number
}
