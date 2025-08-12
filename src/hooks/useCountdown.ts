import { useState, useEffect, useCallback } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export const useCountdown = (expiresIn?: string, missionId?: string) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const parseExpiresIn = useCallback((expires: string): Date => {
    const targetDate = new Date()
    const text = expires.toLowerCase()

    if (text.includes('dia')) {
      const days = parseInt(text.match(/\d+/)?.[0] || '0')
      targetDate.setDate(targetDate.getDate() + days)
    } else if (text.includes('hora')) {
      const hours = parseInt(text.match(/\d+/)?.[0] || '0')
      targetDate.setHours(targetDate.getHours() + hours)
    } else if (text.includes('minuto')) {
      const minutes = parseInt(text.match(/\d+/)?.[0] || '0')
      targetDate.setMinutes(targetDate.getMinutes() + minutes)
    } else {
      targetDate.setDate(targetDate.getDate() + 7)
    }

    return targetDate
  }, [])

  useEffect(() => {
    if (!expiresIn || !missionId) return

    const storageKey = `mission_expires_${missionId}`
    let targetDate: Date

    const savedExpiration = localStorage.getItem(storageKey)
    if (savedExpiration) {
      targetDate = new Date(savedExpiration)
    } else {
      targetDate = parseExpiresIn(expiresIn)
      localStorage.setItem(storageKey, targetDate.toISOString())
    }

    const updateCountdown = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        localStorage.removeItem(storageKey)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [expiresIn, missionId, parseExpiresIn])

  return timeLeft
}