# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SnapKnowAI is a nutrition tracking application built with React, TypeScript, and Supabase. Users can log meals with photos, track macronutrients (calories, protein, carbs, fats), set nutrition goals, and view progress over time.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI Components**: shadcn-ui + Radix UI primitives
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Date Handling**: date-fns

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Authentication Flow

Authentication is managed via Supabase Auth with a React Context provider (`AuthProvider` in `src/hooks/useAuth.tsx`). The app supports:
- Email/password authentication
- Google OAuth
- Automatic session persistence via localStorage
- Auth state synchronization across tabs

All authenticated pages should be wrapped in `AuthProvider` (already done at the App level). Access the auth context via:
```tsx
const { user, session, signIn, signUp, signInWithGoogle, signOut, loading } = useAuth();
```

### Database Schema

The database has three main tables (defined in `src/integrations/supabase/types.ts`):

1. **profiles** - User profile information
   - Links to auth.users via id (FK)
   - Stores email, full_name, avatar_url

2. **meals** - Meal tracking entries
   - user_id (FK to auth.users)
   - food_name, calories, protein, carbs, fats
   - meal_type (breakfast, lunch, dinner, snack)
   - image_url (links to Supabase Storage)
   - created_at timestamp for historical tracking

3. **user_goals** - Nutrition targets per user
   - user_id (FK to auth.users, UNIQUE)
   - daily_calories, target_protein, target_carbs, target_fats

All tables use Row Level Security (RLS) policies - users can only access their own data.

### Data Fetching Pattern

The app uses TanStack Query for server state but also direct Supabase calls in components. When fetching data:

1. Always filter by user_id (enforced by RLS but good practice)
2. Use date ranges for meal queries (see `Dashboard.tsx` fetchMeals function)
3. Handle loading and error states
4. Show toast notifications for user feedback

Example meal query:
```tsx
const { data, error } = await supabase
  .from('meals')
  .select('*')
  .gte('created_at', startDate.toISOString())
  .lte('created_at', endDate.toISOString())
  .order('created_at', { ascending: false });
```

### Storage (Meal Photos)

Meal photos are stored in the `meal-photos` bucket with this structure:
```
meal-photos/
  {user_id}/
    {filename}
```

Storage policies ensure users can only access their own photos. When uploading:
1. Generate unique filename (timestamp-based recommended)
2. Upload to `meal-photos/{user.id}/{filename}`
3. Get public URL via `supabase.storage.from('meal-photos').getPublicUrl()`
4. Store URL in meals.image_url

### Component Structure

- **Pages** (`src/pages/`) - Full page components, handle routing
  - `Dashboard.tsx` - Main app interface with meal logging and progress tracking
  - `Landing.tsx` - Marketing/landing page
  - `Auth.tsx` - Login/signup forms

- **Feature Components** (`src/components/`) - Self-contained feature dialogs
  - `AddMealDialog.tsx` - Form to log new meals
  - `EditMealDialog.tsx` - Form to edit existing meals
  - `GoalsDialog.tsx` - Form to set nutrition goals
  - `ProgressCharts.tsx` - Data visualizations using recharts

- **UI Components** (`src/components/ui/`) - shadcn-ui primitives
  - Imported from shadcn-ui, shouldn't need modification
  - Re-exported from component files

### Path Aliases

The project uses `@/` as an alias for `src/`:
```tsx
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
```

## Important Conventions

### Language
The UI is in **Portuguese** (Portugal variant). All user-facing text, toast messages, and form labels should be in Portuguese. Examples:
- "Login efetuado com sucesso!" (Successful login)
- "Erro ao fazer login" (Login error)

### Date Formatting
Use date-fns with Portuguese locale:
```tsx
import { format } from "date-fns";
import { pt } from "date-fns/locale";

format(date, "PPP", { locale: pt });
```

### TypeScript Configuration
- `noImplicitAny: false` - Project allows implicit any
- `strictNullChecks: false` - Null checks are not strict
- Follow existing patterns when adding new code

### Supabase Type Safety
The `Database` type in `src/integrations/supabase/types.ts` is auto-generated. When the database schema changes:
1. Update migrations in `supabase/migrations/`
2. Regenerate types (if Supabase CLI is available)
3. Use the `Tables<'table_name'>` helper for row types

## Database Migrations

Migrations are in `supabase/migrations/` as SQL files. When adding new migrations:
1. Create timestamped SQL file: `YYYYMMDDHHMMSS_description.sql`
2. Include both schema changes and RLS policies
3. Test locally with Supabase CLI if possible

## Common Patterns

### Adding a New Meal
1. User fills form in `AddMealDialog`
2. Optional: Upload photo to Storage
3. Insert row into `meals` table with user_id
4. Refresh meals list
5. Show success toast

### Updating Goals
1. User edits values in `GoalsDialog`
2. Upsert into `user_goals` table (UNIQUE constraint on user_id)
3. Update local state
4. Show success toast

### Date Filtering
Dashboard supports multiple date ranges (today, week, month, custom). Use date-fns functions:
- `startOfDay()`, `endOfDay()` for single day
- `startOfWeek()`, `endOfWeek()` for week (with pt locale)
- `startOfMonth()`, `endOfMonth()` for month

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_URL=https://your-project.supabase.co
```

## Deployment

This project is designed for Lovable.dev platform but can be deployed anywhere that supports Vite apps:
1. Build: `npm run build`
2. Deploy `dist/` folder to static hosting
3. Ensure environment variables are set in hosting platform
