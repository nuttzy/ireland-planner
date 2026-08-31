// src/App.tsx
import React from 'react'
import { Routes, Route, Link, useSearchParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'

import places from './data/places.json'
import { useItinerary } from './hooks/useItinerary'
import PlaceDetail from './pages/PlaceDetail'
import IndexPage from './pages/IndexPage'

import poiPng from '/src/icons/pin-poi.png'
import poiGrayPng from '/src/icons/pin-poi-gray.png'
import poiGreenPng from '/src/icons/pin-poi-green.png'
import castlePng from '/src/icons/pin-castle.png'

import 'leaflet/dist/leaflet.css'
// import './styles/app.css'

const makeIcon = (url: string) =>
  new L.Icon({ iconUrl: url, iconSize: [26, 38], iconAnchor: [13, 38], popupAnchor: [0, -32] })

const poiIcon = makeIcon(poiPng)
const poiIconGray = makeIcon(poiGrayPng)
const poiIconGreen = makeIcon(poiGreenPng)
const castleIcon = makeIcon(castlePng)

type Place = {
  id: string
  name: string
  type: 'poi' | 'stay'
  city?: string
  lat: number
  lng: number
  image?: string
  shortDesc?: string
}

const MapClickClear: React.FC<{ onClear: () => void }> = ({ onClear }) => {
  const map = useMap()
  React.useEffect(() => {
    const handler = () => onClear()
    map.on('click', handler)
    return () => map.off('click', handler)
  }, [map, onClear])
  return null
}

const FlyToOnFocus: React.FC<{ focusId: string | null; items: Place[] }> = ({ focusId, items }) => {
  const map = useMap()
  React.useEffect(() => {
    if (!focusId) return
    const p = items.find(x => x.id === focusId)
    if (!p) return
    const targetZoom = Math.max(map.getZoom(), 9)
    map.flyTo([p.lat, p.lng], targetZoom, { duration: 0.75 })
  }, [focusId, items, map])
  return null
}

const MapPage: React.FC = () => {
  const data = places as Place[]
  const { getDayForPoi, assignPoiToDay, dayLabels } = useItinerary()

  const [searchParams, setSearchParams] = useSearchParams()
  const urlFocusId = searchParams.get('focus')
  const [focusedId, setFocusedId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!urlFocusId) return
    setFocusedId(urlFocusId)
    const t = setTimeout(() => {
      setFocusedId(null)
      const next = new URLSearchParams(searchParams)
      next.delete('focus')
      setSearchParams(next, { replace: true })
    }, 6000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlFocusId])

  const clearFocus = React.useCallback(() => {
    setFocusedId(null)
    const next = new URLSearchParams(searchParams)
    next.delete('focus')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  return (
    <div className="page">
      <header className="topbar">
        <h1>Ireland Trip Map</h1>
        <nav className="nav">
          <Link to="/index" className="btn">Index</Link>
        </nav>
      </header>

      <MapContainer
        center={[53.4, -8.2]}
        zoom={6}
        minZoom={5}
        style={{ height: 'calc(100vh - 64px)', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickClear onClear={clearFocus} />
        <FlyToOnFocus focusId={focusedId} items={data} />

        {data.map(p => {
          const assignedDay = p.type === 'poi' ? getDayForPoi(p.id) : null
          const isFocused = focusedId === p.id

          let icon = p.type === 'stay' ? castleIcon : (assignedDay ? poiIcon : poiIconGray)
          if (p.type === 'poi' && isFocused) icon = poiIconGreen

          return (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
              {isFocused && (
                <Tooltip key="focus" direction="top" offset={[0, -32]} permanent>
                  <strong>{p.name}</strong>
                  {p.shortDesc && (
                    <div style={{ maxWidth: 220, lineHeight: 1.25, whiteSpace: 'normal' }}>
                      {p.shortDesc}
                    </div>
                  )}
                </Tooltip>
              )}

              <Popup>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <strong>{p.name}</strong>
                  {p.city && <span className="muted">• {p.city}</span>}
                  {p.type === 'poi' && (
                    <span className={`pill ${assignedDay ? 'pill--planned' : 'pill--muted'}`}>
                      {assignedDay ? `Day ${assignedDay}` : 'Unassigned'}
                    </span>
                  )}
                </div>

                {p.image && (
                  <img
                    src={p.image}
                    alt=""
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
                    loading="lazy"
                  />
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <Link to={`/place/${p.id}`} className="btn">Open one-pager</Link>
                  {p.type === 'poi' && (
                    <select
                      value={assignedDay ?? ''}
                      onChange={e => {
                        const v = e.target.value ? Number(e.target.value) : null
                        assignPoiToDay(p.id, v)
                      }}
                      className="btn"
                      aria-label="Assign day"
                    >
                      <option value="">— Not assigned —</option>
                      {Object.entries(dayLabels).map(([d, label]) => (
                        <option key={d} value={d}>{label}</option>
                      ))}
                    </select>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<MapPage />} />
    <Route path="/index" element={<IndexPage />} />
    <Route path="/place/:id" element={<PlaceDetail />} />
  </Routes>
)

export default App