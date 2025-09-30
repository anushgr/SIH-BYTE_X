"use client"

import { useEffect, useMemo, useRef } from "react"
import "leaflet/dist/leaflet.css"
import type { Station } from "@/lib/stations"
import { placeholderStations, haversineDistanceKm } from "@/lib/stations"

import L from "leaflet"

type Props = {
  userLocation: { latitude: number; longitude: number } | null
  stations?: Station[]
  onLocationChange?: (lat: number, lng: number) => void
}

export default function IndiaMap({ userLocation, stations, onLocationChange }: Props) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)

  const allStations = stations ?? placeholderStations

  const nearest = useMemo(() => {
    if (!userLocation) return null
    let best: { st: Station; dist: number } | null = null
    for (const st of allStations) {
      const d = haversineDistanceKm(userLocation.latitude, userLocation.longitude, st.latitude, st.longitude)
      if (!best || d < best.dist) best = { st, dist: d }
    }
    return best
  }, [userLocation, allStations])

  useEffect(() => {
    if (!containerRef.current) return
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([22.9734, 78.6569], 4.5)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)
      // Ensure a pane for lines that sits under markers
      mapRef.current.createPane('linePane')
      const linePane = mapRef.current.getPane('linePane')
      if (linePane) linePane.style.zIndex = '350'
      markersRef.current = L.layerGroup().addTo(mapRef.current)
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return
    const map = mapRef.current
    const layer = markersRef.current
    layer.clearLayers()

    const userIcon = new L.DivIcon({
      className: "",
      html: '<div style="width:16px;height:16px;background:#2563eb;border:2px solid white;border-radius:9999px;box-shadow:0 0 0 2px rgba(37,99,235,0.3)"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })

    const stationIcon = new L.DivIcon({
      className: "",
      html: '<div style="width:14px;height:14px;background:#6b7280;border:2px solid white;border-radius:9999px;box-shadow:0 0 0 2px rgba(107,114,128,0.3)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    })

    const nearestIcon = new L.DivIcon({
      className: "",
      html: '<div style="width:28px;height:28px;position:relative;">\
        <div style="position:absolute;top:50%;left:50%;width:16px;height:16px;background:#16a34a;border:2px solid white;border-radius:9999px;transform:translate(-50%,-50%);"></div>\
        <div style="position:absolute;top:50%;left:50%;width:28px;height:28px;border-radius:9999px;border:2px solid rgba(22,163,74,0.35);transform:translate(-50%,-50%);"></div>\
      </div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    })

    if (userLocation) {
      const m = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon, draggable: true })
      m.setZIndexOffset(1000)
      m.bindPopup(`<div class="text-sm"><div class="font-medium">Your Location</div><div>Lat: ${userLocation.latitude.toFixed(4)}, Lng: ${userLocation.longitude.toFixed(4)}</div><div class="mt-1">Drag to adjust</div></div>`)
      m.on('dragend', () => {
        const pos = m.getLatLng()
        if (onLocationChange) onLocationChange(pos.lat, pos.lng)
      })
      userMarkerRef.current = m
      layer.addLayer(m)
      
      // Calculate appropriate zoom and center to show both user and nearest station
      if (nearest) {
        // Create bounds that include both points
        const bounds = L.latLngBounds([
          [userLocation.latitude, userLocation.longitude],
          [nearest.st.latitude, nearest.st.longitude]
        ])
        
        // Add padding and fit bounds with a maximum zoom level
        map.fitBounds(bounds, {
          padding: [50, 50], // Add 50px padding on all sides
          maxZoom: 12 // Don't zoom in too much for very close stations
        })
      } else {
        // If no nearest station, just center on user with a reasonable zoom
        map.setView([userLocation.latitude, userLocation.longitude], 10)
      }
    } else {
      map.setView([22.9734, 78.6569], 4.5)
    }

    for (const st of allStations) {
      const isNearest = nearest && nearest.st.id === st.id
      const m = L.marker([st.latitude, st.longitude], { icon: isNearest ? nearestIcon : stationIcon })
      if (isNearest) m.setZIndexOffset(900)
      const distTxt = userLocation ? `~${haversineDistanceKm(userLocation.latitude, userLocation.longitude, st.latitude, st.longitude).toFixed(1)} km from you` : ""
      m.bindPopup(`<div class="text-sm"><div class="font-medium">${st.name}</div><div>${distTxt}</div></div>`)
      layer.addLayer(m)
    }

    // Draw a connecting line from user to nearest station (with underlay for visibility)
    if (userLocation && nearest) {
      const points: [number, number][] = [
        [userLocation.latitude, userLocation.longitude],
        [nearest.st.latitude, nearest.st.longitude],
      ]

      // Underlay (white) for contrast
      const lineUnder = L.polyline(points, {
        pane: 'linePane',
        color: '#ffffff',
        weight: 8,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      })
      // Overlay (green)
      const lineOver = L.polyline(points, {
        pane: 'linePane',
        color: '#f59e0b',
        weight: 5,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
      })
      layer.addLayer(lineUnder)
      layer.addLayer(lineOver)

      // Small endpoint dots to ensure clean join at marker centers
      const startDot = L.circleMarker([userLocation.latitude, userLocation.longitude], {
        pane: 'linePane',
        radius: 5,
        color: '#f59e0b',
        weight: 2,
        opacity: 1,
        fillColor: '#f59e0b',
        fillOpacity: 1,
      })
      const endDot = L.circleMarker([nearest.st.latitude, nearest.st.longitude], {
        pane: 'linePane',
        radius: 6,
        color: '#f59e0b',
        weight: 2,
        opacity: 1,
        fillColor: '#f59e0b',
        fillOpacity: 1,
      })
      layer.addLayer(startDot)
      layer.addLayer(endDot)
    }

    // Allow click-to-set user location
    if (map && onLocationChange) {
      const clickHandler = (e: L.LeafletMouseEvent) => {
        onLocationChange(e.latlng.lat, e.latlng.lng)
      }
      map.on('click', clickHandler)
      return () => {
        map.off('click', clickHandler)
      }
    }
  }, [userLocation, allStations, nearest, onLocationChange])

  return (
    <div className="w-full rounded-lg overflow-hidden border border-blue-200 relative z-0" style={{ height: 320 }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      {nearest && (
        <div className="absolute bottom-2 left-2 right-2 md:left-3 md:right-auto bg-white/90 backdrop-blur rounded-md px-2 py-1 text-xs shadow border">
          Nearest station: <span className="font-medium">{nearest.st.name}</span> ({nearest.dist.toFixed(1)} km)
        </div>
      )}
    </div>
  )
}


