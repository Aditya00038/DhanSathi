# 🚀 Render Deployment Guide

## Quick Deploy to Render

### Prerequisites
- GitHub account with your code pushed
- Render account (sign up at https://render.com)
- Gemini API Key (get from https://makersuite.google.com/app/apikey)

---

## 🎯 Step-by-Step Deployment

### Step 1: Sign Up & Connect GitHub

1. Go to [Render.com](https://render.com)
2. Click **"Get Started"**
3. Sign up with GitHub (recommended) or email
4. Authorize Render to access your repositories

### Step 2: Deploy Backend API

1. From Render Dashboard, click **"New +"** → **"Web Service"**

2. Connect your repository:
   - Select: `innerve-x-main` (or your repo name)
   - Click **"Connect"**

3. Configure the service:
   ```
   Name: dhansathi-api
   Region: Oregon (US West)
   Branch: main
   Root Directory: (leave blank)
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Instance Type: Free
   ```

4. Add Environment Variables (click **"Advanced"**):
   - `PYTHONPATH` = `.`
   - `AI_PROVIDER` = `gemini`
   - `GEMINI_API_KEY` = `AIzaSyCjSbpQJurjWLZadA52EKpGK0t7lbm2cQQ` (your key)
   - `SECRET_KEY` = `.08:=5MUIbvqmy1ncTd(i#-K/s?De[zZ` (or generate random)

5. Click **"Create Web Service"**

6. Wait for deployment (3-5 minutes)

7. **Copy your backend URL** (e.g., `https://dhansathi-api.onrender.com`)

### Step 3: Deploy Frontend

1. Click **"New +"** → **"Static Site"**

2. Connect the same repository

3. Configure:
   ```
   Name: dhansathi-frontend
   Region: Oregon (US West)
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

4. Add Environment Variable:
   - `VITE_API_URL` = `https://dhansathi-api.onrender.com` (use your backend URL from Step 2)

5. Click **"Create Static Site"**

6. Wait for deployment (2-3 minutes)

### Step 4: Update Backend CORS

The CORS settings have already been updated to accept all origins (`"*"`), so your frontend should work immediately.

If you want to restrict CORS to only your frontend URL:

1. Edit `app/main.py` locally
2. Update the `allow_origins` list with your frontend URL
3. Push to GitHub
4. Render will auto-redeploy

---

## ✅ Post-Deployment

### Test Your Backend
```bash
curl https://dhansathi-api.onrender.com/health
```

Expected response:
```json
{"status": "healthy"}
```

### Test Your Frontend
1. Open your frontend URL (e.g., `https://dhansathi-frontend.onrender.com`)
2. Login with: `demo@dhan.local` / `password123`
3. Test features: transactions, goals, AI chat

---

## 🔄 Auto-Deploy on Git Push

Both services are now connected to your GitHub repo:
- Push changes to `main` branch
- Render automatically detects and redeploys
- Check deployment logs in Render dashboard

---

## 💰 Free Tier Limits

**Free Plan Includes:**
- 750 hours/month
- Services sleep after 15 min of inactivity
- First request after sleep takes ~30 seconds (cold start)
- 100 GB bandwidth/month

**Upgrade to keep services always-on:**
- Starter Plan: $7/month per service
- No cold starts
- More resources

---

## 🗄️ Database (Optional Upgrade)

For production, use PostgreSQL instead of SQLite:

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Name: `dhansathi-db`
3. Copy the **Internal Database URL**
4. Add to backend environment variables:
   - `DATABASE_URL` = `[paste PostgreSQL URL]`
5. Add to `requirements.txt`:
   ```
   psycopg2-binary==2.9.9
   ```
6. Push to GitHub to redeploy

---

## 🐛 Troubleshooting

### Backend shows 500 error
- Check logs: Dashboard → dhansathi-api → Logs
- Verify environment variables are set
- Check GEMINI_API_KEY is valid

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly
- Test backend `/health` endpoint
- Check browser console for CORS errors

### Service is sleeping
- First request after 15min inactivity takes ~30sec
- Upgrade to paid plan for always-on service

### Build fails
- Check logs for specific error
- Verify all dependencies in `requirements.txt`/`package.json`
- Ensure correct Python/Node versions

---

## 📊 Monitor Your Apps

**View Logs:**
- Dashboard → Select Service → Logs tab
- Real-time log streaming
- Search and filter logs

**Metrics:**
- Dashboard → Select Service → Metrics tab
- CPU, Memory, Request count
- Response times

**Events:**
- Deployment history
- Builds and crashes
- Environment changes

---

## 🌐 Custom Domain (Optional)

1. Go to Settings → Custom Domain
2. Click **"Add Custom Domain"**
3. Enter your domain (e.g., `dhansathi.com`)
4. Follow DNS setup instructions
5. Render provides free SSL certificates

---

## 🔐 Security Best Practices

1. **Rotate SECRET_KEY** regularly
2. **Restrict CORS** to specific domains in production
3. **Use PostgreSQL** for production database
4. **Enable 2FA** on your Render account
5. **Monitor logs** for suspicious activity

---

## 📞 Support

- Render Docs: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

---

## 🎉 You're Live!

**Frontend:** https://dhansathi-frontend.onrender.com
**Backend:** https://dhansathi-api.onrender.com
**API Docs:** https://dhansathi-api.onrender.com/docs

Share your app and start helping people manage their finances! 💰
