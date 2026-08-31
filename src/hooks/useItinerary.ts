// src/hooks/useItinerary.ts
import { useEffect, useMemo, useState } from 'react'
import { usePlaces } from './useData'

// Fixed day->stay plan for THIS trip
export type DayPlan = { day: number; stayId: string; poiIds: string[] }
type Itin = DayPlan[]

const KEY = 'ireland_itinerary_v1'

// Your 6-night plan (adjust order/ids if needed)
const DEFAULT_DAYS: Omit<DayPlan, 'poiIds'>[] = [
  { day: 1, stayId: 'slieve-russell-hotel' },
  { day: 2, stayId: 'slieve-russell-hotel' },
  { day: 3, stayId: 'lough-rynn-castle' },
  { day: 4, stayId: 'hotel-woodstock' },
  { day: 5, stayId: 'hotel-woodstock' },
  { day: 6, stayId: 'dunboyne-castle-hotel' },
]

export function useItinerary() {
  const places = usePlaces()
  const [days, setDays] = useState<Itin>(() =>
    DEFAULT_DAYS.map(d => ({ ...d, poiIds: [] }))
  )

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setDays(parsed)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(days))
    } catch {}
  }, [days])

  function assignPoiToDay(poiId: string, day: number | null) {
    setDays(prev => {
      // remove from any day it’s currently on
      const cleared = prev.map(d => ({ ...d, poiIds: d.poiIds.filter(id => id !== poiId) }))
      if (day == null) return cleared
      // add to chosen day (avoid dup)
      return cleared.map(d => d.day === day ? { ...d, poiIds: [...new Set([...d.poiIds, poiId])] } : d)
    })
  }

  function getDayForPoi(poiId: string): number | null {
    const hit = days.find(d => d.poiIds.includes(poiId))
    return hit ? hit.day : null
  }

  // Handy: label days like "Day 1 – Cabra Castle"
  const dayLabels = useMemo(() => {
    const nameById = Object.fromEntries(places.map(p => [p.id, p.name]))
    return Object.fromEntries(days.map(d => [d.day, `Day ${d.day} – ${nameById[d.stayId] ?? d.stayId}`]))
  }, [days, places])

  function isPlanned(poiId: string) {
    return days.some(d => d.poiIds.includes(poiId))
  }

  return { days, assignPoiToDay, getDayForPoi, dayLabels, isPlanned }
}