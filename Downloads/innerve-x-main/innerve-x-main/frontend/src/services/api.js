import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dhanSathiToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dhanSathiToken')
      localStorage.removeItem('dhanSathiUser')
      window.location.href = '/signin'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: async (data) => {
    const response = await api.post('/api/auth/register', data)
    return response.data
  },
  
  login: async (email, password) => {
    const response = await api.post('/api/auth/token', {
      username: email,
      password: password,
    })
    return response.data
  },
  
  getMe: async () => {
    const response = await api.get('/api/auth/me')
    return response.data
  },
}

// Transactions API
export const transactionsAPI = {
  list: async (params = {}) => {
    const response = await api.get('/api/transactions/', { params })
    return response.data
  },
  
  create: async (data) => {
    const response = await api.post('/api/transactions/', data)
    return response.data
  },
  
  bulkCreate: async (transactions) => {
    const response = await api.post('/api/transactions/bulk', transactions)
    return response.data
  },
  
  delete: async (id) => {
    const response = await api.delete(`/api/transactions/${id}`)
    return response.data
  },
}

// Goals API
export const goalsAPI = {
  list: async (status = null) => {
    const params = status ? { status } : {}
    const response = await api.get('/api/goals/', { params })
    return response.data
  },
  
  create: async (data) => {
    const response = await api.post('/api/goals/', data)
    return response.data
  },
  
  update: async (id, data) => {
    const response = await api.patch(`/api/goals/${id}`, data)
    return response.data
  },
  
  delete: async (id) => {
    const response = await api.delete(`/api/goals/${id}`)
    return response.data
  },
  
  contribute: async (id, amount) => {
    const response = await api.post(`/api/goals/${id}/contribute`, null, {
      params: { amount },
    })
    return response.data
  },
}

// Chat API
export const chatAPI = {
  getHistory: async (limit = 50) => {
    const response = await api.get('/api/chat/history', { params: { limit } })
    return response.data
  },
  
  sendMessage: async (content) => {
    const response = await api.post('/api/chat/send', { content })
    return response.data
  },
  
  clearHistory: async () => {
    const response = await api.delete('/api/chat/clear')
    return response.data
  },
}

// Insights API
export const insightsAPI = {
  getSummary: async () => {
    const response = await api.get('/api/insights/summary')
    return response.data
  },
}

// Portfolio API
export const portfolioAPI = {
  get: async () => {
    const response = await api.get('/api/portfolio/')
    return response.data
  },
  
  addHolding: async (data) => {
    const response = await api.post('/api/portfolio/', data)
    return response.data
  },
  
  removeHolding: async (symbol) => {
    const response = await api.delete(`/api/portfolio/${symbol}`)
    return response.data
  },
}

// OCR API
export const ocrAPI = {
  scanReceipt: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/ocr/receipt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  
  scanPassbook: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/ocr/passbook', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}

export default api
