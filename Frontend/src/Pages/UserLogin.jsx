import React, { useState } from 'react'
import axios from 'axios'
import { Link , useNavigate} from 'react-router-dom'
import { UserdataContext } from '../context/UserContext'
const UserLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userdata, setUserdata] = useState(null)
  const navigate = useNavigate()

  const { user, setUser } = React.useContext(UserdataContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
       const UserData={
        email: email.trim(),
        password: password
       }
       const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, UserData)
       if(response.status === 200){
        const data = response.data
        setUser(data.user)
        localStorage.setItem('token', data.token)
        navigate('users/home')
       }
       
      setEmail('')
      setPassword('')
      
      }


    
  
    
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Uber Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black mb-2">Uber</h1>
          <h2 className="text-2xl font-semibold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* Login Button */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-150"
                >
                  Sign in
                </button>
              </div>

              {/* Signup Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  New to Uber?{' '}
                  <Link
                    to="/users/signup"
                    className="font-medium text-black hover:text-gray-800 transition duration-150"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Captain Signup Link - Separate at bottom */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Want to drive with Uber?{' '}
            <Link
              to="/captains/login"
              className="font-medium text-black hover:text-gray-800 transition duration-150"
            >
              Sign in as Captain
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default UserLogin
