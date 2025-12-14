# DhanSathi - AI Financial Companion 💰

> Your Personal AI-Powered Financial Companion for Indians

**Team:** Aaditya Hande, Aditya Suryawanshi, Sneha Gurav

---

## 🌟 Features

- **📊 Dashboard** - Real-time financial health score, balance overview, and goal tracking
- **💸 Transactions** - Track income & expenses with smart categorization
- **🎯 Goals** - Set and track financial goals with progress visualization
- **🤖 AI Coach** - Get personalized financial advice powered by Gemini AI
- **📚 Learn** - Financial education modules with interactive quizzes
- **📈 Insights** - AI-powered analytics with charts and recommendations
- **📷 OCR** - Scan bank passbooks and receipts to auto-import transactions

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### 1. Clone & Setup

```bash
# Clone the repository
cd dhanSathi

# Copy environment file
copy .env.example .env
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with demo data
python -m scripts.seed_db

# Start backend server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the App

- **Frontend:** http://localhost:5173 (or 5174 if 5173 is busy)
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### 🎯 Demo Login
```
Email: demo@dhan.local
Password: password123
```

---

## ⚡ Quick Start (PowerShell)

Run this single command to start everything:
```powershell
.\start.ps1
```

This script will:
- Create virtual environment (if needed)
- Install all dependencies
- Seed the database with demo data
- Start both backend and frontend servers

---

## 📁 Project Structure

```
dhanSathi/
├── app/                    # Backend (FastAPI)
│   ├── adapters/          # AI provider adapters
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   ├── main.py            # FastAPI app
│   ├── models.py          # Database models
│   ├── schemas.py         # Pydantic schemas
│   ├── auth.py            # Authentication
│   ├── config.py          # Configuration
│   └── db.py              # Database setup
├── frontend/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.jsx        # Main app
│   └── package.json
├── scripts/               # Utility scripts
│   └── seed_db.py        # Database seeder
├── deploy/                # Deployment scripts (optional)
├── .vscode/               # VS Code configuration
├── requirements.txt       # Python dependencies
└── README.md
```

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# App Settings
DEBUG=true
SECRET_KEY=your-secret-key-change-me

# Database (SQLite default)
DATABASE_URL=sqlite:///./dhan_sathi.db

# AI Provider: "gemini", "openai", or "local"
AI_PROVIDER=local

# Gemini API Key (optional)
GEMINI_API_KEY=your-gemini-api-key
```

### Setting Up Gemini AI

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to your `.env` file:
   ```
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your-api-key
   ```

---

## 🎮 VS Code Tasks

Use `Ctrl+Shift+P` → "Tasks: Run Task" to run:

- **Start Full Stack** - Starts both backend and frontend
- **Start Backend** - Starts FastAPI server only
- **Start Frontend** - Starts Vite dev server only
- **Seed Database** - Populate database with demo data
- **Install Backend Dependencies** - Install Python packages
- **Install Frontend Dependencies** - Install npm packages

---

## 📱 Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Marketing landing page |
| Sign In | `/signin` | User authentication |
| Sign Up | `/signup` | User registration |
| Dashboard | `/dashboard` | Financial overview |
| Transactions | `/transactions` | Manage transactions |
| Goals | `/goals` | Financial goals |
| AI Coach | `/coach` | Chat with AI |
| Learn | `/learn` | Education modules |
| Insights | `/insights` | Analytics dashboard |

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/token` - Login and get token
- `GET /api/auth/me` - Get current user

### Transactions
- `GET /api/transactions/` - List transactions
- `POST /api/transactions/` - Create transaction
- `POST /api/transactions/bulk` - Bulk import
- `DELETE /api/transactions/{id}` - Delete transaction

### Goals
- `GET /api/goals/` - List goals
- `POST /api/goals/` - Create goal
- `PATCH /api/goals/{id}` - Update goal
- `DELETE /api/goals/{id}` - Delete goal

### Chat
- `GET /api/chat/history` - Get chat history
- `POST /api/chat/send` - Send message to AI
- `DELETE /api/chat/clear` - Clear history

### Insights
- `GET /api/insights/summary` - Get financial summary

### OCR
- `POST /api/ocr/receipt` - Scan receipt
- `POST /api/ocr/passbook` - Scan passbook

---

## 🎨 Tech Stack

**Frontend:**
- React 18
- Vite
- TailwindCSS
- React Router
- Recharts
- Lucide Icons
- Axios

**Backend:**
- FastAPI
- SQLAlchemy
- SQLite (default)
- JWT Authentication
- Pydantic

**AI:**
- Google Gemini (primary)
- OpenAI (fallback)
- Local stub (offline)

---

## 🆓 Free Tier & Billing Notes

### What's Free
- ✅ SQLite database (local)
- ✅ Local AI mode (no API calls)
- ✅ All frontend features
- ✅ GitHub deployment

### May Require Billing
- ⚠️ Gemini API (free tier has limits)
- ⚠️ Cloud databases (PostgreSQL)
- ⚠️ Cloud Run / App Service hosting

---

## 📝 License

MIT License - Free for personal and commercial use.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ for the hackathon by Team DhanSathi
