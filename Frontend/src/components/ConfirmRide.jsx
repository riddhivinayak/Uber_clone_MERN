import React from 'react'

const ConfirmRide = (props) => {
  return (
    <div>
      <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
        props.setConfirmRidePanel(false)
      }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>

      <h3 className='text-2xl font-semibold mb-5'>Confirm your ride</h3>

      <div className='flex items-center justify-between mb-5'>
        <img className='h-12' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="" />
        <div className='text-right'>
          <h2 className='text-lg font-medium'>2 mins away</h2>
          <p className='text-sm text-gray-600'>Uber Go</p>
        </div>
      </div>

      <div className='flex gap-2 justify-between flex-col items-center'>
        <div className='w-full'>
          <div className='flex items-center gap-5 p-3 border-b-2'>
            <i className="text-lg ri-map-pin-user-fill"></i>
            <div>
              <h3 className='text-lg font-medium'>Pickup</h3>
              <p className='text-sm -mt-1 text-gray-600'>{props.pickup}</p>
            </div>
          </div>
          <div className='flex items-center gap-5 p-3 border-b-2'>
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <h3 className='text-lg font-medium'>Destination</h3>
              <p className='text-sm -mt-1 text-gray-600'>{props.destination}</p>
            </div>
          </div>
          <div className='flex items-center gap-5 p-3'>
            <i className="text-lg ri-currency-line"></i>
            <div>
              <h3 className='text-lg font-medium'>₹{props.fare.car}</h3>
              <p className='text-sm -mt-1 text-gray-600'>Cash Payment</p>
            </div>
          </div>
        </div>
      </div>

      <button disabled={!props.fare?.[props.vehicleType]} onClick={async () => {
        const ride = await props.createRide()
        if (ride) {
          props.setConfirmRidePanel(false)
          props.setVehicleFound(true)
        }
      }} className='w-full mt-5 mb-4 bg-green-600 text-white font-semibold p-4 rounded-lg hover:bg-green-700 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed'>
        Confirm Ride - ₹{props.fare?.[props.vehicleType] ?? props.fare?.car ?? 0}
      </button>
    </div>
  )
}

export default ConfirmRide