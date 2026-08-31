import { useEffect, useState } from 'react'

type Flags = Record<string, boolean>
const KEY = 'ireland_user_flags_v1'

export function useUserFlags() {
  const [optedIn, setOptedIn] = useState<Flags>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setOptedIn(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(optedIn))
    } catch {}
  }, [optedIn])

  function toggleOpt(id: string) {
    setOptedIn(prev => ({ ...prev, [id]: !(prev[id] ?? true) }))
  }

  return { optedIn, toggleOpt }
}