import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Link /*, useLocation, useSearchParams */ } from 'react-router-dom'
import './styles/global.css'
import App from './App'
import IndexPage from './pages/IndexPage'
import PlaceDetail from './pages/PlaceDetail'
import Editor from './pages/Editor'
import Itinerary from './pages/Itinerary'
import PwaStatus from './components/PwaStatus'

// const [, setSearchParams] = useSearchParams()

const Root = () => (
  <HashRouter>
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="topbar-brand">Our Ireland Trip</Link>

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
        <nav className="topbar-nav" aria-label="Primary navigation">
          <Link to="/?reset=1" className="btn">Map</Link>
          <Link to="/index" className="btn">Index</Link>
          <Link to="/itinerary" className="btn">Itinerary</Link>
          <Link to="/editor" className="btn">Edit Data</Link>
        </nav>
        <PwaStatus />
      </header>
      <main className="app-content">
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/index" element={<IndexPage />} />
          <Route path="/place/:id" element={<PlaceDetail />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/itinerary" element={<Itinerary />} />
        </Routes>
      </main>
    </div>
  </HashRouter>
)

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)
