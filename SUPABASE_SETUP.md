# ✅ Supabase Integration Checklist

Follow these steps to integrate Supabase backend:

## 1. Create Supabase Project
- [ ] Go to [supabase.com](https://supabase.com) and sign up
- [ ] Click "New Project"
- [ ] Choose organization and set project name (e.g., "sentinel-sea")
- [ ] Set a strong database password
- [ ] Choose region closest to users
- [ ] Wait for project to be created (~2 minutes)

## 2. Get API Credentials
- [ ] In Supabase Dashboard, go to **Settings** → **API**
- [ ] Copy the **Project URL**
- [ ] Copy the **anon/public** key (this is safe for frontend)
- [ ] Keep **service_role** key secret (don't use in frontend!)

## 3. Run Database Schema
- [ ] In Supabase Dashboard, go to **SQL Editor**
- [ ] Click **New Query**
- [ ] Open `supabase-integration-guide.md` → Step 2
- [ ] Copy the entire SQL schema
- [ ] Paste into SQL Editor and click **Run**
- [ ] Verify tables created: Go to **Database** → **Tables**

## 4. Insert Sample Data
- [ ] Open `supabase-integration-guide.md` → Step 3
- [ ] Copy the sample data SQL
- [ ] Paste into SQL Editor and click **Run**
- [ ] Verify data: Go to **Table Editor** → `vessel_detections`

## 5. Configure Frontend
- [ ] In `frontend/` directory, create `.env` file
- [ ] Copy content from `.env.example`
- [ ] Replace `your-project-url-here` with your Project URL
- [ ] Replace `your-anon-key-here` with your anon key
- [ ] Save the file

Example `.env`:
```
VITE_SUPABASE_URL=https://abcdefg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 6. Test Integration
- [ ] Restart dev server: Stop (Ctrl+C) and run `npm run dev`
- [ ] Open browser to `http://localhost:3000`
- [ ] Open browser console (F12)
- [ ] Look for "Real-time update" logs
- [ ] Verify detections appear on map

## 7. Test Real-Time Updates
- [ ] Keep dashboard open in browser
- [ ] In Supabase Dashboard, go to **Table Editor** → `vessel_detections`
- [ ] Click **Insert row**
- [ ] Fill in:
  - `vessel_id`: VSL-20260130-A999
  - `latitude`: 9.2500
  - `longitude`: 79.1500
  - `ais_status`: OFF
  - `threat_score`: 95
  - Other fields will auto-fill
- [ ] Click **Save**
- [ ] See new detection appear on dashboard automatically! 🎉

## 8. Test Analyst Actions
- [ ] Click on a detection on the map
- [ ] Click "Confirm Anomaly" or "Dismiss False Positive"
- [ ] Check Supabase → `vessel_detections` → `review_status` updated
- [ ] Check Supabase → `analyst_actions` → new row created

## Troubleshooting

### Issue: "Missing Supabase environment variables"
- Make sure `.env` file exists in `frontend/` directory
- Variables must start with `VITE_` prefix
- Restart dev server after creating `.env`

### Issue: "No detections showing"
- Check browser console for errors
- Verify sample data was inserted
- Check RLS policies are enabled
- Try refreshing the page

### Issue: "Real-time not working"
- Check browser console for subscription errors
- Verify Supabase project is not paused (free tier auto-pauses after inactivity)
- Check Network tab for websocket connection

## Next Steps

Once integration is working:
- [ ] Create more sample detections
- [ ] Test filtering and analytics
- [ ] Test export functionality
- [ ] Add custom query functions if needed

## Resources
- 📖 [Supabase Docs](https://supabase.com/docs)
- 🎥 [Supabase YouTube](https://www.youtube.com/@Supabase)
- 💬 [Supabase Discord](https://discord.supabase.com)
