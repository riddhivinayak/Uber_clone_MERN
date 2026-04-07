import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CaptainDetails from '../components/CaptainDetails'
import RidePopUp from '../components/RidePopUp'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ConfirmRidePopUp from '../components/ConfirmRidePopUp'
import { useEffect, useContext } from 'react'
import { SocketContext } from '../context/SocketContext'
import { CaptainDataContext } from '../context/CaptainContext'
import axios from 'axios'

const CaptainHome = () => {

    const [ ridePopupPanel, setRidePopupPanel ] = useState(false)
    const [ confirmRidePopupPanel, setConfirmRidePopupPanel ] = useState(false)

    const ridePopupPanelRef = useRef(null)
    const confirmRidePopupPanelRef = useRef(null)
    const [ ride, setRide ] = useState(null)

    const { socket } = useContext(SocketContext)
    const { captain } = useContext(CaptainDataContext)

    useEffect(() => {
        if (!captain?._id || !socket) return

        const joinCaptain = () => {
            console.log('Captain joining socket room:', captain._id)
            socket.emit('join', {
                userId: captain._id,
                userType: 'captain'
            })
        }

        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    socket.emit('update-location-captain', {
                        userId: captain._id,
                        location: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    })
                })
            }
        }

        const handleNewRide = (data) => {
            console.log('CaptainHome received new-ride', data)
            setRide(data)
            setRidePopupPanel(true)
        }

        socket.on('connect', joinCaptain)
        socket.on('new-ride', handleNewRide)

        joinCaptain()
        const locationInterval = setInterval(updateLocation, 10000)
        updateLocation()

        return () => {
            clearInterval(locationInterval)
            socket.off('connect', joinCaptain)
            socket.off('new-ride', handleNewRide)
        }
    }, [captain, socket])

    async function confirmRide() {
        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/confirm`, {
                rideId: ride._id,
                captainId: captain._id,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })

            return response.status === 200
        } catch (error) {
            console.error('Ride confirm failed:', error?.response?.data || error.message || error)
            return false
        }
    }


    useGSAP(function () {
        if (!ridePopupPanelRef.current) return

        if (ridePopupPanel) {
            gsap.to(ridePopupPanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(ridePopupPanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ ridePopupPanel ])

    useGSAP(function () {
        if (!confirmRidePopupPanelRef.current) return

        if (confirmRidePopupPanel) {
            gsap.to(confirmRidePopupPanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(confirmRidePopupPanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ confirmRidePopupPanel ])

    return (
        <div className='h-screen'>
            <div className='fixed p-6 top-0 flex items-center justify-between w-screen z-40'>
                <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
                <Link to='/captains/home' className=' h-10 w-10 bg-white flex items-center justify-center rounded-full'>
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>
            <div className='h-3/5'>
                <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />

            </div>
            <div className='h-2/5 p-6'>
                <CaptainDetails />
            </div>
            {ridePopupPanel && ride && <div className='fixed inset-0 z-30 bg-black/50'></div>}
            {ridePopupPanel && ride && (
                <div ref={ridePopupPanelRef} className='fixed w-full z-50 bottom-0 translate-y-full bg-white px-3 py-10 pt-16 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto transition-transform duration-300 ease-out'>
                    <RidePopUp
                        ride={ride}
                        setRidePopupPanel={setRidePopupPanel}
                        setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                        confirmRide={confirmRide}
                    />
                </div>
            )}
            {confirmRidePopupPanel && ride && <div className='fixed inset-0 z-50 bg-black/50'></div>}
            {confirmRidePopupPanel && ride && (
                <div ref={confirmRidePopupPanelRef} className='fixed w-full h-screen z-60 bottom-0 translate-y-full bg-white px-3 py-10 pt-16 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto transition-transform duration-300 ease-out'>
                    <ConfirmRidePopUp
                        ride={ride}
                        setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                        setRidePopupPanel={setRidePopupPanel}
                    />
                </div>
            )}
        </div>
    )
}

export default CaptainHome