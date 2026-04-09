import React, { useEffect, useRef, useState, useContext } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import axios from 'axios'
import 'remixicon/fonts/remixicon.css'

import LocationSearchPanel from '../components/LocationSearchPanel'
import VehiclePanel from '../components/VehiclePanel'
import ConfirmRide from '../components/ConfirmRide'
import LookingForDriver from '../components/LookingForDriver'
import WaitingForDriver from '../components/WaitingForDriver'
import LiveTracking from '../components/LiveTracking'

import { SocketContext } from '../context/SocketContext'
import { UserdataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'

const Home = () => {

    const [pickup, setPickup] = useState('')
    const [destination, setDestination] = useState('')
    const [panelOpen, setPanelOpen] = useState(false)

    const [vehiclePanel, setVehiclePanel] = useState(false)
    const [confirmRidePanel, setConfirmRidePanel] = useState(false)
    const [vehicleFound, setVehicleFound] = useState(false)
    const [waitingForDriver, setWaitingForDriver] = useState(false)

    const [pickupSuggestions, setPickupSuggestions] = useState([])
    const [destinationSuggestions, setDestinationSuggestions] = useState([])
    const [activeField, setActiveField] = useState(null)

    const [fare, setFare] = useState({})
    const [vehicleType, setVehicleType] = useState(null)
    const [ride, setRide] = useState(null)

    const vehiclePanelRef = useRef(null)
    const confirmRidePanelRef = useRef(null)
    const vehicleFoundRef = useRef(null)
    const waitingForDriverRef = useRef(null)
    const panelRef = useRef(null)
    const panelCloseRef = useRef(null)

    const navigate = useNavigate()

    const { socket } = useContext(SocketContext)
    const { user } = useContext(UserdataContext)

    // ✅ JOIN SOCKET
    useEffect(() => {
        if (user?._id && socket) {
            socket.emit("join", {
                userType: "user",
                userId: user._id
            })
        }
    }, [user, socket])

    // ✅ SOCKET LISTENERS (FIXED)
    useEffect(() => {
        if (!socket) return

        socket.on('ride-confirmed', (rideData) => {
            console.log("✅ Ride confirmed:", rideData)

            setVehicleFound(false)
            setWaitingForDriver(true)
            setRide(rideData)
        })

        socket.on('ride-started', (rideData) => {
            console.log("🚀 Ride started:", rideData)

            setWaitingForDriver(false)
            navigate('/riding', { state: { ride: rideData } })
        })

        return () => {
            socket.off('ride-confirmed')
            socket.off('ride-started')
        }

    }, [socket, navigate])

    // 🔍 FETCH SUGGESTIONS
    const fetchSuggestions = async (value, setSuggestions) => {
        if (!value || value.length < 3) {
            setSuggestions([])
            return
        }

        try {
            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
                {
                    params: { input: value },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            )
            setSuggestions(res.data)
        } catch (err) {
            console.error(err)
            setSuggestions([])
        }
    }

    const handlePickupChange = async (e) => {
        const val = e.target.value
        setPickup(val)
        fetchSuggestions(val, setPickupSuggestions)
    }

    const handleDestinationChange = async (e) => {
        const val = e.target.value
        setDestination(val)
        fetchSuggestions(val, setDestinationSuggestions)
    }

    // 🎬 GSAP ANIMATIONS

    useGSAP(() => {
        gsap.to(panelRef.current, {
            height: panelOpen ? '70%' : '0%',
            padding: panelOpen ? 24 : 0
        })
        gsap.to(panelCloseRef.current, {
            opacity: panelOpen ? 1 : 0
        })
    }, [panelOpen])

    useGSAP(() => {
        gsap.to(vehiclePanelRef.current, {
            transform: vehiclePanel ? 'translateY(0)' : 'translateY(100%)'
        })
    }, [vehiclePanel])

    useGSAP(() => {
        gsap.to(confirmRidePanelRef.current, {
            transform: confirmRidePanel ? 'translateY(0)' : 'translateY(100%)'
        })
    }, [confirmRidePanel])

    useGSAP(() => {
        gsap.to(vehicleFoundRef.current, {
            transform: vehicleFound ? 'translateY(0)' : 'translateY(100%)'
        })
    }, [vehicleFound])

    useGSAP(() => {
        gsap.to(waitingForDriverRef.current, {
            transform: waitingForDriver ? 'translateY(0)' : 'translateY(100%)'
        })
    }, [waitingForDriver])

    // 💰 GET FARE
    const findTrip = async () => {
        setVehiclePanel(true)
        setPanelOpen(false)

        try {
            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/rides/get-fare`,
                {
                    params: { pickup, destination },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            )
            setFare(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    // 🚗 CREATE RIDE
    const createRide = async () => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/rides/create`,
                { pickup, destination, vehicleType },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            )

            setRide(res.data)
            return res.data

        } catch (err) {
            console.error(err)
            return null
        }
    }

    return (
        <div className='h-screen relative overflow-hidden'>

            <img
                className='w-16 absolute left-5 top-5 z-40'
                src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
                alt=""
            />

            <LiveTracking />

            {/* INPUT PANEL */}
            <div className='absolute bottom-0 w-full bg-white p-6'>
                <h4 className='text-2xl font-semibold'>Find a trip</h4>

                <input
                    value={pickup}
                    onChange={handlePickupChange}
                    onClick={() => {
                        setPanelOpen(true)
                        setActiveField('pickup')
                    }}
                    className='bg-gray-200 w-full p-2 mt-3'
                    placeholder='Pickup'
                />

                <input
                    value={destination}
                    onChange={handleDestinationChange}
                    onClick={() => {
                        setPanelOpen(true)
                        setActiveField('destination')
                    }}
                    className='bg-gray-200 w-full p-2 mt-3'
                    placeholder='Destination'
                />

                <button
                    onClick={findTrip}
                    className='bg-black text-white w-full mt-3 p-2 rounded'
                >
                    Find Trip
                </button>
            </div>

            {/* VEHICLE PANEL */}
            <div ref={vehiclePanelRef} className='fixed bottom-0 w-full bg-white'>
                <VehiclePanel
                    selectVehicle={setVehicleType}
                    fare={fare}
                    setConfirmRidePanel={setConfirmRidePanel}
                    setVehiclePanel={setVehiclePanel}
                />
            </div>

            {/* CONFIRM PANEL */}
            <div ref={confirmRidePanelRef} className='fixed bottom-0 w-full bg-white'>
                <ConfirmRide
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setConfirmRidePanel={setConfirmRidePanel}
                    setVehicleFound={setVehicleFound}
                />
            </div>

            {/* SEARCHING */}
            <div ref={vehicleFoundRef} className='fixed bottom-0 w-full bg-white'>
                <LookingForDriver
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setVehicleFound={setVehicleFound}
                />
            </div>

            {/* WAITING */}
            <div ref={waitingForDriverRef} className='fixed bottom-0 w-full bg-white'>
                <WaitingForDriver
                    ride={ride}
                    waitingForDriver={waitingForDriver}
                    setWaitingForDriver={setWaitingForDriver}
                />
            </div>

        </div>
    )
}