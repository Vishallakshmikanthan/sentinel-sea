# Vercel Environment Variables

## Copy these exact variable names and values to Vercel

### 1. VITE_SUPABASE_URL
**Variable Name:**
```
VITE_SUPABASE_URL
```

**Value:** (Replace with your actual Supabase URL)
```
https://your-project-id.supabase.co
```

**How to get it:**
- Go to Supabase Dashboard → Settings → API
- Copy the "Project URL"

---

### 2. VITE_SUPABASE_ANON_KEY
**Variable Name:**
```
VITE_SUPABASE_ANON_KEY
```

**Value:** (Replace with your actual Supabase anon key)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get it:**
- Go to Supabase Dashboard → Settings → API
- Copy the "anon public" key (the long string)

---

## Vercel Deployment Steps

### 1. In Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..." → "Project"**
3. Click **"Import Git Repository"**
4. Select: `Vishallakshmikanthan/sentinel-sea`

### 2. Configure Build Settings

**Root Directory:**
```
frontend
```

**Framework Preset:**
```
Vite
```

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm install
```

### 3. Add Environment Variables

Click on **"Environment Variables"** section before deploying.

Add these two variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbG...your-key...` |

### 4. Deploy

Click **"Deploy"** button.

Vercel will:
- Clone your repository
- Install dependencies
- Build the Vite app
- Deploy to production

Your site will be live at:
```
https://sentinel-sea.vercel.app
```
(or your custom domain)

---

## ⚠️ Important Notes

1. **DO NOT use the service_role key** - Only use the anon public key
2. **Variables must start with `VITE_`** - This is required for Vite to expose them
3. **Redeploy after adding variables** - If you forgot to add them initially  
4. **Check .env.example** - In `frontend/.env.example` for reference

---

## Quick Copy-Paste Checklist

For Vercel's environment variable form:

**Variable 1:**
- Name: `VITE_SUPABASE_URL`
- Value: Get from Supabase Dashboard → Settings → API → Project URL

**Variable 2:**
- Name: `VITE_SUPABASE_ANON_KEY`
- Value: Get from Supabase Dashboard → Settings → API → anon public key

---

## Troubleshooting

**Issue: Build fails**
- Ensure Root Directory is set to `frontend`
- Check all dependencies are in package.json

**Issue: Supabase not connecting**
- Verify environment variables are correct
- Make sure variable names start with `VITE_`
- Check there are no trailing slashes in URL
- Redeploy after adding variables

**Issue: Real-time not working**
- Check Supabase Realtime is enabled
- Verify RLS policies allow SELECT

---

## ✅ Deployment Checklist

Before marking complete:

- [ ] Code pushed to GitHub
- [ ] Vercel project linked to repository
- [ ] Root directory set to `frontend`
- [ ] Both environment variables added
- [ ] Successfully deployed
- [ ] Website loads at Vercel URL
- [ ] Green "Supabase Connected" notification shows
- [ ] Detections display on map
- [ ] Real-time updates working

🎉 **Your maritime surveillance platform is now live!**
