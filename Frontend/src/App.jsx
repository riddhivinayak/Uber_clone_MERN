import React from 'react'
import {Routes, Route} from 'react-router-dom'
import Start from './Pages/Start'
import Home from './Pages/Home'
import UserLogin from './Pages/UserLogin'
import UserSignup from './Pages/UserSignup'
import Captainlogin from './Pages/Captainlogin'
import CaptainSignup from './Pages/CaptainSignup'
import UserProtectedWrapper from './Pages/UserProtectedWrapper'
import UserLogout from './Pages/UserLogout'
import CaptainHome from './Pages/CaptainHome'
import CaptainProtectWrapper from './Pages/CaptainProtectedWrapper'
import CaptainLogout from './Pages/CaptainLogout'
import Riding from './Pages/Riding'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Start/>} />
        <Route path="/users/login" element={<UserLogin/>} />
        <Route path='/users/riding' element={<Riding />} />
        <Route path="/users/signup" element={<UserSignup/>} />
        <Route path="/captains/login" element={<Captainlogin/>} />
        <Route path="/captains/signup" element={<CaptainSignup/>} />
        <Route path ="users/home" element={
          <UserProtectedWrapper>
           <Home/>
          </UserProtectedWrapper>
        } />
        <Route path="/users/logout" element={
          <UserProtectedWrapper>
            <UserLogout/>
          </UserProtectedWrapper>} />
        <Route path="/captains/home" element={
          <CaptainProtectWrapper>
            <CaptainHome/>
          </CaptainProtectWrapper>
        } />
        <Route path="/captains/logout" element={<CaptainLogout/>} /> 
      </Routes>
    </div>
  )
}

export default App
