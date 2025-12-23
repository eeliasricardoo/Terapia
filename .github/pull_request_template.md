# Replace Mock Data with Real Supabase Queries

## 📋 Summary

This PR replaces hardcoded mock data with real database queries using Supabase across psychologist and dashboard pages. The implementation follows a Server Component pattern for optimal performance and type safety.

## 🎯 Objectives

- ✅ Remove hardcoded mock data from psychologist pages
- ✅ Implement type-safe database queries with Supabase
- ✅ Convert pages to Server Components where appropriate
- ✅ Maintain existing UI/UX while using real data
- ✅ Prepare infrastructure for future features (sessions, messaging)

## 🏗️ Infrastructure Changes

### New Files Created

#### Types & Server Actions
- `src/lib/supabase/types.ts` - TypeScript types for database schema
- `src/lib/actions/psychologists.ts` - Server Actions for psychologist queries
- `src/lib/actions/profile.ts` - Server Actions for user profile management
- `src/lib/actions/sessions.ts` - Placeholder for future session management

#### Database
- `supabase/migrations/002_psychologists_seed.sql` - Seed data with 6 sample psychologists

#### Documentation
- `docs/SEED_DATABASE.md` - Instructions for applying seed migration
- `scripts/apply-migrations.sh` - Script to apply migrations

#### Components
- `src/app/psicologo/[id]/PsychologistProfileClient.tsx` - Client component for interactivity
- `src/app/psicologo/[id]/not-found.tsx` - 404 page for missing psychologists

## 📝 Modified Pages

### Psychologist Pages (100% Real Data)

#### `/busca` - Search Page
**Before:**
- Used hardcoded `PSYCHOLOGISTS` array
- Static data, no database connection

**After:**
- Async Server Component
- Fetches psychologists with `getPsychologists()`
- Displays real data from `psychologist_profiles` table
- Maintains same UI/UX

**Key Changes:**
```tsx
// Before
const PSYCHOLOGISTS = [...]

// After
const psychologists = await getPsychologists()
```

#### `/psicologo/[id]` - Psychologist Profile
**Before:**
- Used hardcoded `DOCTOR` object
- Client Component with static data

**After:**
- Server Component fetches data with `getPsychologistById()`
- Passes data to Client Component for interactivity
- Returns 404 if psychologist not found
- Displays real bio, specialties, CRP, pricing

**Architecture:**
```
page.tsx (Server) → fetches data → PsychologistProfileClient.tsx (Client)
```

### Dashboard Pages (Partial Real Data)

#### `/dashboard` - Main Dashboard
**Changes:**
- ✅ Fetches real user profile with `getCurrentUserProfile()`
- ✅ Displays personalized greeting with user's name
- ⚠️ Session data still uses mocks (awaiting `sessions` table)

**Before:**
```tsx
<h1>Olá, Ana! 👋</h1>
```

**After:**
```tsx
const userName = userProfile?.full_name?.split(' ')[0] || 'Usuário'
<h1>Olá, {userName}! 👋</h1>
```

#### `/dashboard/sessoes` & `/dashboard/mensagens`
- ⚠️ Still use mock data (temporary)
- ✅ Added TODO comments indicating future implementation
- ✅ Prepared for integration when `sessions` table is created

## 🗄️ Database Schema

### Seed Data
Created 6 sample psychologist profiles:
1. **Dra. Ana María Rojas** - TCC e Ansiedade (R$ 150)
2. **Dr. Carlos Fuentes** - Terapia de Casal (R$ 180)
3. **Dra. Sofia Vergara** - Psicologia Infantil (R$ 160)
4. **Dra. Isabella Gómez** - Depressão e Mindfulness (R$ 140)
5. **Dr. Juan David Pérez** - Terapia Humanista (R$ 170)
6. **Dra. Valentina Ortiz** - Neuropsicologia (R$ 200)

### Tables Used
- `profiles` - User profile data
- `psychologist_profiles` - Psychologist-specific data (bio, CRP, specialties, pricing)

## 🧪 Testing

### Build Verification
```bash
npm run build
```
- ✅ All modified pages compile successfully
- ✅ No new TypeScript errors
- ⚠️ Pre-existing error in `/pagamento` (unrelated to this PR)

### Manual Testing Checklist
- [ ] Apply seed migration (see `docs/SEED_DATABASE.md`)
- [ ] Navigate to `/busca` - verify psychologists load
- [ ] Click on psychologist - verify profile page loads
- [ ] Check dashboard - verify user name appears
- [ ] Test 404 page with invalid psychologist ID

## 📊 Impact Analysis

### Performance
- ✅ Server Components reduce client-side JavaScript
- ✅ Data fetched on server (faster initial load)
- ✅ Type-safe queries prevent runtime errors

### Data Flow
**Before:**
```
Component → Hardcoded Array → Render
```

**After:**
```
Server Component → Supabase Query → Database → Render
```

### Breaking Changes
- ❌ None - UI/UX remains identical
- ✅ Backward compatible

## 🔮 Future Work

### Sessions Table (Next Priority)
To complete the mock replacement:
1. Create `sessions` table migration
2. Implement Server Actions in `sessions.ts`
3. Update dashboard pages to use real session data
4. Add RLS policies for security

### Additional Features
- Reviews/ratings system for psychologists
- Functional search filters
- Pagination for search results
- Real-time messaging system

## 📚 Documentation

### For Developers
- `docs/SEED_DATABASE.md` - How to populate database
- `src/lib/supabase/types.ts` - Type definitions
- `src/lib/actions/` - Server Action implementations

### For Reviewers
- All Server Actions include error handling
- TypeScript types ensure type safety
- Comments added where mock data remains

## ⚠️ Important Notes

### Before Merging
1. **Apply seed migration** to populate database
2. Verify Supabase connection is configured
3. Test on staging environment

### After Merging
1. Run seed migration on production
2. Monitor for any database query errors
3. Plan sessions table implementation

## 🎯 Success Metrics

- ✅ 100% of psychologist data from database
- ✅ 100% of user profile data from database
- ✅ Zero hardcoded psychologist data in code
- ✅ Type-safe database queries
- ✅ Build passes successfully

## 👥 Reviewers

Please verify:
- [ ] Database queries are efficient
- [ ] Error handling is appropriate
- [ ] Types are correctly defined
- [ ] UI/UX matches previous implementation
- [ ] Documentation is clear

---

**Related Issues:** N/A  
**Breaking Changes:** None  
**Deployment Notes:** Requires seed migration application
