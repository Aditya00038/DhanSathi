import { Link } from 'react-router-dom'

export default function LandingNavbar() {
  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">₹</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-none">DhanSathi</h1>
              <p className="text-xs text-gray-500">AI Financial Companion</p>
            </div>
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <Link 
              to="/signin" 
              className="text-gray-700 hover:text-gray-900 font-medium px-4 py-2"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
