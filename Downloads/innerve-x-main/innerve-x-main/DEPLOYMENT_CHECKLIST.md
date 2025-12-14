# 🚀 Deployment Checklist

## Before Deploying

- [ ] Code is pushed to GitHub
- [ ] All dependencies are in `requirements.txt` and `package.json`
- [ ] Environment variables are documented
- [ ] Get Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Deploy to Render (Recommended)

### Backend
- [ ] Create new Web Service on Render
- [ ] Set Runtime: Python 3
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Add environment variables:
  - [ ] `PYTHONPATH=.`
  - [ ] `SECRET_KEY=<random-string>`
  - [ ] `AI_PROVIDER=gemini`
  - [ ] `GEMINI_API_KEY=<your-key>`
- [ ] Copy backend URL

### Frontend
- [ ] Create new Static Site on Render
- [ ] Set Root Directory: `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `frontend/dist`
- [ ] Add environment variable:
  - [ ] `VITE_API_URL=<backend-url>`
- [ ] Deploy

### After Deployment
- [ ] Update CORS in `app/main.py` with frontend URL
- [ ] Push changes to trigger redeploy
- [ ] Test login with demo@dhan.local / password123
- [ ] Test AI chat feature
- [ ] Test all major features

## Deploy to Vercel (Alternative)

### Backend
- [ ] Run: `vercel`
- [ ] Add environment variables via Vercel dashboard or CLI
- [ ] Copy backend URL

### Frontend  
- [ ] Create separate Vercel project
- [ ] Set Root Directory: `frontend`
- [ ] Add `VITE_API_URL` environment variable
- [ ] Deploy

### After Deployment
- [ ] Update CORS settings
- [ ] Test all features

## Testing Deployment

- [ ] Backend health check: `curl https://your-backend.com/health`
- [ ] Frontend loads correctly
- [ ] API docs accessible: `https://your-backend.com/docs`
- [ ] Login works
- [ ] Transactions page loads
- [ ] AI chat responds
- [ ] Goals can be created
- [ ] Insights display

## Post-Deployment

- [ ] Update README with live URLs
- [ ] Monitor for errors in dashboard
- [ ] Set up custom domain (optional)
- [ ] Enable analytics (optional)

---

**Need help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
