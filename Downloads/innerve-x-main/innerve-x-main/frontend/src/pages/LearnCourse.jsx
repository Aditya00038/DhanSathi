import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { ArrowLeft, Clock, BookOpen, CheckCircle2 } from 'lucide-react'

export default function LearnCourse() {
  const { courseId } = useParams()
  const [activeTab, setActiveTab] = useState('lessons')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)

  // Course data
  const courses = {
    'budgeting-basics': {
      title: 'Budgeting Basics',
      description: 'Learn the fundamentals of creating and managing a personal budget',
      level: 'beginner',
      duration: 15,
      lessons: [
        {
          id: 1,
          title: 'What is Budgeting?',
          content: `Budgeting is the process of creating a plan for how you'll spend your money. It's like a roadmap for your finances that helps you:

• Track where your money goes
• Ensure you have enough for necessities
• Save for future goals
• Avoid overspending and debt

A budget is simply a comparison between your income (money coming in) and your expenses (money going out). The goal is to make sure your expenses don't exceed your income, and ideally, to have money left over for savings.`
        },
        {
          id: 2,
          title: 'The 50/30/20 Rule',
          content: `One of the most popular budgeting methods is the 50/30/20 rule:

• 50% for Needs: Essential expenses like rent, utilities, groceries, and healthcare
• 30% for Wants: Non-essential spending like entertainment, dining out, and hobbies
• 20% for Savings: Emergency fund, retirement, and financial goals

This simple framework helps you balance current needs with future security. Start by tracking your spending for a month to see where your money currently goes.`
        }
      ],
      quiz: [
        {
          question: 'According to the 50/30/20 rule, what percentage of your income should go to savings?',
          options: ['10%', '20%', '30%', '50%'],
          correct: 1
        },
        {
          question: 'What category would "dining out at restaurants" fall under in the 50/30/20 rule?',
          options: ['Needs', 'Wants', 'Savings', 'None'],
          correct: 1
        },
        {
          question: 'What is the primary goal of budgeting?',
          options: [
            'To restrict all spending',
            'To track and plan your money usage',
            'To save 100% of income',
            'To avoid paying taxes'
          ],
          correct: 1
        }
      ]
    },
    'emergency-fund': {
      title: 'Building an Emergency Fund',
      description: 'Learn why emergency funds are crucial and how to build one',
      level: 'beginner',
      duration: 12,
      lessons: [
        {
          id: 1,
          title: 'Why You Need an Emergency Fund',
          content: `An emergency fund is money set aside for unexpected expenses or financial hardships. Life is unpredictable - you might face:

• Medical emergencies
• Job loss
• Car repairs
• Home repairs
• Family emergencies

Without an emergency fund, you might have to rely on credit cards or loans, leading to debt. Having 3-6 months of expenses saved provides peace of mind and financial security.`
        },
        {
          id: 2,
          title: 'How to Build Your Fund',
          content: `Building an emergency fund takes time and discipline:

1. Set a target: Aim for 3-6 months of essential expenses
2. Start small: Even ₹500/month adds up
3. Automate: Set up automatic transfers to a separate savings account
4. Cut unnecessary expenses: Redirect that money to your fund
5. Use windfalls wisely: Put bonuses or tax refunds into your fund

Keep your emergency fund in a high-yield savings account - accessible but separate from daily spending.`
        }
      ],
      quiz: [
        {
          question: 'How many months of expenses should you ideally save for emergencies?',
          options: ['1-2 months', '3-6 months', '12-24 months', '36 months'],
          correct: 1
        },
        {
          question: 'Where should you keep your emergency fund?',
          options: ['Under your mattress', 'In stocks', 'In a separate savings account', 'In cryptocurrency'],
          correct: 2
        }
      ]
    },
    'debt-management': {
      title: 'Debt Management Strategies',
      description: 'Learn effective strategies to pay off debt and avoid future debt problems',
      level: 'intermediate',
      duration: 20,
      lessons: [
        {
          id: 1,
          title: 'Understanding Debt',
          content: `Not all debt is created equal. Understanding the difference helps you prioritize:

Good Debt: Investments that can increase in value or generate income
• Education loans
• Home loans
• Business loans

Bad Debt: Borrowing for depreciating assets or consumption
• Credit card debt
• Personal loans for lifestyle expenses
• Car loans for luxury vehicles

The key is to minimize bad debt while using good debt strategically.`
        }
      ],
      quiz: [
        {
          question: 'Which is generally considered "good debt"?',
          options: ['Credit card debt', 'Education loan', 'Personal loan for vacation', 'Payday loan'],
          correct: 1
        }
      ]
    },
    'investment-fundamentals': {
      title: 'Investment Fundamentals',
      description: 'Introduction to investing and building long-term wealth',
      level: 'intermediate',
      duration: 25,
      lessons: [
        {
          id: 1,
          title: 'Why Invest?',
          content: `Investing helps your money grow faster than inflation:

• Savings accounts: ~3-4% interest
• Inflation in India: ~5-6%
• Stock market average returns: ~12-15%

Keeping all money in savings means losing purchasing power over time. Investing helps you:
• Build wealth for retirement
• Achieve financial goals faster
• Create passive income
• Beat inflation`
        }
      ],
      quiz: [
        {
          question: 'What is the primary advantage of investing over keeping money in savings?',
          options: ['It\'s safer', 'It beats inflation', 'It\'s more liquid', 'No risk involved'],
          correct: 1
        }
      ]
    }
  }

  const course = courses[courseId] || courses['budgeting-basics']
  const currentQuiz = course.quiz[currentQuestion]

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index)
  }

  const handleNext = () => {
    if (currentQuestion < course.quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    } else {
      setShowResult(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/learn" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={18} />
          Back to Education
        </Link>

        {/* Course Header */}
        <div className="mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-orange-500">{course.title}</h1>
              <p className="text-gray-600 mt-1">{course.description}</p>
            </div>
          </div>
          
          {/* Meta */}
          <div className="flex items-center gap-4 mt-4">
            <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
              {course.level}
            </span>
            <div className="flex items-center gap-1 text-gray-500">
              <Clock size={16} />
              <span>{course.duration} minutes</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <BookOpen size={16} />
              <span>{course.lessons.length} lessons</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 rounded-xl p-1 inline-flex mb-6">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-8 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'lessons'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Lessons
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-8 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'quiz'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Quiz
          </button>
        </div>

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            {course.lessons.map((lesson, idx) => (
              <div key={lesson.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                    {idx + 1}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{lesson.title}</h3>
                </div>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {lesson.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && !showResult && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold text-gray-900">Quiz Time!</span>
                <span className="text-orange-500">🎯</span>
              </div>
              <span className="text-gray-500">Question {currentQuestion + 1} of {course.quiz.length}</span>
            </div>

            <p className="text-gray-600 mb-4">Test your knowledge with this interactive quiz</p>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / course.quiz.length) * 100}%` }}
              ></div>
            </div>

            {/* Question */}
            <div className="bg-blue-600 text-white p-4 rounded-xl mb-6">
              <p className="font-medium">{currentQuiz.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQuiz.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    selectedAnswer === idx
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === idx
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswer === idx && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-700">{option}</span>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Quiz Results */}
        {activeTab === 'quiz' && showResult && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
            <p className="text-gray-600 mb-6">Great job completing the {course.title} quiz!</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setCurrentQuestion(0)
                  setSelectedAnswer(null)
                  setShowResult(false)
                }}
                className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Retake Quiz
              </button>
              <Link
                to="/learn"
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
              >
                Back to Courses
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
