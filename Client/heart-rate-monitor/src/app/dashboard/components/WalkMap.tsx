'use client'

import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Footprints, TrendingUp, RefreshCcw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import L from 'leaflet'
import { useState, useEffect } from 'react'
import axios from 'axios'

// Set custom icons for markers
const iconStart = new L.Icon({
    iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png',
    iconSize: [32, 32],
})
const iconEnd = new L.Icon({
    iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png', // Sneaker icon
    iconSize: [32, 32],
})

const WalkMap = () => {
    const [route, setRoute] = useState([])
    const [isReloading, setIsReloading] = useState(false)
    const steps = 1500
    const distance = 1.2 // in km

    // Function to fetch the route from OpenRouteService API
    const fetchRoute = async () => {
        try {
            const apiKey = '5b3ce3597851110001cf6248d7e353ac3eb24da8a09fbbd86b2821ad' // Replace with your OpenRouteService API key
            const start = [72.8331, 19.0607] // Start point in [lng, lat] format
            const end = [72.8395, 19.0665]   // End point in [lng, lat] format

            const response = await axios.get(`https://api.openrouteservice.org/v2/directions/foot-walking`, {
                params: {
                    api_key: apiKey,
                    start: start.join(','),
                    end: end.join(',')
                }
            })

            const coordinates = response.data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]])
            setRoute(coordinates)
        } catch (error) {
            console.error("Error fetching route:", error)
        }
    }

    // Fetch the route on mount
    useEffect(() => {
        fetchRoute()
    }, [])

    const handleReload = () => {
        setIsReloading(true)
        fetchRoute().finally(() => setIsReloading(false))
    }

    return (
        <div className="flex justify-center">
            <Card className="text-white w-[1250px] bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader className="text-white">
                    <div className="flex justify-between">
                        <CardTitle>Walk Summary</CardTitle>
                        <Button variant="secondary" onClick={handleReload}>
                            <RefreshCcw className={isReloading ? "animate-spin" : ""} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4 text-gray-300">
                        <div className="relative flex items-center space-x-2">
                            <Footprints className="w-5 h-5" />
                            <span className="absolute -top-4 -right-7 bg-red-500 text-white text-xs font-bold rounded-full px-1">
                                {steps}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5" />
                            <span>{distance} km</span>
                        </div>
                    </div>

                    <div className="w-full h-64 rounded-lg overflow-hidden">
                        <MapContainer center={[19.0607, 72.8331]} zoom={16} className="w-full h-full">
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; OpenStreetMap contributors"
                            />
                            <Marker position={[19.0607, 72.8331]} icon={iconStart}>
                                <Popup>Start Point: Bandstand Promenade</Popup>
                            </Marker>
                            <Marker position={[19.0665, 72.8395]} icon={iconEnd}>
                                <Popup>End Point: Linking Road</Popup>
                            </Marker>
                            <Polyline positions={route} color="green" weight={4} />
                        </MapContainer>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <span className="text-gray-400">Last updated: Just now</span>
                    <Button variant="secondary" onClick={handleReload}>
                        Refresh Data
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default WalkMap
