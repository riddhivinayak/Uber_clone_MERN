import React, { useState, useContext } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { CaptainDataContext } from '../context/CaptainContext'
import { useNavigate } from 'react-router-dom'
import { response, set } from '../../../Backend/app'
const CaptainSignup = () => {
  const navigate = useNavigate()
  // 🔹 basic info
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // 🔹 vehicle (FLAT state)
  const [color, setColor] = useState('')
  const [plate, setPlate] = useState('')
  const [capacity, setCapacity] = useState('')
  const [vehicleType, setVehicleType] = useState('car')

  const { setCaptain } = useContext(CaptainDataContext)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    if (!firstName || !lastName) {
      alert('Enter full name')
      return
    }

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`

      const { data } = await axios.post('/captain/register', {
      fullname: {
      firstname: firstName,
      lastname: lastName
      },
      email,
     password,
     vehicle: {
     color,
     plate,
     capacity: Number(capacity),
     vehicleType
    }

      })
      if(response.status === 201){
        alert('Captain registered successfully!')
        setCaptain(data.captain)
         localStorage.setItem('token', data.token)
         navigate('/captains/home')
      }

      
      

      
      // reset
      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')
      setColor('')
      setPlate('')
      setCapacity('')
      setVehicleType('car')

    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Captain Signup
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          {/* 🚗 VEHICLE SECTION */}
          <h3 className="font-semibold mt-4">Vehicle Details</h3>

          <input
            type="text"
            placeholder="Vehicle Color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="text"
            placeholder="Plate Number"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="number"
            placeholder="Capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="car">Car</option>
            <option value="motorcycle">Motorcycle</option>
            <option value="auto">Auto</option>
          </select>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded"
          >
            Signup
          </button>

          <p className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/captains/login" className="text-blue-500">
              Login
            </Link>
          </p>

        </form>
      </div>
    </div>
  )
}

export default CaptainSignup