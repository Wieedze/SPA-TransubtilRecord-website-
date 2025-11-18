# Supabase Storage Setup for Audio Files

## Create Storage Bucket

1. In your Supabase project dashboard, go to **Storage**
2. Click **"New bucket"**
3. Fill in:
   - **Name**: `studio-audio-files`
   - **Public**: **OFF** (keep it private)
4. Click **Create bucket**

---

## Configure Storage Policies (RLS)

Go to **Storage** → Click on `studio-audio-files` bucket → **Policies** tab

### Policy 1: Users can upload to their own folder

Click **"New policy"** → **"For full customization"**

```sql
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'studio-audio-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**What this does**: Users can only upload files to folders named with their user ID (`user_id/filename.wav`)

### Policy 2: Users can view their own files

```sql
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'studio-audio-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**What this does**: Users can only see/download their own uploaded files

### Policy 3: Admins can view all files

```sql
CREATE POLICY "Admins can view all files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'studio-audio-files' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
```

**What this does**: Admin users can see and download all files from all users

### Policy 4: Users can delete their own files

```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'studio-audio-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Test Storage Upload

### Option 1: Test from Your App

1. Make sure you're logged in
2. Go to `/studio/request`
3. Fill the form and upload an audio file
4. Click "Submit Request"

### Option 2: Test in Supabase Dashboard

1. Go to **Storage** → `studio-audio-files`
2. Click **"Upload file"**
3. Create a folder with your user ID (find it in **Authentication** → **Users**)
4. Upload a test audio file

---

## Verify Everything Works

After uploading through the app:

1. **Check Storage**:
   - Go to **Storage** → `studio-audio-files`
   - You should see folder `[your-user-id]/`
   - Inside: your uploaded files

2. **Check Database**:
   - Go to **Table Editor** → `studio_requests`
   - Your request should appear
   - `audio_files` column should contain JSON with file info

3. **Check My Projects**:
   - Go to `/studio/my-projects` in your app
   - You should see your submitted project

---

## Storage Limits (Free Tier)

- **Storage**: 1GB
- **Bandwidth**: 2GB/month
- **File upload size**: 50MB per file (configurable)

---

## File Organization

Files are organized like this:

```
studio-audio-files/
├── user-id-1/
│   ├── 1705234567890_my-track.wav
│   ├── 1705234567891_drums-stem.wav
│   └── 1705234567892_bass-stem.wav
├── user-id-2/
│   └── 1705234567893_full-mix.mp3
└── ...
```

Each user has their own folder (UUID), and files are prefixed with timestamp to avoid naming conflicts.

---

## Troubleshooting

### Error: "Row Level Security Policy Violation"

**Problem**: You don't have the right policies set up

**Solution**:
1. Go to **Storage** → `studio-audio-files` → **Policies**
2. Make sure all 4 policies above are created
3. Check that `storage.objects` RLS is enabled

### Error: "Failed to upload file"

**Problem**: File too large or wrong bucket name

**Solution**:
1. Check file is under 100MB
2. Verify bucket name is exactly `studio-audio-files`
3. Check browser console for detailed error

### Files not appearing in My Projects

**Problem**: Database insert failed but upload succeeded

**Solution**:
1. Check **Table Editor** → `studio_requests`
2. Verify the record exists
3. Check browser console for errors

---

## Download Files (Admin Feature - Coming Later)

To download files as admin:

```typescript
const { data, error } = await supabase.storage
  .from('studio-audio-files')
  .download('user-id/filename.wav')

if (data) {
  // Create download link
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = 'filename.wav'
  a.click()
}
```

---

## Next Steps

Once storage is working:

1. **Email Notifications**: Set up Edge Function to email admin when new project is submitted
2. **File Preview**: Add audio player in My Projects to preview uploaded files
3. **Admin Dashboard**: Build admin panel to manage all projects and download files

---

## Security Best Practices

✅ **DO**:
- Keep bucket private (not public)
- Use RLS policies to restrict access
- Validate file types on upload
- Limit file sizes

❌ **DON'T**:
- Make bucket public (anyone could access files)
- Store sensitive data in filenames
- Allow unlimited file uploads

---

_Last updated: 2025-01-18_
