import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const containerStyle = {
    width: '100%',
    height: '100%',
    position: 'relative',
    zIndex: 0,
}

const center = {
    lat: -3.745,
    lng: -38.523
}

const LiveTracking = () => {
    const [currentPosition, setCurrentPosition] = useState(center)

    useEffect(() => {
        // Get initial position
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords
            setCurrentPosition({
                lat: latitude,
                lng: longitude
            })
        })

        // Watch position for updates
        const watchId = navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords
            setCurrentPosition({
                lat: latitude,
                lng: longitude
            })
        })

        return () => navigator.geolocation.clearWatch(watchId)
    }, [])

    return (
        <MapContainer
            center={[currentPosition.lat, currentPosition.lng]}
            zoom={15}
            scrollWheelZoom={false}
            style={containerStyle}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[currentPosition.lat, currentPosition.lng]}>
                <Popup>
                    Your current location
                </Popup>
            </Marker>
        </MapContainer>
    )
}

export default LiveTracking