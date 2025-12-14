import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { RefreshCw, TrendingUp, TrendingDown, Wallet, Target, PiggyBank, DollarSign, Lightbulb, Sparkles, Award } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { transactionsAPI } from '../services/api'
import '../styles/insights.css'

export default function Insights() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasInsights, setHasInsights] = useState(false)

  const [financialData, setFinancialData] = useState({
    currentBalance: 0,
    lastUpdated: '',
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    savingsRate: 0,
    projectedBalance: 0
  })

  const [incomeBreakdown, setIncomeBreakdown] = useState([])
  const [expenseBreakdown, setExpenseBreakdown] = useState([])
  const [monthlyIncome, setMonthlyIncome] = useState([])
  const [monthlyExpenses, setMonthlyExpenses] = useState([])
  const [spendingByCategory, setSpendingByCategory] = useState([])
  const [expenseByNecessity, setExpenseByNecessity] = useState([])

  useEffect(() => {
    loadInsights()
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const loadInsights = async () => {
    setIsGenerating(true)
    try {
      const data = await transactionsAPI.list()
      const txns = Array.isArray(data) ? data : (data?.data || [])

      const totalIncome = txns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
      const totalExpensesRaw = txns.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)
      const totalExpenses = Math.abs(totalExpensesRaw)
      const totalSavings = totalIncome - totalExpenses
      const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome * 100) : 0
      const currentBalance = totalSavings
      const projectedBalance = currentBalance // Already includes all savings

      const formatMonth = (ts) => {
        const d = new Date(ts || new Date())
        return d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      }

      const monthlyMap = {}
      txns.forEach(t => {
        const key = formatMonth(t.timestamp || t.date)
        if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 }
        if (t.amount >= 0) monthlyMap[key].income += t.amount
        else monthlyMap[key].expense += Math.abs(t.amount)
      })
      const monthlyIncomeData = Object.entries(monthlyMap).map(([month, v]) => ({ month, amount: v.income }))
      const monthlyExpenseData = Object.entries(monthlyMap).map(([month, v]) => ({ month, amount: v.expense }))

      const catMap = {}
      txns.filter(t => t.amount < 0).forEach(t => {
        catMap[t.category] = (catMap[t.category] || 0) + Math.abs(t.amount)
      })
      const catData = Object.entries(catMap).map(([category, value]) => ({ category, value }))

      const incMap = {}
      txns.filter(t => t.amount > 0).forEach(t => {
        incMap[t.category] = (incMap[t.category] || 0) + t.amount
      })
      const incData = Object.entries(incMap).map(([name, value]) => ({ name, value }))

      const necColors = { essentials: '#f97316', luxury: '#22c55e', needs: '#3b82f6' }
      const necMap = {}
      txns.filter(t => t.amount < 0).forEach(t => {
        const key = t.necessity || 'needs'
        necMap[key] = (necMap[key] || 0) + Math.abs(t.amount)
      })
      const necData = Object.entries(necMap).map(([name, value]) => ({ name, value, color: necColors[name] || '#10b981' }))

      const palette = ['#10b981', '#34d399', '#ef4444', '#f97316', '#eab308', '#a855f7', '#22c55e']
      const applyColors = (arr) => arr.map((item, idx) => ({ ...item, color: item.color || palette[idx % palette.length] }))

      setFinancialData({
        currentBalance,
        lastUpdated: new Date().toLocaleString('en-IN'),
        totalIncome,
        totalExpenses,
        totalSavings,
        savingsRate,
        projectedBalance
      })
      setIncomeBreakdown(applyColors(incData.length ? incData : [{ name: 'income', value: 0 }]))
      setExpenseBreakdown(applyColors(catData.length ? catData : [{ name: 'expense', value: 0 }]))
      setMonthlyIncome(monthlyIncomeData)
      setMonthlyExpenses(monthlyExpenseData)
      setSpendingByCategory(catData.length ? catData : [{ category: 'other', value: 0 }])
      setExpenseByNecessity(applyColors(necData.length ? necData : [{ name: 'needs', value: 0 }]))
      setHasInsights(true)
    } catch (error) {
      console.error('Failed to load insights', error)
      setHasInsights(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = async () => {
    await loadInsights()
  }

  // Loading/Generating State
  if (isGenerating || !hasInsights) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <DollarSign className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Financial Insights Dashboard
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Get personalized insights and recommendations to optimize your financial health
          </p>
          <button
            disabled
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium px-8 py-4 rounded-xl shadow-lg opacity-75"
          >
            <RefreshCw className="w-5 h-5 animate-spin" />
            Generating Insights...
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      
      <main className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Financial Intelligence Dashboard</h1>
            <p className="text-gray-400">AI-powered insights and recommendations for your finances</p>
          </div>
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            Regenerate Insights
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-teal-500 via-teal-400 to-green-400 rounded-2xl p-6 mb-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
          <div className="flex items-center gap-2 text-white/90 mb-2">
            <span className="text-lg">🔥</span>
            <span className="font-medium">CURRENT ACCOUNT BALANCE</span>
          </div>
          <div className="text-5xl font-bold text-white mb-2">{formatCurrency(financialData.currentBalance)}</div>
          <p className="text-white/70 text-sm">Last updated: {financialData.lastUpdated}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4 text-white transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/80">Total Income</span>
              <TrendingUp className="w-5 h-5 text-white/80" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(financialData.totalIncome)}</div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/80">Total Expenses</span>
              <TrendingDown className="w-5 h-5 text-white/80" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(financialData.totalExpenses)}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/80">Total Savings</span>
              <PiggyBank className="w-5 h-5 text-white/80" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(financialData.totalSavings)}</div>
            <p className="text-xs text-white/60 mt-1">Income - Expenses</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/80">Savings Rate</span>
              <Award className="w-5 h-5 text-white/80" />
            </div>
            <div className="text-2xl font-bold">{financialData.savingsRate.toFixed(2)}%</div>
            <p className="text-xs text-white/60 mt-1">of Income</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/80">Projected Balance</span>
              <Target className="w-5 h-5 text-white/80" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(financialData.projectedBalance)}</div>
            <p className="text-xs text-white/60 mt-1">Balance + Savings</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Income Breakdown */}
          <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-white">Income Breakdown</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ value }) => `₹${value.toFixed(2)}`}
                  >
                    {incomeBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-white">Expense Breakdown</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ value }) => `₹${value.toFixed(2)}`}
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Income Trend */}
          <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
            <h3 className="font-semibold text-white mb-4">Monthly Income Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyIncome}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Expenses Trend */}
          <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
            <h3 className="font-semibold text-white mb-4">Monthly Expenses Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Second Row Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Spending by Category (Radar) */}
          <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
            <h3 className="font-semibold text-white mb-4">Spending by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={spendingByCategory}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="category" stroke="#9ca3af" />
                  <PolarRadiusAxis stroke="#9ca3af" />
                  <Radar name="Spending" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense by Necessity */}
          <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
            <h3 className="font-semibold text-white mb-4">Expense by Necessity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByNecessity}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ value }) => `₹${value.toFixed(2)}`}
                  >
                    {expenseByNecessity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Spending Insights */}
          <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-white">Spending Insights</h3>
            </div>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>You have a healthy net surplus of ≈97,100 ₹ over the past two months, but a large share of expenses (≈55%) is on frequent food delivery, transportation rides, and entertainment subscriptions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>Your effective savings rate is about 79% of total income, indicating strong cash-flow discipline, yet the combined shortfall for all three goals (≈1,43,000 ₹) exceeds the current surplus.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>The Emergency Fund is only 45% funded; completing this safety net should be the top priority before allocating funds to discretionary goals.</span>
              </li>
            </ul>
          </div>

          {/* Saving Opportunities */}
          <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
            <div className="flex items-center gap-2 mb-4">
              <PiggyBank className="w-5 h-5 text-teal-500" />
              <h3 className="font-semibold text-white">Saving Opportunities</h3>
            </div>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-teal-500 mt-1">•</span>
                <span>Reduce food-delivery orders (Swiggy/Zomato) by cooking at home – potential saving of ≈2,000 ₹/month.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 mt-1">•</span>
                <span>Consolidate entertainment subscriptions (Netflix, movies) to a single plan – potential saving of ≈200 ₹/month.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 mt-1">•</span>
                <span>Switch to a monthly public-transport pass or car-pooling to cut ride-share costs – potential saving of ≈300 ₹/month.</span>
              </li>
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-white">Recommendations</h3>
            </div>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Direct a fixed ≈20,000 ₹ per month to the Emergency Fund until it reaches the 1,00,000 ₹ target (≈5 months).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Once the emergency fund is complete, allocate ≈12,000 ₹ monthly to the iPhone 16 goal and ≈10,000 ₹ monthly to the Goa vacation to meet both targets within 5-6 months.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Invest any remaining surplus in low-risk instruments (e.g., 1-2 year fixed deposit or short-term debt mutual funds) to earn interest and accelerate all goal timelines.</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

export const darkThemeStyles = `
  .bg-dark-900 { background-color: #0f172a; }
  .bg-dark-800 { background-color: #1e293b; }
  .bg-dark-700 { background-color: #334155; }
  .border-dark-700 { border-color: #334155; }
`
