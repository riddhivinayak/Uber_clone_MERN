import React, { useEffect, useState, useContext } from 'react'
import { UserdataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const UserProtectedWrapper = ({ children }) => {

  const { setUser } = useContext(UserdataContext)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {

    // 🚨 If no token → redirect and STOP execution
    if (!token) {
      navigate('/users/login')
      return
    }

    // 📡 Verify user token
    axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      if (response.status === 200) {
        setUser(response.data.user)
      }
      setIsLoading(false)
    })
    .catch(err => {
      console.error('User auth failed:', err?.response?.data || err.message)

      localStorage.removeItem('token')
      navigate('/users/login')
      setIsLoading(false)
    })

  }, []) // ✅ run only once

  // ⏳ Prevent flicker
  if (isLoading) {
    return <div>Loading...</div>
  }

  return children
}

export default UserProtectedWrapper