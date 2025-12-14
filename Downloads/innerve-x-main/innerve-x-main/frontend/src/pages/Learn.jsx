import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Clock, BookOpen } from 'lucide-react'

export default function Learn() {
  const courses = [
    {
      id: 'budgeting-basics',
      title: 'Budgeting Basics',
      description: 'Learn the fundamentals of creating and managing a personal budget',
      level: 'beginner',
      duration: 15,
      lessons: 2,
      icon: '📊',
      color: 'bg-gradient-to-br from-green-400 to-teal-500'
    },
    {
      id: 'emergency-fund',
      title: 'Building an Emergency Fund',
      description: 'Learn why emergency funds are crucial and how to build one',
      level: 'beginner',
      duration: 12,
      lessons: 2,
      icon: '🛡️',
      color: 'bg-gradient-to-br from-blue-400 to-blue-600'
    },
    {
      id: 'debt-management',
      title: 'Debt Management Strategies',
      description: 'Learn effective strategies to pay off debt and avoid future debt problems',
      level: 'intermediate',
      duration: 20,
      lessons: 3,
      icon: '💳',
      color: 'bg-gradient-to-br from-orange-400 to-red-500'
    },
    {
      id: 'investment-fundamentals',
      title: 'Investment Fundamentals',
      description: 'Introduction to investing and building long-term wealth',
      level: 'intermediate',
      duration: 25,
      lessons: 4,
      icon: '📈',
      color: 'bg-gradient-to-br from-purple-400 to-purple-600'
    },
  ]

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-700'
      case 'intermediate':
        return 'bg-orange-100 text-orange-700'
      case 'advanced':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Financial Education</h1>
          <p className="text-gray-600 mt-1">Build your financial knowledge with our comprehensive courses</p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1">
              {/* Icon Header */}
              <div className={`h-24 ${course.color} flex items-center justify-center`}>
                <span className="text-5xl">{course.icon}</span>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{course.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{course.description}</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 mb-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Clock size={14} />
                    <span>{course.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <BookOpen size={14} />
                    <span>{course.lessons} lessons</span>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  to={`/learn/${course.id}`}
                  className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg text-center transition-all duration-200 hover:scale-105 hover:shadow-md"
                >
                  Start Learning
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Tax Planning', icon: '📋' },
              { title: 'Retirement Planning', icon: '🏖️' },
              { title: 'Insurance Basics', icon: '🛡️' },
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-100 rounded-2xl p-6 text-center">
                <span className="text-4xl mb-3 block">{item.icon}</span>
                <h3 className="font-medium text-gray-600">{item.title}</h3>
                <p className="text-sm text-gray-400 mt-1">Coming soon</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
