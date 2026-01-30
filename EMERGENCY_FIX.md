# 🚨 EMERGENCY VERCEL FIX - 2 MINUTES

## FASTEST FIX (Do this NOW!)

### In Vercel Dashboard:

1. **Go to your project** → **Settings** → **General**

2. **Change Root Directory:**
   - REMOVE "frontend" 
   - Leave it **BLANK** or set to `.`

3. **Build & Development Settings:**
   ```
   Build Command: cd frontend && npm install && npm run build
   Output Directory: frontend/dist
   Install Command: cd frontend && npm install
   ```

4. **Click "Save"** at the bottom

5. **Go to Deployments tab** → **Click "Redeploy"** on latest

---

## ALTERNATIVE: Deploy WITHOUT Frontend Subdirectory

If the above doesn't work in 30 seconds, do this:

### Move Files to Root (Quick Fix)

```bash
cd c:\Users\visha\Downloads\Antigravity\sentinel-sea
cp -r frontend/* .
git add .
git commit -m "fix: Move to root for Vercel"
git push origin main
```

Then in Vercel:
- Root Directory: **BLANK**
- Build Command: `npm run build`
- Output Directory: `dist`

---

## BACKUP SOLUTION: Use Netlify (2 minutes)

If Vercel still fails:

1. Go to [netlify.com](https://app.netlify.com)
2. **"Add new site" → "Import from Git"**
3. Select your GitHub repo
4. Settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
5. **Environment variables:** Add the same 2 Supabase vars
6. Deploy

Netlify usually works better with monorepos!

---

## If You Need INSTANT Demo (No Deploy)

Run locally and share screen:
```bash
cd frontend
npm run dev
```
Then share your screen showing `localhost:5173` - works perfectly!

---

## Quick Check: Is Build Failing?

In Vercel deployment logs, if you see:
- ❌ "Error: No output directory" → Fix: Set output to `frontend/dist`
- ❌ "Command not found" → Fix: Change root directory setting
- ❌ "Build failed" → Check the build log for npm errors

---

**TRY THE FIRST FIX NOW** - It should work in under 1 minute!
