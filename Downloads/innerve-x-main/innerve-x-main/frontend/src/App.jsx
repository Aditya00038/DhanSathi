import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useContext, useEffect } from 'react'
import { authAPI } from './services/api'

// Pages
import Landing from './pages/Landing'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Goals from './pages/Goals'
import AICoach from './pages/AICoach'
import Learn from './pages/Learn'
import LearnCourse from './pages/LearnCourse'
import Insights from './pages/Insights'

// Context
export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dhanSathiUser')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verify token on app load
    const token = localStorage.getItem('dhanSathiToken')
    if (token && !user) {
      authAPI.getMe()
        .then(userData => {
          setUser(userData)
          localStorage.setItem('dhanSathiUser', JSON.stringify(userData))
        })
        .catch(() => {
          localStorage.removeItem('dhanSathiToken')
          localStorage.removeItem('dhanSathiUser')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      const tokenData = await authAPI.login(email, password)
      localStorage.setItem('dhanSathiToken', tokenData.access_token)
      
      const userData = await authAPI.getMe()
      setUser(userData)
      localStorage.setItem('dhanSathiUser', JSON.stringify(userData))
      return { success: true }
    } catch (error) {
      // Fallback to demo mode if backend is not running
      if (error.code === 'ERR_NETWORK') {
        const demoUser = {
          id: 1,
          email: email,
          full_name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        }
        setUser(demoUser)
        localStorage.setItem('dhanSathiUser', JSON.stringify(demoUser))
        return { success: true, demo: true }
      }
      
      // Handle validation errors (422)
      let errorMessage = 'Login failed'
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data.detail) {
          if (typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail
          } else if (Array.isArray(error.response.data.detail)) {
            errorMessage = error.response.data.detail.map(e => e.msg).join(', ')
          }
        }
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const register = async (data) => {
    try {
      await authAPI.register(data)
      return await login(data.email, data.password)
    } catch (error) {
      // Fallback to demo mode
      if (error.code === 'ERR_NETWORK') {
        const demoUser = {
          id: 1,
          email: data.email,
          full_name: data.full_name,
        }
        setUser(demoUser)
        localStorage.setItem('dhanSathiUser', JSON.stringify(demoUser))
        return { success: true, demo: true }
      }
      
      // Handle validation errors
      let errorMessage = 'Registration failed'
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data.detail) {
          if (typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail
          } else if (Array.isArray(error.response.data.detail)) {
            errorMessage = error.response.data.detail.map(e => e.msg).join(', ')
          }
        }
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('dhanSathiUser')
    localStorage.removeItem('dhanSathiToken')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-teal-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">₹</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={user ? <Navigate to="/dashboard" /> : <SignIn />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignUp />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/signin" />} />
          <Route path="/transactions" element={user ? <Transactions /> : <Navigate to="/signin" />} />
          <Route path="/goals" element={user ? <Goals /> : <Navigate to="/signin" />} />
          <Route path="/coach" element={user ? <AICoach /> : <Navigate to="/signin" />} />
          <Route path="/learn" element={user ? <Learn /> : <Navigate to="/signin" />} />
          <Route path="/learn/:courseId" element={user ? <LearnCourse /> : <Navigate to="/signin" />} />
          <Route path="/insights" element={user ? <Insights /> : <Navigate to="/signin" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App
