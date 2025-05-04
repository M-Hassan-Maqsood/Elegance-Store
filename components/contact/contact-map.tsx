"use client"

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Define default coordinates (you can change these to your actual store location)
const DEFAULT_CENTER = [40.7128, -74.0060] // New York City coordinates
const DEFAULT_ZOOM = 13

const ContactMap = () => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  // Initialize map on component mount
  useEffect(() => {
    if (!mapRef.current) return
    
    // Create map instance if it doesn't exist yet
    if (!mapInstanceRef.current) {
      // Initialize the map
      const map = L.map(mapRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM)
      
      // Add OpenStreetMap tile layer (completely free)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)
      
      // Add marker for store location
      const storeIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
      
      // Add marker with popup
      L.marker(DEFAULT_CENTER, { icon: storeIcon })
        .addTo(map)
        .bindPopup(`
          <strong>ELEGANCE Clothing Store</strong><br>
          123 Fashion Avenue<br>
          Stylish City, SC 12345<br>
          <a href="tel:+15551234567">(555) 123-4567</a>
        `)
        .openPopup()
        
      // Store map instance in ref
      mapInstanceRef.current = map
    }
    
    // Clean up map when component unmounts
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return <div ref={mapRef} className="h-full w-full" />
}

export default ContactMap