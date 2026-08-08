import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { EstimatedDayRoute, MapMarker } from '@/maps/mapModel'

function plannedIcon(): L.DivIcon {
  return L.divIcon({
    className: 'trip-marker trip-marker-planned',
    html: '<span></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

function visitedIcon(): L.DivIcon {
  return L.divIcon({
    className: 'trip-marker trip-marker-visited',
    html: '<span></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

interface TripMapProps {
  markers: MapMarker[]
  route?: EstimatedDayRoute | null
  selectedId?: string | null
  onSelect: (marker: MapMarker) => void
  isHe: boolean
}

export function TripMap({ markers, route, selectedId, onSelect, isHe }: TripMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      scrollWheelZoom: true,
      attributionControl: true,
    }).setView([49.2, 19.8], 8)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)

    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    const onResize = () => map.invalidateSize()
    window.addEventListener('resize', onResize)
    window.setTimeout(() => map.invalidateSize(), 50)

    return () => {
      window.removeEventListener('resize', onResize)
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const group = layerRef.current
    if (!map || !group) return

    group.clearLayers()
    const latLngs: L.LatLngExpression[] = []

    for (const marker of markers) {
      const pin = L.marker([marker.lat, marker.lng], {
        icon: marker.layer === 'visited' ? visitedIcon() : plannedIcon(),
        title: isHe ? marker.nameHe : marker.nameEn,
        opacity: selectedId && selectedId !== marker.id ? 0.55 : 1,
      })
      pin.on('click', () => onSelect(marker))
      pin.bindTooltip(isHe ? marker.nameHe : marker.nameEn)
      pin.addTo(group)
      latLngs.push([marker.lat, marker.lng])
    }

    if (route && route.points.length >= 2) {
      const line = L.polyline(
        route.points.map((p) => [p.lat, p.lng] as L.LatLngExpression),
        {
          color: '#f59e0b',
          weight: 3,
          dashArray: '8 8',
          opacity: 0.85,
        },
      )
      line.bindTooltip(isHe ? 'מסלול משוער — לא מדויק' : 'Estimated route — not exact')
      line.addTo(group)
      for (const p of route.points) latLngs.push([p.lat, p.lng])
    }

    if (latLngs.length === 1) {
      map.setView(latLngs[0]!, 10)
    } else if (latLngs.length > 1) {
      map.fitBounds(L.latLngBounds(latLngs), { padding: [36, 36] })
    }

    window.setTimeout(() => map.invalidateSize(), 30)
  }, [markers, route, selectedId, onSelect, isHe])

  return (
    <div className="trip-map-shell">
      <div
        ref={containerRef}
        className="trip-map"
        role="application"
        aria-label={isHe ? 'מפת טיול' : 'Trip map'}
      />
      <p className="muted small map-disclaimer">
        {isHe
          ? 'נקודות משוערות לתצוגה בלבד. אין מעקב מיקום ברקע. מסלולים מקווקווים = משוערים.'
          : 'Approximate points for display only. No background tracking. Dashed routes are estimated.'}
      </p>
    </div>
  )
}
