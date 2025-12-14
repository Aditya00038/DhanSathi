# 🚀 Quick Deployment Guide

## Recommended: Deploy to Render (Full-Stack)

Render is recommended for this full-stack app as it handles both frontend and backend easily.

### Option 1: One-Click Deploy with Render

1. **Create a [Render](https://render.com) account** and connect GitHub

2. **Deploy Backend:**
   - Click "New +" → "Web Service"
   - Select your repository
   - Name: `dhansathi-api`
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add Environment Variables:
     ```
     PYTHONPATH=.
     SECRET_KEY=your-random-secret-key-here
     AI_PROVIDER=gemini
     GEMINI_API_KEY=your-gemini-api-key
     ```
   - Click "Create Web Service"
   - Copy the backend URL (e.g., `https://dhansathi-api.onrender.com`)

3. **Deploy Frontend:**
   - Click "New +" → "Static Site"
   - Select your repository
   - Name: `dhansathi-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `frontend/dist`
   - Add Environment Variable:
     ```
     VITE_API_URL=https://dhansathi-api.onrender.com
     ```
   - Click "Create Static Site"

4. **Update CORS in backend:**
   - Edit `app/main.py` line 18-19:
   ```python
   allow_origins=["http://localhost:5173", "https://your-frontend-url.onrender.com"],
   ```
   - Push to GitHub (will auto-redeploy)

### Option 2: Deploy to Vercel (Serverless)

**For Backend:**
1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel`
3. Follow prompts
4. Add environment variables:
   ```bash
   vercel env add GEMINI_API_KEY
   vercel env add SECRET_KEY
   vercel env add AI_PROVIDER
   ```

**For Frontend (Separate Project):**
1. Create new Vercel project
2. Set Root Directory: `frontend`
3. Framework: Vite
4. Add env variable: `VITE_API_URL=https://your-backend.vercel.app`

### Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

### Test Your Deployment
- Visit your frontend URL
- Login with: `demo@dhan.local` / `password123`
- Try the AI chat feature

---

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions and troubleshooting.
