import React from 'react'
import basePlaces from '../data/places.json'
import { savePlacesOverride, clearPlacesOverride } from '../hooks/useData'
import { Place } from '../types'

const Editor: React.FC = () => {
  const [text, setText] = React.useState(JSON.stringify(basePlaces, null, 2))
  const [status, setStatus] = React.useState<string>('')

  function handleSave() {
    try {
      const parsed = JSON.parse(text) as Place[]
      if (!Array.isArray(parsed)) throw new Error('Root must be an array')
      savePlacesOverride(parsed)
      setStatus('Saved to this device. Reload the map to see changes.')
      setTimeout(() => setStatus(''), 3000)
    } catch (e:any) {
      setStatus('Invalid JSON: ' + e.message)
    }
  }

  function handleExport() {
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'places.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setText(String(reader.result))
    }
    reader.readAsText(file)
  }

  function handleResetAppData() {
    const confirmed = window.confirm(
      'Reset all saved Ireland app data? This will remove edited places, itinerary assignments, and filters stored on this device.'
    )
    if (!confirmed) return

    const irelandKeys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index)
    ).filter((key): key is string => key?.startsWith('ireland_') === true)

    irelandKeys.forEach(key => localStorage.removeItem(key))
    location.reload()
  }

  return (
    <div className="container">
      <h1>Edit Data (Offline)</h1>
      <p className="muted">This edits only the JSON for places (not the one‑pagers). Changes are saved to this device. You can export or import JSON while on the road.</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <button className="btn primary" onClick={handleSave}>Save locally</button>
        <button className="btn" onClick={handleExport}>Export JSON</button>
        <label className="btn">
          Import JSON
          <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
        </label>
        <button className="btn" onClick={() => { clearPlacesOverride(); location.reload(); }}>
          Reset place data
        </button>
        <button className="btn" onClick={handleResetAppData}>
          Reset app data
        </button>
      </div>
      {status && <div className="pill">{status}</div>}
      <textarea value={text} onChange={e=>setText(e.target.value)} style={{ width:'100%', height: '60vh', fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13, padding: 12 }} />
    </div>
  )
}

export default Editor
