import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePlaces } from '../hooks/useData'
import { marked } from 'marked'
import { assetUrl } from '../utils/assetUrl'

// EAGER: string values, no Promises
const pages = import.meta.glob('../content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function loadOnePager(id: string): string | null {
  const rel = `../content/${id}.md`
  return pages[rel] ?? null
}

const PlaceDetail: React.FC = () => {
  const { id = '' } = useParams()
  const places = usePlaces()
  const place = places.find(p => p.id === id)

  const [html, setHtml] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!id) return
    const md = loadOnePager(id)
    setHtml(md ? (marked.parse(md) as string) : null)
  }, [id])

  const [showImage, setShowImage] = React.useState(false)
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setShowImage(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!place) {
    return (
      <div className="container">
        <h1>Not found</h1>
        <p className="muted">We couldn't find that point of interest.</p>
        <Link className="btn" to="/">Back to map</Link>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>{place.name}</h1>
        <span className="pill">{place.type === 'stay' ? 'Stay' : 'POI'}</span>
        <Link to={`/?focus=${place.id}`} className="btn">Map</Link>        
      </div>

      {/* <img src={place.image || '/assets/placeholder.jpg'} alt=""
           style={{ width:'100%', maxHeight:280, objectFit:'cover', borderRadius:12, marginTop:8 }} /> */}


      {/* HERO (click to open full image) */}
      {place?.image && (
        <>

          <img 
            src={assetUrl(place.image || '/assets/placeholder.jpg')}
            alt=""
            className="hero-img"
            style={{ width:'100%', maxHeight:280, objectFit:'cover', borderRadius:12, marginTop:8 }}
            onClick={() => setShowImage(true)}
            role="button"
            aria-label="Open full image"
            title="Click to view full image"
          />
          {/* Lightbox */}
          {showImage && (
            <div
              className="lightbox"
              onClick={() => setShowImage(false)}
              aria-modal="true"
              role="dialog"
            >
              <img
                src={assetUrl(place.image)}
                alt=""
                className="lightbox-img"
                onClick={e => e.stopPropagation()} // don't close when clicking the image itself
              />
              <button
                className="lightbox-close btn"
                onClick={() => setShowImage(false)}
                aria-label="Close full image"
              >
                Close
              </button>
              <a
                className="lightbox-open btn"
                href={assetUrl(place.image)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open original
              </a>
            </div>
          )}
        </>
      )}

      <p className="muted" style={{ marginTop: 8 }}>{place.shortDesc}</p>

      {html ? (
        <div className="card" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="card">
          <h3>One-pager coming soon</h3>
          <p className="muted">There isn’t a write-up yet for this spot. You still have the essentials above.</p>
        </div>
      )}

      <div style={{ marginTop: 12, display:'flex', gap:8 }}>
        <Link className="btn" to="/">Back to map</Link>
        <Link className="btn" to="/index">Open index</Link>
      </div>
    </div>
  )
}

export default PlaceDetail
