# 🚀 Deployment Guide

This guide covers deploying DhanSathi to **Vercel** (recommended for quick setup) or **Render** (better for full-stack apps).

---

## 📋 Prerequisites

- Git repository (push your code to GitHub)
- Account on [Vercel](https://vercel.com) or [Render](https://render.com)
- Gemini API key (get it from [Google AI Studio](https://makersuite.google.com/app/apikey))

---

## 🎯 Option 1: Deploy to Vercel (Recommended for Frontend + Serverless Backend)

### Step 1: Prepare Your Repository

1. Make sure your code is pushed to GitHub
2. Ensure `vercel.json` and `api/index.py` are in your repository

### Step 2: Deploy Backend (API)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `pip install -r requirements.txt`
   - **Output Directory**: Leave empty

5. Add Environment Variables:
   ```
   PYTHONPATH=.
   SECRET_KEY=your-super-secret-key-change-this
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your-gemini-api-key-here
   DATABASE_URL=sqlite:///./dhan_sathi.db
   ```

6. Click **Deploy**

### Step 3: Deploy Frontend

1. Create a new Vercel project for frontend OR
2. Use the same project with different settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```

4. Click **Deploy**

### Step 4: Update Backend CORS

After deployment, update `app/main.py` to allow your frontend URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-frontend.vercel.app"  # Add your frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🎯 Option 2: Deploy to Render (Full-Stack Deployment)

### Step 1: Create Render Account

1. Sign up at [Render.com](https://render.com)
2. Connect your GitHub account

### Step 2: Deploy Backend

1. Click **"New +"** → **"Web Service"**
2. Connect your repository
3. Configure:
   - **Name**: `dhansathi-api`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free

4. Add Environment Variables:
   ```
   PYTHONPATH=.
   SECRET_KEY=your-super-secret-key-change-this
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

5. For production database (optional):
   - Create a PostgreSQL database on Render
   - Add `DATABASE_URL` pointing to your PostgreSQL instance

6. Click **"Create Web Service"**

### Step 3: Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Connect your repository
3. Configure:
   - **Name**: `dhansathi-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

4. Add Environment Variable:
   ```
   VITE_API_URL=https://dhansathi-api.onrender.com
   ```

5. Click **"Create Static Site"**

### Step 4: Update Backend CORS

Update `app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://dhansathi-frontend.onrender.com"  # Your frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🎯 Option 3: Single Command Deployment (Vercel CLI)

### Install Vercel CLI

```bash
npm install -g vercel
```

### Deploy

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? [Your account]
# - Link to existing project? N
# - Project name: dhansathi
# - Directory: ./
# - Override settings? N
```

### Set Environment Variables

```bash
vercel env add GEMINI_API_KEY
vercel env add SECRET_KEY
vercel env add AI_PROVIDER
```

---

## 🗄️ Database Options

### Development (SQLite)
- Default: `sqlite:///./dhan_sathi.db`
- Good for testing, not recommended for production

### Production (PostgreSQL)

**Render:**
1. Create PostgreSQL database in Render dashboard
2. Copy connection string
3. Add as `DATABASE_URL` environment variable

**Vercel + External DB:**
1. Use [Supabase](https://supabase.com) (free tier)
2. Create a PostgreSQL database
3. Copy connection string
4. Add as `DATABASE_URL` in Vercel environment variables

**Update requirements.txt for PostgreSQL:**
```txt
psycopg2-binary==2.9.9
```

---

## 🔐 Environment Variables Summary

### Backend (Required)
- `SECRET_KEY` - Random secret for JWT tokens
- `AI_PROVIDER` - `gemini` or `openai`
- `GEMINI_API_KEY` - Your Gemini API key

### Backend (Optional)
- `DATABASE_URL` - PostgreSQL connection string
- `DEBUG` - Set to `false` in production
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiry (default: 60)

### Frontend (Required)
- `VITE_API_URL` - Your backend API URL

---

## ✅ Post-Deployment Checklist

- [ ] Backend API is accessible at `/health` endpoint
- [ ] Frontend loads correctly
- [ ] API docs available at `/docs`
- [ ] Login works with demo credentials
- [ ] CORS is properly configured
- [ ] Environment variables are set
- [ ] Database is accessible (if using PostgreSQL)
- [ ] AI chat works (test Gemini API key)

---

## 🧪 Testing Deployment

### Test Backend
```bash
curl https://your-backend.vercel.app/health
```

Expected response:
```json
{"status": "healthy"}
```

### Test Frontend
Open: `https://your-frontend.vercel.app`

Login with:
- Email: `demo@dhan.local`
- Password: `password123`

---

## 🐛 Troubleshooting

### Backend Issues

**500 Internal Server Error**
- Check environment variables are set
- Verify GEMINI_API_KEY is valid
- Check logs in Vercel/Render dashboard

**CORS Errors**
- Update `allow_origins` in `app/main.py`
- Add your frontend URL to the list
- Redeploy backend

### Frontend Issues

**API Connection Failed**
- Verify `VITE_API_URL` is set correctly
- Check backend is running
- Test backend `/health` endpoint

**Build Errors**
- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility

---

## 📱 Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Render
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS with provided CNAME

---

## 🔄 Continuous Deployment

Both Vercel and Render automatically redeploy when you push to GitHub:

1. Make changes locally
2. Commit and push to GitHub
3. Automatic deployment triggers
4. Check deployment status in dashboard

---

## 💰 Pricing

### Vercel
- **Free Tier**: 100GB bandwidth, unlimited projects
- **Pro**: $20/month for more resources

### Render
- **Free Tier**: 750 hours/month, sleeps after inactivity
- **Starter**: $7/month for always-on service

---

## 📞 Support

- Check deployment logs in your platform dashboard
- Review API documentation at `/docs`
- Test individual endpoints
- Verify environment variables

---

**Happy Deploying! 🚀**
