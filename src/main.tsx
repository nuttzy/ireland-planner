import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link /*, useLocation, useSearchParams */ } from 'react-router-dom'
import './styles/global.css'
import App from './App'
import IndexPage from './pages/IndexPage'
import PlaceDetail from './pages/PlaceDetail'
import Editor from './pages/Editor'
import Itinerary from './pages/Itinerary'

// const [, setSearchParams] = useSearchParams()

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
  })
}

// Only register SW in production builds
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
  })
}

const Root = () => (
  <BrowserRouter>
    <div className="topbar">
      <Link to="/" style={{ color: 'white', fontWeight: 700 }}>Our Ireland Trip</Link>

{/* <button
  className="btn"
  onClick={() => {
    const next = new URLSearchParams()
    next.set('reset', '1')  // triggers ResetController
    setSearchParams(next, { replace: false })
  }}
>
  Map
</button> */}
      <Link to="/?reset=1" className="btn">Map</Link>

      <Link to="/index" className="btn">Index</Link>
      <Link to="/itinerary" className="btn">Itinerary</Link>
      <Link to="/editor" className="btn">Edit Data</Link>
      <div className="spacer" />
      <small>Offline ready</small>
    </div>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/index" element={<IndexPage />} />
      <Route path="/place/:id" element={<PlaceDetail />} />
      <Route path="/editor" element={<Editor />} />
      <Route path="/itinerary" element={<Itinerary />} />
    </Routes>
  </BrowserRouter>
)

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)