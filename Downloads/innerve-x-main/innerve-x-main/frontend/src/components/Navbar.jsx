import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  MessageCircle, 
  BookOpen, 
  Lightbulb,
  ChevronDown,
  LogOut
} from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transactions', icon: Receipt },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/coach', label: 'AI Coach', icon: MessageCircle },
    { path: '/learn', label: 'Learn', icon: BookOpen },
    { path: '/insights', label: 'Insights', icon: Lightbulb },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U'
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">₹</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-none">DhanSathi</h1>
              <p className="text-xs text-orange-500">AI Financial Companion</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-orange-600 bg-orange-50 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Online Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700 font-medium">Online</span>
            </div>

            {/* Google Translate Widget - Hidden but functional */}
            <div id="google_translate_element" className="hidden"></div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-lg"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                  {getInitial(user?.full_name)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500">Premium Member</p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium">{user?.full_name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t overflow-x-auto">
        <div className="flex px-2 py-2 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
