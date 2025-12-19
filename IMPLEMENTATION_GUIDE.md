# Linktree Alternative - Complete Implementation Guide

This guide provides step-by-step instructions for implementing the full-stack Linktree alternative with Next.js and Supabase.

## 📋 Table of Contents

1. [Environment Setup](#environment-setup)
2. [Database Configuration](#database-configuration)
3. [Project Structure](#project-structure)
4. [Implementation Steps](#implementation-steps)
5. [Deployment](#deployment)

## 🔧 Environment Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `linktree-clone`
   - Database Password: (generate strong password)
   - Region: Choose closest to your users
5. Wait for project to be created (~2 minutes)

### 2. Get Supabase Credentials

1. In your Supabase project dashboard
2. Go to Settings → API
3. Copy:
   - Project URL
   - `anon` `public` key

### 3. Configure Environment Variables

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** Never commit `.env.local` to Git!

## 🗄️ Database Configuration

### Run SQL in Supabase SQL Editor

Go to Supabase Dashboard → SQL Editor → New Query and run:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

-- Links table
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT url_format CHECK (url ~ '^https?://')
);

-- Social links table
CREATE TABLE social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, platform)
);

-- Indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_position ON links(user_id, position);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Links policies
CREATE POLICY "Active links are viewable by everyone"
  ON links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view own links"
  ON links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own links"
  ON links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links"
  ON links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links"
  ON links FOR DELETE
  USING (auth.uid() = user_id);

-- Social links policies
CREATE POLICY "Social links are viewable by everyone"
  ON social_links FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own social links"
  ON social_links FOR ALL
  USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## 📁 Project Structure

The implementation follows this structure:

```
whitelabellinkinbio/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       ├── settings/
│   │       │   └── page.tsx
│   │       └── layout.tsx
│   ├── [username]/
│   │   └── page.tsx
│   ├── api/
│   │   ├── links/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── profile/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   ├── dashboard/
│   └── profile/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── types/
│       └── database.ts
├── .env.local
└── package.json
```

## 🚀 Implementation Steps

### Step 1: Create Supabase Client Utilities

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
```

### Step 2: Create Type Definitions

Create `lib/types/database.ts`:

```typescript
export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme: "light" | "dark";
  created_at: string;
  updated_at: string;
}

export interface Link {
  id: string;
  user_id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  position: number;
  is_active: boolean;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  id: string;
  user_id: string;
  platform: string;
  url: string;
  created_at: string;
}
```

### Step 3: Implement Authentication Pages

The authentication pages are already implemented in the codebase. Check:

- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`

### Step 4: Implement Dashboard

The dashboard implementation is in:

- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/dashboard/layout.tsx`
- `app/(dashboard)/dashboard/settings/page.tsx`

### Step 5: Implement Public Profile Pages

The public profile page is in:

- `app/[username]/page.tsx`

### Step 6: Implement API Routes

API routes are in:

- `app/api/links/route.ts`
- `app/api/links/[id]/route.ts`

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub:**

   ```bash
   git add .
   git commit -m "Implement Next.js Linktree alternative"
   git push origin feature/nextjs-implementation
   ```

2. **Deploy via Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Deploy!

3. **Configure Supabase:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL to "Site URL"
   - Add redirect URLs for auth callbacks

### Alternative: Deploy to Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import repository
4. Add environment variables
5. Deploy

## ✅ Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads correctly
- [ ] Can add/edit/delete links
- [ ] Public profile page displays correctly
- [ ] Links are clickable and tracked
- [ ] Mobile responsive
- [ ] SEO meta tags present

## 🆘 Troubleshooting

### Issue: "Invalid API key"

**Solution:** Check that environment variables are correctly set in `.env.local`

### Issue: "User not found"

**Solution:** Ensure the database trigger for creating profiles is working

### Issue: "Permission denied"

**Solution:** Check Row Level Security policies in Supabase

### Issue: Build errors

**Solution:** Run `npm install` to ensure all dependencies are installed

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Need help?** Check the main implementation guide or create an issue in the repository.
