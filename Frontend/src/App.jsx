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
//import CaptainLogout from './Pages/CaptainLogout'
const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Start/>} />
        <Route path="/users/login" element={<UserLogin/>} />
        <Route path="/users/signup" element={<UserSignup/>} />
        <Route path="/captains/login" element={<Captainlogin/>} />
        <Route path="/captains/signup" element={<CaptainSignup/>} />
        <Route path ="/home" element={<UserProtectedWrapper><Home/></UserProtectedWrapper>
        } />
        <Route path="/users/logout" element={<UserProtectedWrapper><UserLogout/></UserProtectedWrapper>} />
        {/* <Route path="/captains/logout" element={<CaptainLogout/>} /> */}
        <Route path="/captains/home" element={<CaptainHome/>} />
      </Routes>
    </div>
  )
}

export default App
