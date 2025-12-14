import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../App'
import { transactionsAPI, goalsAPI } from '../services/api'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Plus,
  Activity,
  Smile,
  Meh,
  ChevronRight
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  const [dashboardData, setDashboardData] = useState({
    financialHealthScore: 0,
    overallHealth: 0,
    savingsRate: 0,
    expenseRatio: 0,
    totalIncome: 0,
    totalExpenses: 0,
    currentBalance: 0,
    goals: [],
    recentTransactions: []
  })
  const [showSummary, setShowSummary] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [txData, goalsData] = await Promise.all([
        transactionsAPI.list().catch(() => []),
        goalsAPI.list().catch(() => [])
      ])

      const transactions = Array.isArray(txData) ? txData : (txData.data || [])
      const goals = Array.isArray(goalsData) ? goalsData : []

      // Calculate real financial metrics
      const totalIncome = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0)
      
      const totalExpenses = Math.abs(transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0))
      
      const currentBalance = totalIncome - totalExpenses
      const savingsRate = totalIncome > 0 ? (currentBalance / totalIncome * 100) : 0
      const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome * 100) : 0
      
      // Calculate health score
      let healthScore = 5.0
      if (savingsRate > 20) healthScore += 2.5
      else if (savingsRate > 10) healthScore += 1.5
      if (totalExpenses < totalIncome * 0.8) healthScore += 1.5
      if (goals.length > 0) healthScore += 1.0
      healthScore = Math.min(10.0, Math.max(0, healthScore))

      const overallHealth = Math.min(100, savingsRate * 1.2)

      // Process goals with calculated progress
      const processedGoals = goals.map(goal => {
        const progress = (goal.current_amount / goal.target_amount) * 100
        const daysLeft = Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24))
        return {
          id: goal.id,
          name: goal.name,
          current: goal.current_amount,
          target: goal.target_amount,
          daysLeft: Math.max(0, daysLeft),
          progress: Math.min(100, progress)
        }
      })

      setDashboardData({
        financialHealthScore: healthScore,
        overallHealth,
        savingsRate,
        expenseRatio,
        totalIncome,
        totalExpenses,
        currentBalance,
        goals: processedGoals,
        recentTransactions: transactions.slice(0, 3)
      })
    } catch (error) {
      console.error('Failed to load dashboard data', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(Math.abs(amount))
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, <span className="bg-gradient-to-r from-orange-500 to-teal-600 bg-clip-text text-transparent">{user?.full_name || 'User'}</span>
            </h1>
            <h2 className="text-lg text-gray-700 mt-2\">Your Current Balance</h2>
            <p className="text-gray-500 text-sm mt-1\">
              Your financial overview for {formatDate(currentDate)}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-medium text-sm">Live Data</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Health Score Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Financial Health Score</h3>
                    <p className="text-sm text-gray-500">Your overall financial wellness</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {dashboardData.financialHealthScore}<span className="text-lg text-gray-400">/10</span>
                  </div>
                  <span className="text-green-600 text-sm font-medium flex items-center justify-end gap-1">
                    <TrendingUp size={14} />
                    Excellent
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Overall Health</span>
                  <span className="font-medium text-green-600">{dashboardData.overallHealth}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000"
                    style={{ width: `${dashboardData.overallHealth}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Smile className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">+{dashboardData.savingsRate.toFixed(2)}%</div>
                  <p className="text-sm text-gray-600">Savings Rate</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Meh className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{dashboardData.expenseRatio.toFixed(2)}%</div>
                  <p className="text-sm text-gray-600">Expense Ratio</p>
                </div>
              </div>

              {/* Financial Summary Accordion */}
              <div className="mt-6 border-t pt-4">
                <button 
                  onClick={() => setShowSummary(!showSummary)}
                  className="w-full flex items-center justify-between text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <span className="font-medium">Financial Summary</span>
                  <ChevronRight size={20} className={`transition-transform duration-200 ${showSummary ? 'rotate-90' : ''}`} />
                </button>
                {showSummary && (
                  <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Income:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(dashboardData.totalIncome)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Expenses:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(dashboardData.totalExpenses)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-gray-900 font-medium">Net Balance:</span>
                      <span className={`font-bold ${dashboardData.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(dashboardData.currentBalance)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Savings Rate:</span>
                      <span className="font-semibold text-teal-600">{dashboardData.savingsRate.toFixed(1)}%</span>
                    </div>
                    <Link
                      to="/insights"
                      className="block w-full text-center bg-orange-50 hover:bg-orange-100 text-orange-600 py-2 rounded-lg text-sm font-medium transition-colors mt-3"
                    >
                      View Detailed Insights →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600 text-sm">Total Income</span>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.totalIncome)}</div>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600 text-sm">Total Expenses</span>
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.totalExpenses)}</div>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
            </div>

            {/* Current Balance */}
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 shadow-md text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Current Balance</span>
                <Activity className="w-5 h-5 text-white/80" />
              </div>
              <div className="text-3xl font-bold">{formatCurrency(dashboardData.currentBalance)}</div>
              <p className="text-xs text-white/70 mt-1">Income - Expenses</p>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Financial Coach Card */}
            <Link to="/coach" className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-orange-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">😊</span>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-600">Financial Coach</h4>
                  <p className="text-xs text-gray-500">Streak: <span className="text-orange-500 font-medium">0 days</span></p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Great job! Your finances are looking healthy!
              </p>
            </Link>

            {/* Goal Progress Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  <h4 className="font-semibold text-orange-600">Goal Progress</h4>
                </div>
                <Link to="/goals" className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                  View All
                  <ChevronRight size={16} />
                </Link>
              </div>
              <p className="text-sm text-gray-500 mb-4">Your financial targets</p>

              {dashboardData.goals.map(goal => (
                <Link to="/goals" key={goal.id} className="block border rounded-xl p-4 hover:border-orange-300 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-500">{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">→ {goal.progress}%</span>
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>📅 {goal.daysLeft} days left</span>
                    <span className="text-green-600 font-medium">Good progress</span>
                  </div>
                </Link>
              ))}

              <Link
                to="/goals?create=true"
                className="w-full mt-4 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-orange-50 transition-all duration-200"
              >
                <Plus size={16} />
                Add New Goal
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h4 className="font-semibold text-gray-900 mb-4">Recent Transactions</h4>
              <div className="space-y-3">
                {dashboardData.recentTransactions.slice(0, 3).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {tx.type === 'income' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                        <p className="text-xs text-gray-500">{tx.category}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
              <Link 
                to="/transactions" 
                className="block mt-4 text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                View All Transactions →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
