import React from 'react'
import { registerSW } from 'virtual:pwa-register'

type UpdateServiceWorker = (reloadPage?: boolean) => Promise<void>

const PwaStatus: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine)
  const [isReady, setIsReady] = React.useState(false)
  const [needsUpdate, setNeedsUpdate] = React.useState(false)
  const [registrationFailed, setRegistrationFailed] = React.useState(false)
  const updateServiceWorker = React.useRef<UpdateServiceWorker | null>(null)

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      updateServiceWorker.current = registerSW({
        immediate: true,
        onOfflineReady: () => setIsReady(true),
        onNeedRefresh: () => setNeedsUpdate(true),
        onRegisterError: () => setRegistrationFailed(true),
      })

      navigator.serviceWorker.ready.then(async () => {
        const cacheNames = await caches.keys()
        if (cacheNames.some(name => name.includes('workbox-precache'))) {
          setIsReady(true)
        }
      }).catch(() => setRegistrationFailed(true))
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!import.meta.env.PROD) {
    return <small className="pwa-status">Development mode</small>
  }

  if (needsUpdate) {
    return (
      <button
        className="btn pwa-status"
        onClick={() => void updateServiceWorker.current?.(true)}
      >
        Update now
      </button>
    )
  }

  if (!isOnline) {
    return (
      <small className="pwa-status" aria-live="polite">
        {isReady ? 'Working offline' : 'Offline cache incomplete'}
      </small>
    )
  }

  if (registrationFailed) {
    return <small className="pwa-status">Offline setup failed</small>
  }

  return (
    <small className="pwa-status" aria-live="polite">
      {isReady ? 'Ready offline' : 'Preparing offline…'}
    </small>
  )
}

export default PwaStatus
