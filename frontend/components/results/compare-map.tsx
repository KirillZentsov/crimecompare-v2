"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { CompareResponse } from "@/types/compare"

const COLOR_A = "#1D9E75"
const COLOR_B = "#378ADD"

// Fix Leaflet's broken default icon URLs in Next.js
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  })
}

interface Props {
  data: CompareResponse
}

export default function CompareMap({ data }: Props) {
  useEffect(() => { fixLeafletIcons() }, [])

  const { coords, radius_meters, postcode_a, postcode_b } = data
  const centerLat = (coords.lat_a + coords.lat_b) / 2
  const centerLng = (coords.lng_a + coords.lng_b) / 2

  // Zoom: fit both circles. Use rough heuristic based on radius.
  const zoom = radius_meters <= 500 ? 14 : radius_meters <= 1200 ? 13 : 12

  return (
    <div className="rounded-lg border border-border overflow-hidden" style={{ height: 320 }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Postcode A */}
        <Circle
          center={[coords.lat_a, coords.lng_a]}
          radius={radius_meters}
          pathOptions={{ color: COLOR_A, fillColor: COLOR_A, fillOpacity: 0.15, weight: 2 }}
        />
        <Marker position={[coords.lat_a, coords.lng_a]}>
          <Popup>{postcode_a}</Popup>
        </Marker>

        {/* Postcode B */}
        <Circle
          center={[coords.lat_b, coords.lng_b]}
          radius={radius_meters}
          pathOptions={{ color: COLOR_B, fillColor: COLOR_B, fillOpacity: 0.15, weight: 2 }}
        />
        <Marker position={[coords.lat_b, coords.lng_b]}>
          <Popup>{postcode_b}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
