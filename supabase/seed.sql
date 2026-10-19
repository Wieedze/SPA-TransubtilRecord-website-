-- =============================================
-- SEED: Clean + repopulate for demo
-- Run this in Supabase Dashboard > SQL Editor
-- AFTER running fix_admin_access_policies.sql
-- =============================================

-- =============================================
-- STEP 1: Clean existing data (keep users & profiles)
-- =============================================
DELETE FROM notifications;
DELETE FROM label_submissions;
DELETE FROM studio_requests;

-- =============================================
-- STEP 2: Create test users via Supabase Auth
-- =============================================
-- You need to create these users FIRST via:
--   Supabase Dashboard > Authentication > Users > Add User
--
--   1. demo-artist@transubtil.com  / password: Demo1234!
--   2. demo-client@transubtil.com  / password: Demo1234!
--
-- Then run this seed.

-- =============================================
-- STEP 3: Setup profiles
-- =============================================

-- Superadmin (already exists)
UPDATE profiles SET
  role = 'superadmin',
  full_name = 'Maxime',
  company = 'Transubtil Records',
  has_studio_access = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'maxime.moodz@gmail.com');

-- Artist profile
INSERT INTO profiles (id, role, full_name, company, has_studio_access)
SELECT id, 'artist', 'Kael', 'Indépendant', true
FROM auth.users WHERE email = 'demo-artist@transubtil.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'artist',
  full_name = 'Kael',
  company = 'Indépendant',
  has_studio_access = true;

-- Client profile
INSERT INTO profiles (id, role, full_name, company, has_studio_access)
SELECT id, 'client', 'Sophie Martin', 'Studio Nocturne', true
FROM auth.users WHERE email = 'demo-client@transubtil.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'client',
  full_name = 'Sophie Martin',
  company = 'Studio Nocturne',
  has_studio_access = true;

-- =============================================
-- STEP 4: Studio requests from different users
-- =============================================

-- Request from artist Kael
INSERT INTO studio_requests (user_id, project_name, service_type, description, status, reference_tracks, deadline)
SELECT id, 'EP - Nuit Blanche', 'mixing',
  'EP 5 titres enregistré en home studio. Ambiance dark ambient / drone. Besoin d''un mix pro.',
  'in_progress',
  'https://soundcloud.com/kael-music/reference',
  '2026-04-15'
FROM auth.users WHERE email = 'demo-artist@transubtil.com';

INSERT INTO studio_requests (user_id, project_name, service_type, description, status, deadline)
SELECT id, 'Single - Éclipse', 'mastering',
  'Single déjà mixé, mastering pour distribution digitale (Spotify, Apple Music, Bandcamp).',
  'completed',
  '2026-02-01'
FROM auth.users WHERE email = 'demo-artist@transubtil.com';

-- Request from client Sophie
INSERT INTO studio_requests (user_id, project_name, service_type, description, status, reference_tracks, deadline)
SELECT id, 'Album - Fractures', 'mix-master',
  'Album 10 titres, mix + master complet. Style électro/ambient/IDM.',
  'pending',
  'https://bandcamp.com/studio-nocturne/ref',
  '2026-06-01'
FROM auth.users WHERE email = 'demo-client@transubtil.com';

INSERT INTO studio_requests (user_id, project_name, service_type, description, status, deadline)
SELECT id, 'EP - Ondes Courtes', 'production',
  'Production complète d''un EP 4 titres. Recherche un son analogique, warm.',
  'pending',
  '2026-07-15'
FROM auth.users WHERE email = 'demo-client@transubtil.com';

-- =============================================
-- STEP 5: Label submissions from different users
-- =============================================

-- Submissions from artist
INSERT INTO label_submissions (user_id, track_title, artist_name, genre, file_url, description, status)
SELECT id, 'Fragments', 'Kael', 'Ambient / Electronica',
  '/demos/kael_fragments.wav',
  'Morceau ambient avec textures granulaires et nappes évolutives. 6min30.',
  'pending'
FROM auth.users WHERE email = 'demo-artist@transubtil.com';

INSERT INTO label_submissions (user_id, track_title, artist_name, genre, file_url, description, status, feedback)
SELECT id, 'Pulse', 'Kael', 'Techno',
  '/demos/kael_pulse.wav',
  'Track techno hypnotique, 130bpm. Inspiration Amelie Lens.',
  'approved',
  'Excellent track, parfait pour notre prochaine compilation.'
FROM auth.users WHERE email = 'demo-artist@transubtil.com';

-- Submission from client
INSERT INTO label_submissions (user_id, track_title, artist_name, genre, file_url, description, status)
SELECT id, 'Résonance', 'Studio Nocturne', 'Experimental',
  '/demos/nocturne_resonance.wav',
  'Pièce expérimentale, field recordings + synthèse modulaire. 8min.',
  'pending'
FROM auth.users WHERE email = 'demo-client@transubtil.com';

-- =============================================
-- STEP 6: Notifications for superadmin
-- =============================================

INSERT INTO notifications (user_id, type, title, message, link, read)
SELECT id, 'studio_request', 'Nouvelle demande studio',
  'Kael a soumis une demande de mix pour "EP - Nuit Blanche"',
  '/admin/studio-requests', false
FROM auth.users WHERE email = 'maxime.moodz@gmail.com';

INSERT INTO notifications (user_id, type, title, message, link, read)
SELECT id, 'studio_request', 'Nouvelle demande studio',
  'Sophie Martin a soumis une demande de mix+master pour "Album - Fractures"',
  '/admin/studio-requests', false
FROM auth.users WHERE email = 'maxime.moodz@gmail.com';

INSERT INTO notifications (user_id, type, title, message, link, read)
SELECT id, 'label_submission', 'Nouvelle démo reçue',
  'Kael a soumis "Fragments" pour review',
  '/admin/submissions', false
FROM auth.users WHERE email = 'maxime.moodz@gmail.com';

INSERT INTO notifications (user_id, type, title, message, link, read)
SELECT id, 'label_submission', 'Nouvelle démo reçue',
  'Studio Nocturne a soumis "Résonance" pour review',
  '/admin/submissions', false
FROM auth.users WHERE email = 'maxime.moodz@gmail.com';

INSERT INTO notifications (user_id, type, title, message, link, read)
SELECT id, 'label_submission', 'Démo approuvée',
  'Vous avez approuvé "Pulse" de Kael',
  '/admin/submissions', true
FROM auth.users WHERE email = 'maxime.moodz@gmail.com';
