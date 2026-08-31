import React, { useMemo } from 'react'
import { MapContainer, Marker, Popup, Tooltip, useMap, FeatureGroup } from 'react-leaflet'
import L from 'leaflet'
import { ImageOverlay, Pane } from 'react-leaflet'
import { Link, useSearchParams } from 'react-router-dom'
import { Place } from './types'
import { useItinerary } from './hooks/useItinerary'

import { useSourceFilters } from './hooks/useSourceFilters';
import { SourceFilterBar } from './components/SourceFilterBar';

import 'leaflet/dist/leaflet.css'
import './components/leaflet.css'
import './styles/itinerary.css'
import places from './data/places.json'

import poiPng from '/src/icons/pin-poi.png'
import castlePng from '/src/icons/pin-castle.png'
import poiGrayPng from '/src/icons/pin-poi-gray.png'
import poiGreenPng from '/src/icons/pin-poi-green.png'
import castleGrayPng from '/src/icons/pin-castle-gray.png'

const DEFAULT_CENTER: [number, number] = [53.4, -8.2]
const DEFAULT_ZOOM = 7

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
      map.setView(DEFAULT_CENTER, 7)
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

    // const t = setTimeout(() => {
    //   const next = new URLSearchParams(searchParams)
    //   next.delete('focus')
    //   setSearchParams(next)
    // }, 6000)
    // return () => clearTimeout(t)
  }, [focusId, places, map, searchParams, setSearchParams])

  return null
}

const ResetController: React.FC = () => {
  const map = useMap()
  const [searchParams, setSearchParams] = useSearchParams()
  const shouldReset = searchParams.get('reset') === '1'

  React.useEffect(() => {
    if (!shouldReset) return
    // Clear any focus and reset the view
    const next = new URLSearchParams(searchParams)
    next.delete('focus')
    next.delete('reset')
    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true })
    setSearchParams(next, { replace: true })
  }, [shouldReset, map, searchParams, setSearchParams])

  return null
}

const TooltipBody: React.FC<{ place: Place }> = ({ place }) => (
  <>
    <div>
      <img className="tooltip-img" src={place.image} alt="" />
      <div style={{ fontWeight: 700 }}>{place.name}</div>
      <div className="muted" style={{ maxWidth: 220 }}>{place.shortDesc}</div>
    </div>
  </>
)

const TOOLTIP_EDGE_PADDING = 12
const TOOLTIP_TOP_OFFSET: [number, number] = [0, -32]
const TOOLTIP_BOTTOM_OFFSET: [number, number] = [0, 18]
const TOOLTIP_TOP_GAP = 42
const TOOLTIP_BOTTOM_GAP = 18

const BoundaryAwareTooltip: React.FC<{ place: Place; permanent: boolean }> = ({ place, permanent }) => {
  const map = useMap()
  const tooltipRef = React.useRef<L.Tooltip | null>(null)
  const frameRef = React.useRef<number | null>(null)

  const positionTooltip = React.useCallback((tooltip: L.Tooltip | null) => {
    if (!tooltip || !map.hasLayer(tooltip)) return

    const element = tooltip.getElement()
    if (!element) return

    const markerPoint = map.latLngToContainerPoint([place.lat, place.lng])
    const tooltipHeight = element.offsetHeight
    const mapHeight = map.getSize().y
    const spaceAbove = markerPoint.y - TOOLTIP_EDGE_PADDING - TOOLTIP_TOP_GAP
    const spaceBelow = mapHeight - markerPoint.y - TOOLTIP_EDGE_PADDING - TOOLTIP_BOTTOM_GAP

    const direction =
      spaceAbove >= tooltipHeight || spaceAbove >= spaceBelow ? 'top' : 'bottom'
    const offset = direction === 'top' ? TOOLTIP_TOP_OFFSET : TOOLTIP_BOTTOM_OFFSET

    tooltip.options.direction = direction
    tooltip.options.offset = L.point(offset)
    tooltip.update()
  }, [map, place.lat, place.lng])

  const schedulePosition = React.useCallback((event?: L.LeafletEvent) => {
    const tooltip = (event?.target as L.Tooltip | undefined) ?? tooltipRef.current
    if (!tooltip || !map.hasLayer(tooltip)) return

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null
        positionTooltip(tooltip)
      })
    })
  }, [map, positionTooltip])

  React.useEffect(() => {
    map.on('moveend zoomend resize', schedulePosition)
    return () => {
      map.off('moveend zoomend resize', schedulePosition)
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [map, schedulePosition])

  return (
    <Tooltip
      ref={tooltipRef}
      direction="top"
      offset={TOOLTIP_TOP_OFFSET}
      opacity={1}
      permanent={permanent}
      eventHandlers={{ add: schedulePosition }}
    >
      <TooltipBody place={place} />
    </Tooltip>
  )
}

const App: React.FC = () => {
  const { dayLabels, getDayForPoi, assignPoiToDay } = useItinerary()
  const [searchParams, setSearchParams] = useSearchParams()
  const focusId = searchParams.get('focus')

  const { selected, counts, toggle, selectAll, setOnly, filterPlaces, ALL_SOURCES } =
    useSourceFilters(places);  

  // const visible = React.useMemo(() => {
  //   const base = filterPlaces();
  //   if (!focusId) return base;
  //   // inject focused place if filtered out
  //   return base.some(p => p.id === focusId)
  //     ? base
  //     : [...base, ...places.filter(p => p.id === focusId)];
  // }, [filterPlaces, focusId, places]);

  // const visible = React.useMemo(() => {
  //   const extras = places.filter(p => p.type === 'stay' || p.id === focusId);

  //   const byId = new Map<string, Place>();
  //   for (const p of base) byId.set(p.id, p);
  //   for (const p of extras) byId.set(p.id, p);

  //   return [...byId.values()];
  // }, [base, places, focusId]);


  const visible = React.useMemo(() => {
    const base = filterPlaces();

    const extras = places.filter(p => p.type === 'stay' || p.id === focusId);

    const byId = new Map<string, Place>();
    for (const p of base) byId.set(p.id, p);
    for (const p of extras) byId.set(p.id, p);

    return [...byId.values()];
  }, [filterPlaces, focusId, places]);



  return (
    <div className="map-wrap">
      <SourceFilterBar
        selected={selected}
        counts={counts}
        all={ALL_SOURCES}
        onToggle={toggle}
        onAll={selectAll}
        onOnly={setOnly}
      />
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM} 
        style={{ height: '100%', width: '100%', background: '#f3f4f6' }} 
        zoomControl={true}>
        <FocusController places={places} />

        <Pane name="basemap" style={{ zIndex: 200 }}>
          <ImageOverlay
            url="/assets/ireland-vintage02.jpeg"
            bounds={[[51.39, -10.66], [55.43, -5.43]]}   // SW, NE corners of Ireland (with a little padding)
            opacity={0.95}
          />
        </Pane>

        <ResetController /> 

        {/* <FitBounds /> */}

        {/* {(places as any[]).map(p => { */}
        {(visible as any[]).map(p => {
          const img = p.image || '/assets/placeholder.jpg'
          const assignedDay = p.type === 'poi' ? getDayForPoi(p.id) : null
          // const isFocused = focusId === p.id
          const isFocused = !!focusId && focusId === p.id
          let icon =
            p.type === 'stay'
              ? castleIcon
              : assignedDay ? poiIcon : poiIconGray
          if (isFocused) icon = poiIconGreen

          return (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
              {/* { isFocused && (
              <Tooltip direction="top" opacity={1} offset={[0, -32]} 
                key={`focus-${p.id}-${focusId}`}
                permanent
                className="focus-tooltip"
                >
                <TooltipBody place={p} />
              </Tooltip>
              )} */}

              <BoundaryAwareTooltip place={p} permanent={isFocused} />


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
