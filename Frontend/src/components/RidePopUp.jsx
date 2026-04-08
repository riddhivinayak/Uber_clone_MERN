import React, { useState } from 'react'

const RidePopUp = (props) => {

    const [error, setError] = useState('')

    const handleAccept = async () => {
        if (!props.ride?._id) {
            setError('Ride data is unavailable. Please wait.')
            return
        }

        try {
            const success = await props.confirmRide()

            if (success) {
                props.setRidePopupPanel(false)
                props.setConfirmRidePopupPanel(true)
            } else {
                setError('Unable to accept ride. Please try again.')
            }

        } catch (err) {
            console.error(err)
            setError('Something went wrong. Try again.')
        }
    }

    // 🚨 prevent crash
    if (!props.ride || !props.ride.user) {
        return (
            <div className='p-6 text-center'>
                <p className='text-lg font-semibold'>Ride data is loading...</p>
                <button
                    onClick={() => props.setRidePopupPanel(false)}
                    className='mt-4 w-full bg-gray-500 text-white p-3 rounded-lg'
                >
                    Close
                </button>
            </div>
        )
    }

    // ✅ safe user name
    const userName =
        props.ride?.user?.fullname?.firstname && props.ride?.user?.fullname?.lastname
            ? `${props.ride.user.fullname.firstname} ${props.ride.user.fullname.lastname}`
            : "Unknown User"

    return (
        <div className='relative'>

            <h5
                className='p-1 text-center w-[93%] absolute top-0 cursor-pointer'
                onClick={() => props.setRidePopupPanel(false)}
            >
                <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
            </h5>

            <h3 className='text-3xl font-bold mb-5 text-green-600'>
                🎉 New Ride Available!
            </h3>

            <div className='flex items-center justify-between p-4 bg-yellow-400 rounded-lg mt-4'>
                <div className='flex items-center gap-3'>
                    <img
                        className='h-14 w-14 rounded-full object-cover'
                        src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg"
                        alt=""
                    />
                    <h2 className='text-lg font-bold'>{userName}</h2>
                </div>

                <h5 className='text-lg font-semibold bg-white px-3 py-1 rounded-full'>
                    2.2 KM
                </h5>
            </div>

            <div className='flex flex-col gap-2 items-center'>

                <div className='w-full mt-5'>

                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-2xl text-green-600 ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-semibold'>Pickup</h3>
                            <p className='text-sm text-gray-600'>{props.ride?.pickup}</p>
                        </div>
                    </div>

                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-2xl text-red-600 ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-semibold'>Destination</h3>
                            <p className='text-sm text-gray-600'>{props.ride?.destination}</p>
                        </div>
                    </div>

                    <div className='flex items-center gap-5 p-3 bg-blue-50 rounded-lg'>
                        <i className="text-2xl text-blue-600 ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-bold text-blue-600'>
                                ₹{props.ride?.fare}
                            </h3>
                            <p className='text-sm text-gray-600'>Cash Payment</p>
                        </div>
                    </div>

                </div>

                <div className='mt-5 w-full flex flex-col gap-3'>

                    <button
                        onClick={handleAccept}
                        className='bg-green-600 w-full text-white font-bold p-4 rounded-lg'
                    >
                        ✓ Accept Ride
                    </button>

                    <button
                        onClick={() => props.setRidePopupPanel(false)}
                        className='bg-gray-400 w-full text-white font-bold p-3 rounded-lg'
                    >
                        ✕ Reject
                    </button>

                    {error && <p className='text-red-600 text-sm'>{error}</p>}

                </div>

            </div>
        </div>
    )
}

export default RidePopUp