import React from 'react'
import { Link } from 'react-router-dom'
import { useItinerary } from '../hooks/useItinerary'
import { usePlaces } from '../hooks/useData'

const Itinerary: React.FC = () => {
  const { days } = useItinerary()
  const places = usePlaces()
  const byId = React.useMemo(() => Object.fromEntries(places.map(p => [p.id, p])), [places])

  return (
    <div className="container">
      <h1>Daily Itinerary</h1>
      <p className="muted">
        Each day ends at your stay. Assign POIs from the map popups; they’ll appear under <strong>Planned Visits</strong>.
      </p>

      <div className="itinerary-days">
        {days.map(d => {
          const stay = byId[d.stayId]
          const poiCards = d.poiIds
            .map(id => byId[id])
            .filter(Boolean)
            .sort((a, b) => a!.name.localeCompare(b!.name)) as typeof places

          return (
            <section className="day-card card" key={d.day} aria-labelledby={`day-${d.day}-title`}>
              {/* Day header */}
              <header className="day-header">
                <h2 id={`day-${d.day}-title`} className="day-title">Day {d.day}</h2>
              </header>

              {/* Planned Visits (POIs) */}
              <div className="planned-visits">
                <div className="section-heading">
                  <h3>Planned Visits</h3>
                  <span className="pill">{poiCards.length}</span>
                </div>

                {poiCards.length === 0 ? (
                  <p className="muted">No POIs assigned yet — pick them from the map.</p>
                ) : (
                  <div className="poi-list-vertical">
                    {poiCards.map(p => (
                      <article className="poi-row" key={p.id}>
                        {/* Left: image */}
                        <img
                          src={p.image || '/assets/placeholder.jpg'}
                          alt=""
                          className="poi-row-thumb"
                        />

                        {/* Middle: title + button under */}
                        <div className="poi-row-middle">
                          <Link to={`/place/${p.id}`} className="poi-row-title">
                            {p.name}
                          </Link>
                          <div className="poi-row-actions">
                            <Link to={`/place/${p.id}`} className="btn">Open one-pager</Link>
                          </div>
                        </div>

                        {/* Right: description (wraps within this column) */}
                        <div className="poi-row-desc muted">
                          {p.shortDesc}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {/* Evening Stay (always last, more pronounced) */}
              <div className="evening-stay">
                <div className="section-heading prominent">
                  <h3>Evening Stay</h3>
                  {/* <span className="pill">1</span> */}
                </div>

                {stay && (
                  <article className="stay-card">
                    <img
                      src={stay.image || '/assets/placeholder.jpg'}
                      alt=""
                      className="stay-thumb"
                    />
                    <div className="stay-body">
                      <div className="stay-line1">
                        <span className="pill stay-pill">Stay</span>
                        <Link to={`/place/${stay.id}`} className="stay-name">{stay.name}</Link>
                      </div>
                      <div className="muted">{stay.city ?? ''}</div>
                      <div className="stay-actions">
                        <Link className="btn primary" to={`/place/${stay.id}`}>Open stay page</Link>
                      </div>
                    </div>
                  </article>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default Itinerary