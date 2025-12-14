import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { 
  Edit2, 
  Trash2, 
  Upload,
  Calendar,
  Filter
} from 'lucide-react'

import { transactionsAPI, ocrAPI } from '../services/api'
import toast, { Toaster } from 'react-hot-toast'

export default function Transactions() {
  const [activeTab, setActiveTab] = useState('history')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingTx, setEditingTx] = useState(null)

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'expense',
    category: 'food',
    description: '',
    necessity: 'needs'
  })

  const [bulkJson, setBulkJson] = useState('')
  const [ocrImage, setOcrImage] = useState(null)
  const [ocrResults, setOcrResults] = useState(null)

  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    startDate: '',
    endDate: ''
  })

  const categories = ['food', 'rent', 'utilities', 'transportation', 'entertainment', 'healthcare', 'shopping', 'education', 'income', 'other']
  const necessityLevels = [
    { value: 'needs', label: 'Needs', description: 'Essential for survival' },
    { value: 'essentials', label: 'Essentials', description: 'Important but not critical' },
    { value: 'luxury', label: 'Luxury', description: 'Nice to have' }
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(Math.abs(amount))
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCategoryIcon = (category) => {
    const icons = {
      food: '🍽️',
      rent: '🏠',
      utilities: '💡',
      transportation: '🚗',
      entertainment: '🎬',
      healthcare: '🏥',
      shopping: '🛒',
      education: '📚',
      income: '💰',
      other: '📦'
    }
    return icons[category] || '📦'
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const data = await transactionsAPI.list()
      // backend returns array of transactions
      setTransactions(Array.isArray(data) ? data : (data.data || []))
    } catch (e) {
      console.error('Failed to load transactions', e)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTransaction = async (e) => {
    e.preventDefault()
    const payload = {
      timestamp: newTransaction.date,
      amount: newTransaction.type === 'expense' ? -Math.abs(parseFloat(newTransaction.amount)) : Math.abs(parseFloat(newTransaction.amount)),
      category: newTransaction.category,
      description: newTransaction.description,
      necessity: newTransaction.necessity,
    }
    try {
      if (editingTx) {
        await transactionsAPI.delete(editingTx.id)
        await transactionsAPI.create(payload)
        toast.success('Transaction updated!')
      } else {
        await transactionsAPI.create(payload)
        toast.success('Transaction added successfully!')
      }
      await loadTransactions()
    } catch (e) {
      console.error('Failed to add transaction', e)
      toast.error('Failed to save transaction')
    }
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      type: 'expense',
      category: 'food',
      description: '',
      necessity: 'needs'
    })
    setEditingTx(null)
  }

  const handleEditTransaction = (tx) => {
    setEditingTx(tx)
    setActiveTab('add')
    setNewTransaction({
      date: (tx.timestamp || tx.date || '').split('T')[0] || new Date().toISOString().split('T')[0],
      amount: Math.abs(tx.amount),
      type: tx.amount >= 0 ? 'income' : 'expense',
      category: tx.category || 'other',
      description: tx.description || '',
      necessity: tx.necessity || 'needs'
    })
    toast.success('Edit mode: update fields and save to apply changes')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    try {
      await transactionsAPI.delete(id)
      await loadTransactions()
      toast.success('Transaction deleted')
    } catch (e) {
      console.error('Delete failed', e)
      toast.error('Failed to delete transaction')
    }
  }

  const handleBulkImport = async () => {
    if (!bulkJson.trim()) {
      toast.error('Please enter JSON data first')
      return
    }

    try {
      const data = JSON.parse(bulkJson)
      if (!Array.isArray(data)) {
        toast.error('JSON must be an array of transactions')
        return
      }

      if (data.length === 0) {
        toast.error('No transactions to import')
        return
      }

      const payload = data.map((item) => ({
        timestamp: item.date || new Date().toISOString(),
        amount: item.type === 'expense' ? -Math.abs(item.amount) : Math.abs(item.amount),
        category: item.category || 'other',
        description: item.description || '',
        necessity: item.necessity || 'needs',
      }))

      await transactionsAPI.bulkCreate(payload)
      await loadTransactions()
      setBulkJson('')
      toast.success(`Successfully imported ${payload.length} transactions!`)
    } catch (e) {
      console.error('Bulk import error:', e)
      if (e.response?.data?.detail) {
        toast.error(`Import failed: ${JSON.stringify(e.response.data.detail)}`)
      } else if (e instanceof SyntaxError) {
        toast.error('Invalid JSON format. Please check your syntax.')
      } else {
        toast.error('Failed to import transactions')
      }
    }
  }

  const loadSampleData = () => {
    const sample = [
      { date: "2025-11-01", amount: 50000, category: "income", type: "income", description: "Monthly salary", necessity: "needs" },
      { date: "2025-11-05", amount: 2500, category: "food", type: "expense", description: "Grocery shopping", necessity: "essentials" },
      { date: "2025-11-10", amount: 1500, category: "transportation", type: "expense", description: "Fuel", necessity: "needs" }
    ]
    setBulkJson(JSON.stringify(sample, null, 2))
  }

  const handleOCRUpload = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setOcrImage(URL.createObjectURL(file))
      toast.loading('Processing image...', { id: 'ocr' })
      try {
        const result = await ocrAPI.scanPassbook(file)
        const rows = result?.rows || result
        setOcrResults(Array.isArray(rows) ? rows : [])
        toast.success('Image processed successfully!', { id: 'ocr' })
      } catch (e) {
        console.error('OCR failed', e)
        toast.error('Failed to process image. Using demo data.', { id: 'ocr' })
        // Set demo results as fallback
        setOcrResults([
          { date: '28-06-2022', description: 'LIC OF INDIA', debit: 500, credit: null, balance: 5089.15 },
          { date: '29-06-2022', description: 'UPI PAYMENT', debit: 650, credit: null, balance: 4439.15 },
        ])
      }
    }
  }

  const handleOCRDragDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setOcrImage(URL.createObjectURL(file))
      toast.loading('Processing image...', { id: 'ocr' })
      handleOCRUpload({ target: { files: [file] } })
    } else {
      toast.error('Please drop an image file')
    }
  }

  const handleBulkDragDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        setBulkJson(evt.target.result)
        toast.success('JSON file loaded. Ready to import!')
      }
      reader.readAsText(file)
    } else {
      toast.error('Please drop a JSON file')
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filters.type !== 'all' && tx.type !== filters.type) return false
    if (filters.category !== 'all' && tx.category !== filters.category) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Track your income and expenses to optimize your financial health</p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 rounded-xl p-1 inline-flex mb-6">
          {[
            { id: 'history', label: 'Transaction History' },
            { id: 'add', label: 'Add Transaction' },
            { id: 'bulk', label: 'Bulk Import' },
            { id: 'ocr', label: 'Bank Passbook OCR' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transaction History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-orange-600 mb-1">Transaction History</h2>
            <p className="text-gray-500 text-sm mb-6">Manage your income and expenses</p>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium transition-all duration-200 hover:border-orange-300 hover:shadow-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium transition-all duration-200 hover:border-orange-300 hover:shadow-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  placeholder="dd-mm-yyyy"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="date"
                  placeholder="dd-mm-yyyy"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
              {loading && (
                <div className="text-sm text-gray-500">Loading transactions…</div>
              )}
              {!loading && filteredTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-4 px-4 border-b border-gray-100 last:border-0 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                      {getCategoryIcon(tx.category)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{tx.description}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">{formatDate(tx.timestamp || tx.date)}</span>
                        {tx.necessity && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            tx.necessity === 'essentials' ? 'bg-green-100 text-green-700' :
                            tx.necessity === 'needs' ? 'bg-orange-100 text-orange-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {tx.necessity}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">{tx.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold text-lg ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount >= 0 ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                    <button 
                      onClick={() => handleEditTransaction(tx)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(tx.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Transaction Tab */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Add New Transaction</h2>
            <p className="text-gray-500 text-sm mb-6">Record a new income or expense</p>

            <form onSubmit={handleAddTransaction} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    placeholder="1000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="Enter transaction description"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Necessity Level</label>
                <select
                  value={newTransaction.necessity}
                  onChange={(e) => setNewTransaction({...newTransaction, necessity: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  {necessityLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {necessityLevels.find(l => l.value === newTransaction.necessity)?.description}
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Add Transaction
              </button>
            </form>
          </div>
        )}

        {/* Bulk Import Tab */}
        {activeTab === 'bulk' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Bulk Import Transactions</h2>
            <p className="text-gray-500 text-sm mb-6">Import multiple transactions at once using JSON format</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">JSON Data</label>
              <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 transition-all duration-200 hover:border-orange-400 hover:bg-orange-50 cursor-pointer mb-6"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-orange-400', 'bg-orange-50') }}
              onDragLeave={(e) => { e.currentTarget.classList.remove('border-orange-400', 'bg-orange-50') }}
              onDrop={handleBulkDragDrop}
            >
              <div className="text-center mb-4">
                <Upload className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Drag JSON file here or paste below</p>
                <p className="text-sm text-gray-500 mt-1">Supports array of transaction objects</p>
              </div>
            </div>

            <textarea
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                placeholder="Paste your JSON data here..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
              />
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={handleBulkImport}
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
              >
                Import Transactions
              </button>
              <button
                onClick={loadSampleData}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-lg transition-colors"
              >
                Load Sample Data
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-700 mb-2">Required fields for each transaction:</p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>date (YYYY-MM-DD format)</li>
                <li>amount (number)</li>
                <li>category (food, rent, utilities, transportation, entertainment, healthcare, shopping, education, income, other)</li>
                <li>type (income or expense)</li>
                <li>description (string)</li>
                <li>necessity (needs, essentials, or luxury)</li>
              </ul>
            </div>
          </div>
        )}

        {/* OCR Tab */}
        {activeTab === 'ocr' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">
                <span className="text-teal-600">Bank</span>{' '}
                <span className="text-orange-500">Passbook OCR</span>
              </h2>
              <p className="text-gray-600 mt-2">Upload your passbook image to extract transaction data instantly</p>
            </div>

            {!ocrResults ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 transition-all duration-200 hover:border-teal-400 hover:bg-teal-50 cursor-pointer"
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-teal-400', 'bg-teal-50') }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('border-teal-400', 'bg-teal-50') }}
                onDrop={handleOCRDragDrop}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-teal-600" />
                  </div>
                  <label className="cursor-pointer">
                    <span className="font-semibold text-gray-900">Click to upload</span>
                    <span className="text-gray-500"> or drag and drop</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleOCRUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PNG or JPG (max 1MB)</p>
                </div>
              </div>
            ) : (
              <div className="bg-orange-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900">Transaction Results</h3>
                    <p className="text-sm text-gray-600">Found <span className="text-teal-600 font-medium">{ocrResults.length} transactions</span></p>
                  </div>
                  <button
                    onClick={() => { setOcrResults(null); setOcrImage(null); }}
                    className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Upload Another
                  </button>
                </div>

                <div className="bg-white rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Description</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Debit</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Credit</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(ocrResults) && ocrResults.map((row, idx) => (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="px-4 py-3 text-sm text-gray-600">{row.date}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{row.description}</td>
                          <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                            {row.debit ? `₹${(row.debit).toFixed(2)}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                            {row.credit ? `₹${(row.credit).toFixed(2)}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-teal-600 font-medium">
                            ₹{(row.balance).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Toaster position="top-right" />
    </div>
  )
}
