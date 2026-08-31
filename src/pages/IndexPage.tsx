import React from 'react'
import { Link } from 'react-router-dom'
import { SourceType, Place } from '../types'
import { usePlaces } from '../hooks/useData'
import { useItinerary } from '../hooks/useItinerary'

import { useSourceFilters } from '../hooks/useSourceFilters';
import { SourceFilterBar } from '../components/SourceFilterBar';



const IndexPage: React.FC = () => {
  const places = usePlaces()
  const { getDayForPoi, assignPoiToDay, dayLabels } = useItinerary()

  const sorted = React.useMemo(() => {
    const sortKey = (s: string) => s.replace(/^(the|a|an)\s+/i, '').toLowerCase()
    return [...places].sort((a, b) =>
      sortKey(a.name).localeCompare(sortKey(b.name), undefined, {
        numeric: true,
        sensitivity: 'base'
      })
    )
  }, [places])


  const { selected, counts, toggle, selectAll, setOnly, filterPlaces, ALL_SOURCES } =
    useSourceFilters(places);  
  const displayPlaces = filterPlaces();

  return (
    <div className="container">
      <h1>All Points of Interest</h1>
      <p className="muted">Tap any item to open its one-pager. Use the Opt toggle to include/exclude while planning.</p>

{/* <div className="filters">
  <div className="filters-row">
    {ALL_SOURCES.map(s => {
      const active = selectedSources.has(s);
      return (
        <button
          key={s}
          className={`pill ${active ? 'active' : ''}`}
          onClick={() => toggleSource(s)}
          title={`Filter: ${s}`}
        >
          {s} <span className="count">{sourceCounts[s]}</span>
        </button>
      );
    })}
    <div className="spacer" />
    
    <div className="solo">

      <button className="pill util" onClick={selectAll}>All</button>
      {ALL_SOURCES.map(s => {
        return (
        <button key={`solo-${s}`} className="pill solo-btn" onClick={() => clearTo(s)} title={`Only ${s}`}>
          {s}
        </button>
        );    
      })}
    </div>
  </div>
</div> */}



      <SourceFilterBar
        selected={selected}
        counts={counts}
        all={ALL_SOURCES}
        onToggle={toggle}
        onAll={selectAll}
        onOnly={setOnly}
      />



      <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
        {/* {sorted.map(p => { */}
        {displayPlaces.map(p => {
          const assignedDay = p.type === 'poi' ? getDayForPoi(p.id) : null

          return (
            <div key={p.id} className="card">
              <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>

                {/* Type pill */}
                <span className="pill">{p.type === 'stay' ? 'Stay' : 'POI'}</span>

                {/* Name */}
                <strong>{p.name}</strong>

                {/* City */}
                <span className="muted">• {p.city ?? '—'}</span>

                <Link to={`/?focus=${p.id}`} className="btn">Map</Link>

                <span className="spacer" />

                {p.type === 'poi' && (
                  <>
                  {assignedDay && <span className="pill">Day {assignedDay}</span>}
                  <select
                    value={assignedDay ?? ''}
                    onChange={e => assignPoiToDay(p.id, e.target.value ? Number(e.target.value) : null)}
                    className="btn" style={{ padding:'0.3rem 0.4rem' }}
                    aria-label="Assign day"
                  >
                    <option value="">Not assigned</option>
                    {Object.entries(dayLabels).map(([d,label]) => (
                      <option key={d} value={d}>{label}</option>
                    ))}
                  </select>
                  </>
                )}
              </div>

              <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
                <img
                  src={p.image || '/assets/placeholder.jpg'}
                  alt=""
                  style={{ width: 120, height: 72, objectFit: 'cover', borderRadius: 8 }}
                />
                <div className="muted">{p.shortDesc}</div>
              </div>

              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <Link to={`/place/${p.id}`} className="btn primary">Open one-pager</Link>
                {/* Quick jump: if assigned, link to its day on the itinerary page */}
                {assignedDay && (
                  <Link to="/itinerary" className="btn">View Day {assignedDay}</Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default IndexPage