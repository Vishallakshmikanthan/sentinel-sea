# Vercel Deployment Configuration

## Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

### Required Variables

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## How to Get Your Values

### 1. Supabase URL & Anon Key

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Click **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_ANON_KEY`

## Vercel Deployment Steps

### 1. Push Code to GitHub

```bash
cd sentinel-sea
git init
git add .
git commit -m "Initial commit: Maritime surveillance platform"
git branch -M main
git remote add origin https://github.com/Vishallakshmikanthan/sentinel-sea.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..." → "Project"**
3. Import your GitHub repository: `Vishallakshmikanthan/sentinel-sea`
4. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 3. Add Environment Variables

In Vercel project settings:
1. Go to **Settings** → **Environment Variables**
2. Add each variable:
   - Variable name: `VITE_SUPABASE_URL`
   - Value: `https://your-project.supabase.co`
   - Click **Add**
   
   - Variable name: `VITE_SUPABASE_ANON_KEY`
   - Value: `your-anon-key-here`
   - Click **Add**

### 4. Deploy

Click **"Deploy"** - Vercel will:
- Install dependencies
- Build the Vite app
- Deploy to production

Your app will be live at: `https://sentinel-sea-yourname.vercel.app`

---

## Build Configuration

The app uses Vite, which is automatically detected by Vercel.

**Build Settings (Auto-configured):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

---

## Troubleshooting

### Issue: Build fails with "command not found"
**Solution:** Ensure Root Directory is set to `frontend`

### Issue: Environment variables not working
**Solution:** 
- Variables must start with `VITE_` prefix
- Redeploy after adding variables

### Issue: Supabase connection fails
**Solution:**
- Verify URLs  don't have trailing slashes
- Check anon key is correct (not service_role key)
- Ensure RLS policies are enabled in Supabase

---

## Production Checklist

Before going live:

- [ ] Environment variables configured in Vercel
- [ ] Supabase database schema created
- [ ] Sample data inserted (optional)
- [ ] Test deployment URL works
- [ ] Supabase connection verified (green notification)
- [ ] Real-time updates working
- [ ] All features tested

---

## Custom Domain (Optional)

To add a custom domain:
1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `sentinel-sea.com`)
3. Update DNS records as instructed
4. SSL certificate automatically provisioned

---

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch automatically deploys
- Preview deployments for pull requests
- Instant rollbacks available

---

## Environment Variable Summary

Copy these to Vercel:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

🚀 **That's it! Your maritime surveillance platform is ready for deployment.**
