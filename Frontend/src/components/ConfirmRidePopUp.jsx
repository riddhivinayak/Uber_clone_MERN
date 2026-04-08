import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const ConfirmRidePopUp = (props) => {

    const [otp, setOtp] = useState('')
    const navigate = useNavigate()

    // 🚨 FULL SAFETY GUARD
    if (!props.ride || !props.ride.user) {
        return (
            <div className='p-6 text-center'>
                <p className='text-lg font-semibold'>Ride data is loading...</p>
                <button
                    onClick={() => props.setConfirmRidePopupPanel(false)}
                    className='mt-4 w-full bg-gray-500 text-white p-3 rounded-lg'
                >
                    Close
                </button>
            </div>
        )
    }

    // ✅ SAFE USER NAME
    const userName =
        props.ride?.user?.fullname?.firstname && props.ride?.user?.fullname?.lastname
            ? `${props.ride.user.fullname.firstname} ${props.ride.user.fullname.lastname}`
            : "Unknown User"

    const submitHandler = async (e) => {
        e.preventDefault()

        if (!props.ride?._id) {
            console.error('No ride data available')
            return
        }

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/rides/start-ride`,
                {
                    params: {
                        rideId: props.ride._id,
                        otp: otp
                    },
                    headers: {
                        // ✅ FIXED TOKEN
                        Authorization: `Bearer ${localStorage.getItem('captainToken')}`
                    }
                }
            )

            if (response.status === 200) {
                props.setConfirmRidePopupPanel(false)
                props.setRidePopupPanel(false)

                navigate('/captains/riding', {
                    state: { ride: props.ride }
                })
            }

        } catch (error) {
            console.error('Ride start failed:', error?.response?.data || error.message)
        }
    }

    return (
        <div className='relative'>

            {/* Close */}
            <h5
                className='p-1 text-center w-[93%] absolute top-0 cursor-pointer'
                onClick={() => props.setConfirmRidePopupPanel(false)}
            >
                <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
            </h5>

            <h3 className='text-2xl font-semibold mb-5'>
                Confirm this ride to Start
            </h3>

            {/* User */}
            <div className='flex items-center justify-between p-3 border-2 border-yellow-400 rounded-lg mt-4'>
                <div className='flex items-center gap-3'>
                    <img
                        className='h-12 w-12 rounded-full object-cover'
                        src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg"
                        alt=""
                    />
                    <h2 className='text-lg font-medium capitalize'>
                        {userName}
                    </h2>
                </div>

                <h5 className='text-lg font-semibold'>2.2 KM</h5>
            </div>

            {/* Details */}
            <div className='flex flex-col gap-2 items-center'>
                <div className='w-full mt-5'>

                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Pickup</h3>
                            <p className='text-sm text-gray-600'>
                                {props.ride?.pickup}
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Destination</h3>
                            <p className='text-sm text-gray-600'>
                                {props.ride?.destination}
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>
                                ₹{props.ride?.fare}
                            </h3>
                            <p className='text-sm text-gray-600'>Cash Payment</p>
                        </div>
                    </div>

                </div>

                {/* OTP */}
                <div className='mt-6 w-full'>
                    <form onSubmit={submitHandler}>

                        <input
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            type="text"
                            className='bg-[#eee] px-6 py-4 font-mono text-lg rounded-lg w-full mt-3'
                            placeholder='Enter OTP'
                        />

                        <button
                            type='submit'
                            className='w-full mt-5 bg-green-600 text-white p-3 rounded-lg'
                        >
                            Confirm
                        </button>

                        <button
                            type='button'
                            onClick={() => {
                                props.setConfirmRidePopupPanel(false)
                                props.setRidePopupPanel(false)
                            }}
                            className='w-full mt-2 bg-red-600 text-white p-3 rounded-lg'
                        >
                            Cancel
                        </button>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default ConfirmRidePopUp