import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { LatLngBoundsExpression } from 'leaflet'
import { RouteRenderer } from './RouteRenderer'
import type { OsrmRoute, SearchResult } from './types'

type FitBoundsProps = { bounds: LatLngBoundsExpression }

function FitBounds({ bounds }: FitBoundsProps) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(bounds, { padding: [48, 48] })
  }, [bounds, map])
  return null
}

type MapViewProps = {
  origin: SearchResult | null
  destination: SearchResult | null
  route: OsrmRoute | null
  loading: boolean
}

export function MapView({ origin, destination, route, loading }: MapViewProps) {
  const boundsRef = useRef<LatLngBoundsExpression | null>(null)

  if (origin && destination) {
    boundsRef.current = [
      [origin.lat, origin.lon],
      [destination.lat, destination.lon],
    ]
  }

  return (
    <div className="relative h-full min-h-[520px] w-full">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom
        dragging
        className="h-full w-full rounded-[36px]"
        style={{ background: '#0B1120' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />
        <RouteRenderer origin={origin} destination={destination} route={route} />
        {boundsRef.current && <FitBounds bounds={boundsRef.current} />}
      </MapContainer>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-[36px] bg-[#020617]/50 backdrop-blur-sm">
          <div className="rounded-[24px] border border-cyan-400/20 bg-[#0B1120]/80 px-6 py-4 text-center shadow-[0_20px_80px_rgba(2,8,23,0.45)]">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-300" />
            <p className="mt-3 text-sm font-semibold text-white">Calculating route…</p>
          </div>
        </div>
      )}
    </div>
  )
}
