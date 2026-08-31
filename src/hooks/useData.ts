import { useEffect, useState } from 'react'
import { Place } from '../types'
import basePlaces from '../data/places.json'

const KEY = 'ireland_places_override_v1'

export function usePlaces(): Place[] {
  const [data, setData] = useState<Place[]>(basePlaces as Place[])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const override = JSON.parse(raw)
        if (Array.isArray(override)) setData(override)
      }
    } catch {}
  }, [])

  return data
}

export function savePlacesOverride(places: Place[]) {
  localStorage.setItem(KEY, JSON.stringify(places))
}

export function clearPlacesOverride() {
  localStorage.removeItem('ireland_places_override_v1');
}
