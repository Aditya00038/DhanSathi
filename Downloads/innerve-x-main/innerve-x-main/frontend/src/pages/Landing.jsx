import { Link } from 'react-router-dom'
import LandingNavbar from '../components/LandingNavbar'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      
      {/* Hero Section */}
      <main className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 pt-20 pb-16">
        <div className="text-center">
          {/* Badge and Money Bag */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full">
              <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="text-orange-700 font-medium text-sm">AI-Powered Financial Guidance</span>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">💰</span>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-sm">💡</span>
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Your Personal <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">AI Financial</span> <span className="bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent">Companion</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-10 leading-relaxed">
            Transform your financial future with personalized AI coaching, smart goal tracking,
            and comprehensive financial education designed for Indians—from gig workers to
            everyday savers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Start Your Journey Free
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link 
              to="/signin" 
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 hover:scale-105 border-2 border-gray-300"
            >
              Sign In
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Trust Badge */}
          <p className="mt-6 text-sm text-gray-500">
            No credit card required • Get started in under 2 minutes
          </p>
        </div>

        {/* Features Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-3">Financial Health Score</h3>
            <p className="text-gray-600 mb-6">Get real-time insights into your financial wellness with our comprehensive scoring system</p>
            <Link to="/signup" className="text-orange-600 font-medium inline-flex items-center gap-2 hover:gap-3 transition-all">
              Learn more
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-3">Smart Goal Tracking</h3>
            <p className="text-gray-600 mb-6">Set and achieve financial goals with AI-powered recommendations and automatic progress tracking</p>
            <Link to="/signup" className="text-teal-600 font-medium inline-flex items-center gap-2 hover:gap-3 transition-all">
              Learn more
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-3">AI Financial Coach</h3>
            <p className="text-gray-600 mb-6">Chat with your personal AI coach for instant financial advice, budgeting tips, and personalized guidance</p>
            <Link to="/signup" className="text-yellow-600 font-medium inline-flex items-center gap-2 hover:gap-3 transition-all">
              Learn more
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-10 border border-orange-200 transition-all duration-300 hover:shadow-xl">
            <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-bold text-2xl text-gray-900 mb-3">Financial Education</h3>
            <p className="text-gray-700 mb-4">Interactive learning modules</p>
            <p className="text-gray-600 mb-6">Master financial literacy with our gamified education system featuring quizzes, badges, and progress tracking.</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Budgeting fundamentals
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Investment strategies
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Debt management
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-10 border border-teal-200 transition-all duration-300 hover:shadow-xl">
            <div className="w-14 h-14 bg-teal-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-bold text-2xl text-gray-900 mb-3">Secure & Private</h3>
            <p className="text-gray-700 mb-4">Your data is protected</p>
            <p className="text-gray-600 mb-6">Bank-level security with end-to-end encryption ensures your financial data stays private and secure.</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                256-bit encryption
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                No data selling
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                GDPR compliant
              </li>
            </ul>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-32">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Trusted by Financial Learners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center transition-all duration-300 hover:shadow-lg hover:scale-105">
              <div className="text-5xl font-bold text-gray-800 mb-2">10K+</div>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center transition-all duration-300 hover:shadow-lg hover:scale-105">
              <div className="text-5xl font-bold text-gray-800 mb-2">$2M+</div>
              <p className="text-gray-600">Money Saved</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center transition-all duration-300 hover:shadow-lg hover:scale-105">
              <div className="text-5xl font-bold text-gray-800 mb-2">95%</div>
              <p className="text-gray-600">Goal Success Rate</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center transition-all duration-300 hover:shadow-lg hover:scale-105">
              <div className="text-5xl font-bold text-gray-800 mb-2">4.9★</div>
              <p className="text-gray-600">User Rating</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-32 bg-gradient-to-r from-orange-500 via-orange-400 to-teal-500 rounded-3xl p-16 text-center text-white">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Finances?</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Join thousands of users who have improved their financial health with DhanSathi's AI-powered coaching platform. Start your journey to financial freedom today.
          </p>
          <Link 
            to="/signup" 
            className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-bold px-10 py-4 rounded-lg text-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl"
          >
            Get Started Free
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  )
}
