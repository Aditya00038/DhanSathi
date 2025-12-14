import { useState, useRef, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { Send, Trash2, Lightbulb, PiggyBank, TrendingUp, CreditCard, Shield, Heart } from 'lucide-react'
import { useAuth } from '../App'
import { chatAPI } from '../services/api'
import toast, { Toaster } from 'react-hot-toast'

export default function AICoach() {
  const { user } = useAuth()
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const quickActions = [
    { icon: Lightbulb, label: 'Budget Help', description: 'Get budgeting advice', color: 'bg-orange-100 text-orange-600' },
    { icon: PiggyBank, label: 'Saving Tips', description: 'Learn how to save more', color: 'bg-green-100 text-green-600' },
    { icon: TrendingUp, label: 'Investment Advice', description: 'Start investing wisely', color: 'bg-blue-100 text-blue-600' },
    { icon: CreditCard, label: 'Debt Management', description: 'Strategies to pay off debt', color: 'bg-purple-100 text-purple-600' },
    { icon: Shield, label: 'Emergency Fund', description: 'Build your safety net', color: 'bg-teal-100 text-teal-600' },
    { icon: Heart, label: 'Health Score', description: 'Check financial health', color: 'bg-red-100 text-red-600' },
  ]

  useEffect(() => {
    loadChatHistory()
  }, [])

  const loadChatHistory = async () => {
    setLoading(true)
    try {
      const data = await chatAPI.getHistory()
      const formatted = (data || []).map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        time: new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }))
      setMessages(formatted)
    } catch (error) {
      console.error('Failed to load chat history', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      time: getCurrentTime()
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')
    setIsTyping(true)

    try {
      const response = await chatAPI.sendMessage(userInput)
      const aiMessage = {
        id: response.id,
        role: 'assistant',
        content: response.content,
        time: new Date(response.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Failed to send message', error)
      toast.error('Failed to get response from AI coach')
      // Add fallback message
      const fallbackMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment. In the meantime, you can explore the quick actions on the right for instant financial tips!",
        time: getCurrentTime()
      }
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickAction = (action) => {
    const prompts = {
      'Budget Help': 'Can you help me create a budget and manage my expenses better?',
      'Saving Tips': 'What are the best strategies to save more money each month?',
      'Investment Advice': 'How should I start investing my savings? What are good options for beginners?',
      'Debt Management': 'I have some debts. How should I prioritize paying them off?',
      'Emergency Fund': 'How much should I save in an emergency fund and how do I build one?',
      'Health Score': 'Can you analyze my financial health based on my transactions?'
    }
    setInput(prompts[action.label] || `Tell me about ${action.label.toLowerCase()}`)
  }

  const clearChat = async () => {
    if (!window.confirm('Clear all chat history?')) return
    try {
      await chatAPI.clearHistory()
      setMessages([])
      toast.success('Chat history cleared')
    } catch (error) {
      console.error('Failed to clear chat', error)
      toast.error('Failed to clear chat history')
    }
  }

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-180px)] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🤖</span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-teal-600">AI Financial Coach</h2>
                    <p className="text-sm text-gray-500">Get personalized financial advice and guidance</p>
                  </div>
                </div>
                <button
                  onClick={clearChat}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Clear chat"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">💬</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Start a Conversation</h3>
                      <p className="text-gray-500 max-w-sm">
                        Ask me anything about budgeting, saving, investing, or managing your finances!
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' 
                            : 'bg-orange-100'
                        }`}>
                          {message.role === 'user' ? getInitial(user?.full_name) : '🤖'}
                        </div>
                        
                        {/* Message Bubble */}
                        <div className={`rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-orange-500 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.role === 'user' ? 'text-orange-200' : 'text-gray-400'
                          }`}>
                            {message.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {isTyping && (
                  <div className="flex items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      🤖
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
              <p className="text-sm text-gray-500 mb-4">Get instant advice on common financial topics</p>
              
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{action.label}</p>
                        <p className="text-xs text-gray-500">{action.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  )
}
