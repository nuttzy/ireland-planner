import React, { useMemo } from 'react'
import { MapContainer, Marker, Popup, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import { ImageOverlay, Pane } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Link, useSearchParams } from 'react-router-dom'
import places from './data/places.json'
import { useUserFlags } from './hooks/useUserFlags'
import './components/leaflet.css'
import { useItinerary } from './hooks/useItinerary'
import './styles/itinerary.css'

import poiPng from '/src/icons/pin-poi.png'
import castlePng from '/src/icons/pin-castle.png'
import poiGrayPng from '/src/icons/pin-poi-gray.png'
import poiGreenPng from '/src/icons/pin-poi-green.png'
import castleGrayPng from '/src/icons/pin-castle-gray.png'

const makeIcon = (url: string) =>
  new L.Icon({ iconUrl: url, iconSize: [26, 38], iconAnchor: [13, 38], popupAnchor: [0, -32] })
const poiIconGreen = makeIcon(poiGreenPng)

const poiIcon = new L.Icon({
  iconUrl: poiPng,
  iconSize: [40, 40],
  iconAnchor: [20, 38],
  popupAnchor: [0, -36],
  tooltipAnchor: [20, -10],
})

const poiIconGray = new L.Icon({
  iconUrl: poiGrayPng,
  iconSize: [40, 40],
  iconAnchor: [20, 38],
  popupAnchor: [0, -36],
  tooltipAnchor: [20, -10],
})

const castleIcon = new L.Icon({
  iconUrl: castlePng,
  iconSize: [48, 48],
  iconAnchor: [24, 46],
  popupAnchor: [0, -44],
  tooltipAnchor: [24, -10],
})

const castleIconGray = new L.Icon({
  iconUrl: castleGrayPng,
  iconSize: [48, 48],
  iconAnchor: [24, 46],
  popupAnchor: [0, -44],
  tooltipAnchor: [24, -10],
})

// const [searchParams, setSearchParams] = useSearchParams()
// const urlFocusId = searchParams.get('focus') ?? null
// const [focusedId, setFocusedId] = React.useState<string | null>(null)

// React.useEffect(() => {
//   if (!urlFocusId) return
//   setFocusedId(urlFocusId)
//   const t = setTimeout(() => {
//     setFocusedId(null)
//     const next = new URLSearchParams(searchParams)
//     next.delete('focus')
//     setSearchParams(next, { replace: true })
//   }, 6000)
//   return () => clearTimeout(t)
// }, [urlFocusId])  // eslint-disable-line

// const MapClickClear: React.FC<{ onClear: () => void }> = ({ onClear }) => {
//   const map = useMap()
//   React.useEffect(() => {
//     const handler = () => onClear()
//     map.on('click', handler)
//     return () => map.off('click', handler)
//   }, [map, onClear])
//   return null
// }


const FitBounds: React.FC = () => {
  const map = useMap()
  const group = useMemo(() => {
    const g = L.featureGroup()
    ;(places as any[]).forEach(p => {
      if (p.lat && p.lng) g.addLayer(L.marker([p.lat, p.lng]))
    })
    return g
  }, [])
  React.useEffect(() => {
    if (group.getLayers().length > 0) {
      map.fitBounds(group.getBounds().pad(0.2))
    } else {
      map.setView([53.1424, -7.6921], 7)
    }
  }, [group, map])
  return null
}

const FocusController: React.FC<{ places: any[] }> = ({ places }) => {
  const map = useMap()
  const [searchParams, setSearchParams] = useSearchParams()
  const focusId = searchParams.get('focus')

  React.useEffect(() => {
    if (!focusId) return
    const target = places.find(p => p.id === focusId)
    if (!target) return
    const targetZoom = Math.max(map.getZoom(), 9)
    map.flyTo([target.lat, target.lng], targetZoom, { duration: 0.75 })

    const t = setTimeout(() => {
      const next = new URLSearchParams(searchParams)
      alert('nuke focus!')
      next.delete('focus')
      setSearchParams(next)
    }, 6000)
    return () => clearTimeout(t)
  }, [focusId, places, map, searchParams, setSearchParams])

  return null
}

const App: React.FC = () => {
  const { optedIn, toggleOpt } = useUserFlags()
  const { dayLabels, getDayForPoi, assignPoiToDay } = useItinerary()
  const [searchParams, setSearchParams] = useSearchParams()
  const focusId = searchParams.get('focus')

  return (
    <div className="map-wrap">
      <MapContainer center={[53.1424, -7.6921]} zoom={6} style={{ height: '100%', width: '100%', background: '#f3f4f6' }} zoomControl={true}>
        <FocusController places={places} />

        {/* <MapClickClear onClear={() => {
          setFocusedId(null)
          const next = new URLSearchParams(searchParams)
          next.delete('focus')
          setSearchParams(next, { replace: true })
        }} /> */}

        <Pane name="basemap" style={{ zIndex: 200 }}>
          <ImageOverlay
            url="/assets/ireland-vintage02.jpeg"
            // bounds={[[51.3, -11.5], [55.7, -5.0]]}   // SW, NE corners of Ireland (with a little padding)
            bounds={[[51.39, -10.66], [55.43, -5.43]]}   // SW, NE corners of Ireland (with a little padding)
            // bounds={[[49.0, -11.0], [56.0, -6.0]]}   // SW, NE corners of Ireland (with a little padding)
            opacity={0.95}
          />
        </Pane>



        <FitBounds />
{/*
<Marker position={[51.39, -10.66]} icon={poiIcon}><Popup>SW bound</Popup></Marker>
<Marker position={[55.43, -5.43]} icon={poiIcon}><Popup>NE bound</Popup></Marker> */}

{/* outdated */}
{/* <Marker position={[51.3, -11.5]} icon={poiIcon}><Popup>SW bound</Popup></Marker> */}
{/* <Marker position={[55.7, -5.0]} icon={poiIcon}><Popup>NE bound02</Popup></Marker> */}

        {(places as any[]).map(p => {
          const img = p.image || '/assets/placeholder.jpg'
          const assignedDay = p.type === 'poi' ? getDayForPoi(p.id) : null
          const isFocused = focusId === p.id
          let icon =
            p.type === 'stay'
              ? castleIcon
              : assignedDay ? poiIcon : poiIconGray
          if (isFocused) icon = poiIconGreen

          return (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
              <Tooltip direction="top" opacity={1} offset={[0, -32]} permanent={isFocused}>
              {/* <Tooltip direction="top" opacity={1} offset={[0, -32]}> */}
                <div>
                  <img className="tooltip-img" src={img} alt="" />
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div className="muted" style={{ maxWidth: 220 }}>{p.shortDesc}</div>
                </div>
              </Tooltip>
              <Popup>
                <div style={{ maxWidth: 240 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div className="pill">{p.type === 'stay' ? 'Stay' : 'POI'}</div>
                    {p.type === 'poi' && (
                      <span className={`pill ${assignedDay ? 'pill--planned' : 'pill--muted'}`}>
                        {assignedDay ? `Day ${assignedDay}` : 'Unassigned'}
                      </span>
                    )}
                  </div>
                  <h3 style={{ margin: '8px 0' }}>{p.name}</h3>
                  <p className="muted">{p.shortDesc}</p>
                  <div style={{ marginTop: 8 }}>

                    <label className="muted" style={{ display:'block', marginBottom:4 }}>Add to itinerary:</label>
                    <select
                      value={assignedDay ?? ''}
                      onChange={e => assignPoiToDay(p.id, e.target.value ? Number(e.target.value) : null)}
                      className="btn" style={{ padding:'0.4rem 0.5rem' }}
                    >
                      <option value="">— Not assigned —</option>
                      {Object.entries(dayLabels).map(([d,label]) => (
                        <option key={d} value={d}>{label}</option>
                      ))}
                    </select>

                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <Link to={`/place/${p.id}`} className="btn primary">Open one‑pager</Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default App