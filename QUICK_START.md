# ⚡ QUICK START GUIDE

## ✅ What Was Done

1. **Removed Live Preview** - Completely deleted, "pura entirely"
2. **Auto-saves to templates.json** - On "Save Experiment" click
3. **Auto-creates JSX file** - In templates folder
4. **Auto-visible to participants** - In templates section
5. **Fixed database error** - Dropped problematic index

---

## 🚀 How to Use (For Researchers)

```
1. Open AI Experiment Builder
   ↓
2. Chat with AI about your experiment
   ↓
3. AI generates the code
   ↓
4. Enter Title + Description
   ↓
5. Click "Save Experiment" 👈 ONE BUTTON!
   ↓
6. ✨ MAGIC HAPPENS ✨
   - Saves to database
   - Creates JSX file
   - Updates templates.json
   - Available to participants
```

---

## 📁 What Gets Created

**File Created:**
```
frontend/src/components/experiment/templates/YourTitleTemplate.jsx
```

**Entry Added to:**
```
frontend/templates.json
```

**Database Record:**
```
MongoDB: experiments collection
```

---

## 🔍 Verify It Worked

**Backend Console:**
```
✅ AI experiment saved to DB: 507f1f77bcf86cd799439011
✅ Template file created: frontend/src/components/.../YourTitleTemplate.jsx
✅ templates.json updated successfully
```

**Frontend Response:**
```json
{
  "success": true,
  "message": "AI-generated experiment saved successfully and added to templates"
}
```

**Check Files:**
```bash
# Check if template file exists
ls frontend/src/components/experiment/templates/YourTitleTemplate.jsx

# Check if templates.json updated
cat frontend/templates.json | grep "your-title"
```

---

## 🐛 If Something Breaks

### Database Error (E11000)?
```bash
cd backend
node fix-experiment-index.js
```

### Template not appearing?
1. Check backend console logs
2. Verify JSX file exists
3. Check templates.json has the entry
4. Refresh participant page

---

## 🎯 Current State

- ✅ **2 Tabs**: Chat + Code (Preview REMOVED)
- ✅ **Save Button**: Does everything automatically
- ✅ **Database**: Fixed and working
- ✅ **Security**: Validated and safe
- ✅ **Ready**: Production ready!

---

## 💻 Run The App

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Then:**
1. Go to AI Experiment Builder
2. Create experiment
3. Click Save
4. Watch the magic! ✨

---

**That's it! Your life-dependent code is complete! 🎉**
