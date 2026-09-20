# Deploying Aily to Vercel with Supabase Authentication

This guide walks you through deploying **Aily** to Vercel with Supabase Auth (Email & Password) and database progress synchronization.

---

## Part 1: Setup Supabase (Database & Auth)

1. Go to [supabase.com](https://supabase.com) and create a **New Project** (free tier).
2. Once created, click on **SQL Editor** in the left menu.
3. Open [`supabase_schema.sql`](./supabase_schema.sql) in this repository, copy the SQL, paste it into the Supabase SQL editor, and click **Run**.
   * This creates the `user_progress` table with Row Level Security (RLS) so each student's progress is private and secure.
4. Go to **Project Settings** → **API**.
5. Copy your:
   * **Project URL** (e.g. `https://xyzproject.supabase.co`)
   * **anon public Key** (e.g. `eyJhbGciOi...`)

---

## Part 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (GitHub)
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Add Supabase Auth and Vercel config"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) → **Add New Project**.
3. Select your GitHub repository.
4. Framework Preset: **Other**
5. Output Directory: `dist`
6. Click **Deploy**.

### Option B: Using Vercel CLI
1. In your terminal run:
   ```bash
   npm i -g vercel
   vercel
   ```
2. Follow the prompts (link project, accept defaults).
3. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## Part 3: Connecting Your Supabase Project

You have two easy ways to connect your Supabase credentials:

### 1. Directly in the App (No rebuild needed!)
* Open your deployed site on Vercel.
* Click on **My Progress** (or navigate to `#account`).
* Expand **⚙ Connect Custom Supabase Credentials**.
* Paste your **Supabase Project URL** and **Anon Key**, then click **Save Credentials**.
* That's it! You can now create accounts and sign in with email and password.

### 2. Pre-configured via window.AILY_CONFIG
In `dist/index.html` inside `<head>`, you can optionally add:
```html
<script>
  window.AILY_CONFIG = {
    supabaseUrl: "https://your-project.supabase.co",
    supabaseAnonKey: "your-anon-key"
  };
</script>
```

---

## Certificate Feature
* Once students complete all 12 curriculum chapters and the Python refresher, their official **Aily Certificate of AI Mastery** unlocks in `#acred`.
* Students can customize their full legal name and click **Print / Save as PDF** to generate an official diploma with the Aily verification seal and unique credential ID.
