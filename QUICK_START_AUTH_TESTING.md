# 🚀 Quick Start Guide - Authentication Testing

## ⚠️ IMPORTANT: Database Setup Required

The Prisma migration is stuck. **You must manually add the password_hash column first:**

### Option 1: Supabase Dashboard (Easiest)
1. Go to: https://supabase.com/dashboard/project/jeghgombokmmqhwjahbq/sql
2. Paste and run:
   ```sql
   ALTER TABLE auth_profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
   ```

### Option 2: Cancel and Retry Prisma
1. Press `Ctrl+C` in the terminal running `npx prisma db push`
2. Wait 30 seconds
3. Run: `npx prisma db push --accept-data-loss`

---

## 🎯 Testing Steps (After Database Setup)

### 1. Start Backend
```bash
cd backend
npm run dev
```
✅ Should see: `🚀 Community App running on port 3000`

### 2. Start Frontend
```bash
cd ui_audit  
npm run dev
```
✅ Should see: `Local: http://localhost:5173/`

### 3. Test Registration
- Go to: http://localhost:5173/register
- Create account with any email/password
- ✅ Should redirect to `/app/posts`
- ✅ Check DevTools → Cookies → should see `connect.sid`

### 4. Test Session Persistence
- Refresh the page (F5)
- ✅ Should stay logged in (not redirect to login)

### 5. Test Logout
- Click logout
- ✅ Should redirect to `/login`
- ✅ Cookie should be gone

### 6. Test Login
- Login with same credentials
- ✅ Should work and redirect to `/app/posts`

---

## 📚 Full Documentation

- **Implementation Plan:** [implementation_plan.md](file:///C:/Users/suriy/.gemini/antigravity/brain/fded5bd3-3499-44f0-9a1f-ca7bd2e22e90/implementation_plan.md)
- **Testing Walkthrough:** [walkthrough.md](file:///C:/Users/suriy/.gemini/antigravity/brain/fded5bd3-3499-44f0-9a1f-ca7bd2e22e90/walkthrough.md)
- **Task Checklist:** [task.md](file:///C:/Users/suriy/.gemini/antigravity/brain/fded5bd3-3499-44f0-9a1f-ca7bd2e22e90/task.md)

---

## 🐛 Troubleshooting

**"Cannot find module 'bcrypt'"**
```bash
cd backend
npm install bcrypt @types/bcrypt
```

**Login fails / Session not persisting**
- Check if password_hash column exists in database
- Check backend console for "Session saved successfully"
- Check browser cookies for `connect.sid`

**CORS errors**
- Backend should show: `🌐 CORS enabled for origins: ...`
- Frontend should be on `http://localhost:5173`
