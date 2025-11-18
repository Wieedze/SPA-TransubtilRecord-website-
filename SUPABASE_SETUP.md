# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in details:
   - **Name**: Transubtil Records
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
   - **Pricing Plan**: Free tier is sufficient to start

## 2. Get API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - `Project URL` (looks like: `https://xxxxx.supabase.co`)
   - `anon public` key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

3. Create `.env.local` file in project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run these queries:

### Enable UUID Extension
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Create Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('client', 'artist', 'admin')) DEFAULT 'client',
  full_name TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Create Studio Requests Table
```sql
CREATE TABLE studio_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  service_type TEXT CHECK (service_type IN ('mixing', 'mastering', 'mix-master', 'production')) NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  audio_files JSONB DEFAULT '[]'::jsonb,
  reference_tracks TEXT,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE studio_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON studio_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create requests
CREATE POLICY "Users can create requests"
  ON studio_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
  ON studio_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admins can update all requests
CREATE POLICY "Admins can update all requests"
  ON studio_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
```

### Create Bookings Table
```sql
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artist_id INTEGER NOT NULL,
  promoter_name TEXT NOT NULL,
  promoter_email TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_location TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Anyone can create a booking (public form)
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);
```

### Create Newsletter Subscribers Table
```sql
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  preferences JSONB DEFAULT '{"news": true, "releases": true}'::jsonb,
  subscribed BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Admins can view all subscribers
CREATE POLICY "Admins can view subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
```

### Create Trigger for Profile Creation
```sql
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 4. Configure Storage for Audio Files

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket called `studio-audio-files`
3. Set it to **Private** (not public)
4. Add RLS policies:

```sql
-- Users can upload to their own folder
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'studio-audio-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own files
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'studio-audio-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can view all files
CREATE POLICY "Admins can view all files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'studio-audio-files' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
```

## 5. Configure Email Templates (Optional)

Go to **Authentication** → **Email Templates** to customize:
- Confirmation email
- Password reset email
- Magic link email

## 6. Create Admin User

After signing up your first user, promote them to admin:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = 'YOUR_USER_ID_HERE';
```

You can find your user ID in **Authentication** → **Users**.

## 7. Test Authentication

1. Run `npm run dev`
2. Go to `/signup` and create an account
3. Check your email for verification
4. Log in at `/login`
5. Check Supabase dashboard under **Authentication** → **Users**

## Next Steps

- Configure Mailgun for email notifications (booking, studio requests)
- Set up Supabase Edge Functions for email sending
- Add file upload functionality for studio requests

## Troubleshooting

### "Failed to fetch" errors
- Check your `.env.local` file exists and has correct credentials
- Restart dev server after creating `.env.local`

### Email not sending
- Check Supabase **Authentication** → **Email** settings
- Free tier may have delays, use your own SMTP for production

### RLS errors
- Make sure all tables have `ENABLE ROW LEVEL SECURITY`
- Check policies are correctly set up
- Use Supabase SQL Editor to test policies

## Useful Commands

```bash
# Install Supabase CLI (optional)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Pull database types (generates TypeScript types)
supabase gen types typescript --project-id your-project-ref > src/types/database.ts
```
