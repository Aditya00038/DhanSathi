import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { X, Plus, Calendar, Target, Edit2, Trash2 } from 'lucide-react'
import { goalsAPI } from '../services/api'
import toast, { Toaster } from 'react-hot-toast'

export default function Goals() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [showContributeModal, setShowContributeModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFeasibilityModal, setShowFeasibilityModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [contributeAmount, setContributeAmount] = useState('')
  const [editGoal, setEditGoal] = useState(null)
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    targetDate: ''
  })

  useEffect(() => {
    loadGoals()
    // Auto-open create modal if ?create=true
    if (searchParams.get('create') === 'true') {
      setShowModal(true)
      setSearchParams({}) // Clear URL parameter
    }
  }, [])

  const loadGoals = async () => {
    setLoading(true)
    try {
      const data = await goalsAPI.list()
      setGoals(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load goals', error)
      toast.error('Failed to load goals')
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
    }).format(amount)
  }

  const calculateMonthlyTarget = () => {
    if (!newGoal.targetAmount || !newGoal.targetDate) return 0
    const target = parseFloat(newGoal.targetAmount)
    const months = Math.max(1, Math.ceil((new Date(newGoal.targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30)))
    return target / months
  }

  const getDaysRemaining = (targetDate) => {
    const days = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  const getProgress = (current, target) => {
    return Math.min(100, (current / target) * 100)
  }

  const handleCreateGoal = async (e) => {
    e.preventDefault()
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate) {
      toast.error('Please fill all fields')
      return
    }
    const payload = {
      name: newGoal.name.trim(),
      target_amount: parseFloat(newGoal.targetAmount),
      target_date: new Date(newGoal.targetDate).toISOString(),
    }
    try {
      await goalsAPI.create(payload)
      toast.success('Goal created successfully!')
      setShowModal(false)
      setNewGoal({ name: '', targetAmount: '', targetDate: '' })
      await loadGoals()
    } catch (error) {
      console.error('Failed to create goal', error.response?.data || error)
      toast.error(error.response?.data?.detail || 'Failed to create goal')
    }
  }

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return
    try {
      await goalsAPI.delete(id)
      toast.success('Goal deleted')
      await loadGoals()
    } catch (error) {
      console.error('Delete failed', error)
      toast.error('Failed to delete goal')
    }
  }

  const handleCheckFeasibility = (goal) => {
    setSelectedGoal(goal)
    setShowFeasibilityModal(true)
  }

  const handleEditGoal = (goal) => {
    setEditGoal(goal)
    setShowEditModal(true)
  }

  const handleUpdateGoal = async (e) => {
    e.preventDefault()
    if (!editGoal) return
    try {
      await goalsAPI.update(editGoal.id, {
        name: editGoal.name,
        target_amount: editGoal.target_amount,
        target_date: editGoal.target_date,
      })
      toast.success('Goal updated successfully!')
      setShowEditModal(false)
      setEditGoal(null)
      await loadGoals()
    } catch (error) {
      console.error('Failed to update goal', error)
      toast.error('Failed to update goal')
    }
  }

  const handleContribute = async () => {
    if (!selectedGoal || !contributeAmount) return
    try {
      await goalsAPI.contribute(selectedGoal.id, parseFloat(contributeAmount))
      toast.success(`₹${contributeAmount} added to ${selectedGoal.name}!`)
      setShowContributeModal(false)
      setSelectedGoal(null)
      setContributeAmount('')
      await loadGoals()
    } catch (error) {
      console.error('Contribution failed', error)
      toast.error('Failed to add contribution')
    }
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')
  const totalSaved = goals.reduce((sum, g) => sum + (g.current_amount || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">Financial Goals</h1>
            <p className="text-gray-600 mt-1">Track your progress towards your financial targets</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Create Goal
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer">
            <div className="text-3xl font-bold text-teal-600">{activeGoals.length}</div>
            <p className="text-gray-600 mt-1">Active Goals</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer">
            <div className="text-3xl font-bold text-orange-500">{completedGoals.length}</div>
            <p className="text-gray-600 mt-1">Completed Goals</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer">
            <div className="text-3xl font-bold text-green-600">{formatCurrency(totalSaved)}</div>
            <p className="text-gray-600 mt-1">Total Saved</p>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && (
            <div className="col-span-full text-center py-8 text-gray-500">Loading goals...</div>
          )}
          {!loading && goals.map(goal => {
            const progress = getProgress(goal.current_amount || 0, goal.target_amount)
            const daysLeft = getDaysRemaining(goal.target_date)
            const remaining = goal.target_amount - (goal.current_amount || 0)
            const monthlyTarget = remaining / Math.max(1, Math.ceil(daysLeft / 30))

            return (
              <div key={goal.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{goal.name}</h3>
                    <p className="text-sm text-gray-500">
                      Target: {new Date(goal.target_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {goal.status}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900">{formatCurrency(goal.current_amount || 0)} / {formatCurrency(goal.target_amount)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-sm text-gray-500 mt-1">{progress.toFixed(1)}% complete</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-red-500 font-semibold">{formatCurrency(remaining)}</div>
                    <p className="text-xs text-gray-500">Remaining</p>
                  </div>
                  <div>
                    <div className="text-teal-600 font-semibold">{formatCurrency(monthlyTarget)}</div>
                    <p className="text-xs text-gray-500">Monthly Target</p>
                  </div>
                </div>

                {/* Days Remaining */}
                <div className="bg-gray-50 rounded-lg py-2 px-4 mb-4 text-center">
                  <span className="text-gray-700 font-medium">{daysLeft} days remaining</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setSelectedGoal(goal); setShowContributeModal(true); }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105"
                  >
                    Update Progress
                  </button>
                  <button 
                    onClick={() => handleEditGoal(goal)}
                    className="p-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-600 rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-2 bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <button 
                  onClick={() => handleCheckFeasibility(goal)}
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105 hover:shadow-md">
                  Check Feasibility
                </button>
              </div>
            )
          })}
        </div>

        {/* Create Goal Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Goal</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <p className="text-gray-500 text-sm mb-6">Set a new financial target to work towards</p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-1">Create New Goal</h3>
                <p className="text-sm text-gray-500">Set a new financial target to work towards</p>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
                  <input
                    type="text"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                    placeholder="Buy a Telescope"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount (₹)</label>
                    <input
                      type="number"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                      placeholder="10000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                    <input
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                {newGoal.targetAmount && newGoal.targetDate && (
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <span className="text-orange-700">Monthly Saving Target:</span>
                      <span className="text-orange-600 font-bold text-lg">{formatCurrency(calculateMonthlyTarget())}</span>
                    </div>
                    <p className="text-sm text-orange-600 mt-1">
                      You need to save this amount each month to reach your goal on time.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Create Goal
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Contribute Modal */}
        {showContributeModal && selectedGoal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Add Contribution</h2>
                <button 
                  onClick={() => { setShowContributeModal(false); setSelectedGoal(null); setContributeAmount(''); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900">{selectedGoal.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Current: {formatCurrency(selectedGoal.current_amount || 0)} / {formatCurrency(selectedGoal.target_amount)}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contribution Amount (₹)</label>
                  <input
                    type="number"
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(e.target.value)}
                    placeholder="1000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowContributeModal(false); setSelectedGoal(null); setContributeAmount(''); }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContribute}
                    disabled={!contributeAmount || parseFloat(contributeAmount) <= 0}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Contribution
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Goal Modal */}
        {showEditModal && editGoal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Edit Goal</h2>
                <button 
                  onClick={() => { setShowEditModal(false); setEditGoal(null); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdateGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name</label>
                  <input
                    type="text"
                    value={editGoal.name || ''}
                    onChange={(e) => setEditGoal({...editGoal, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount (₹)</label>
                  <input
                    type="number"
                    value={editGoal.target_amount || ''}
                    onChange={(e) => setEditGoal({...editGoal, target_amount: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                  <input
                    type="date"
                    value={editGoal.target_date ? new Date(editGoal.target_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditGoal({...editGoal, target_date: new Date(e.target.value).toISOString()})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setEditGoal(null); }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Update Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Check Feasibility Modal */}
        {showFeasibilityModal && selectedGoal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Goal Feasibility</h2>
                <button 
                  onClick={() => { setShowFeasibilityModal(false); setSelectedGoal(null); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900">{selectedGoal.name}</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Target: {formatCurrency(selectedGoal.target_amount)}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Days Remaining:</span>
                    <span className="font-semibold text-blue-600">{getDaysRemaining(selectedGoal.target_date)} days</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Months Left:</span>
                    <span className="font-semibold text-blue-600">{Math.max(1, Math.ceil(getDaysRemaining(selectedGoal.target_date) / 30))} months</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Remaining Amount:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(selectedGoal.target_amount - (selectedGoal.current_amount || 0))}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Monthly Target:</span>
                    <span className="font-semibold text-orange-600">
                      {formatCurrency((selectedGoal.target_amount - (selectedGoal.current_amount || 0)) / Math.max(1, Math.ceil(getDaysRemaining(selectedGoal.target_date) / 30)))}
                    </span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-green-800">
                    ✓ <strong>Feasible:</strong> You need to save <strong>{formatCurrency((selectedGoal.target_amount - (selectedGoal.current_amount || 0)) / Math.max(1, Math.ceil(getDaysRemaining(selectedGoal.target_date) / 30)))}</strong> per month to reach your goal on time.
                  </p>
                </div>

                <button
                  onClick={() => { setShowFeasibilityModal(false); setSelectedGoal(null); }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Toaster position="top-right" />
    </div>
  )
}
