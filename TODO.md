# 🎯 Transubtil Records - Roadmap & TODO

## ✅ Phase 1: Système Artistes (TERMINÉ)

- [x] Types TypeScript pour artistes
- [x] Données des 13 artistes avec slugs
- [x] Page liste artistes avec filtres (style, pays, recherche)
- [x] Pages profils artistes dynamiques (`/artists/:slug`)
- [x] Composant SocialLinks (SoundCloud, Instagram, Facebook)
- [x] Intégration lecteur SoundCloud sur chaque page artiste
- [x] Formulaire de booking artiste (mock, à connecter à Supabase)
- [x] Animations Framer Motion

**Fichiers créés:**
- `src/types/artist.ts`
- `src/data/artists.ts`
- `src/utils/slugify.ts`
- `src/components/artists/` (ArtistCard, ArtistFilters, SocialLinks)
- `src/components/SoundCloudPlayer.tsx`
- `src/components/BookingForm.tsx`
- `src/pages/Artists.tsx`
- `src/pages/ArtistProfile.tsx`

---

## ✅ Phase 2: Landing Page Interactive (TERMINÉ)

- [x] Landing page split-screen (Studio / Label)
- [x] Animations Framer Motion (fade, slide, hover effects)
- [x] Thèmes inversés (noir sur blanc / blanc sur noir)
- [x] Expansion au hover avec smooth transitions
- [x] Page Studio de présentation
- [x] Routing: `/` (landing), `/studio`, `/artists`
- [x] Style minimaliste blanc/transparent (sans violet)

**Fichiers créés:**
- `src/pages/Landing.tsx`
- `src/pages/Studio.tsx`

---

## ✅ Phase 3: Authentication + Supabase (TERMINÉ)

- [x] Installation `@supabase/supabase-js`
- [x] Configuration client Supabase + types TypeScript
- [x] AuthContext avec hooks (signUp, signIn, signOut)
- [x] Pages Login et Signup
- [x] Protected routes wrapper
- [x] Navbar dynamique (Login/Signup ou User + Logout)
- [x] Guide complet setup Supabase (SUPABASE_SETUP.md)
- [x] Schéma database complet (profiles, studio_requests, bookings, newsletter)

**Fichiers créés:**
- `src/lib/supabase.ts`
- `src/contexts/AuthContext.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/pages/Login.tsx`
- `src/pages/Signup.tsx`
- `SUPABASE_SETUP.md`
- `.env.local.example`

**⚠️ À FAIRE: Configuration Supabase**
- [ ] Créer projet Supabase (gratuit)
- [ ] Copier credentials dans `.env.local`
- [ ] Créer tables (SQL dans SUPABASE_SETUP.md)
- [ ] Configurer SMTP (Mailgun recommandé)
- [ ] Personnaliser email templates
- [ ] Créer premier admin user

---

## 📋 Phase 4: Espace Studio Complet (À FAIRE)

### 4.1 Formulaire Demande Prestation
- [ ] Créer page `/studio/request` (protégée, login requis)
- [ ] Formulaire avec champs:
  - Nom du projet
  - Service (Mixing / Mastering / Mix+Master / Production)
  - Description/Brief
  - Upload fichiers audio (max 5 fichiers, 100MB chacun)
  - Liens références (SoundCloud/YouTube optionnel)
  - Deadline (date picker)
- [ ] Validation formulaire
- [ ] Connexion à Supabase (table `studio_requests`)

### 4.2 Upload Fichiers Audio
- [ ] Intégration Supabase Storage (`studio-audio-files` bucket)
- [ ] Drag & drop uploader
- [ ] Progress bar upload
- [ ] Preview fichiers uploadés
- [ ] Limite taille/format (WAV, MP3, FLAC, AIFF)

### 4.3 Dashboard Projets Utilisateur
- [ ] Créer page `/studio/my-projects`
- [ ] Liste des projets du user
- [ ] Afficher status (pending, in_progress, completed)
- [ ] Détails projet (voir fichiers, commentaires)
- [ ] Message/conversation simple avec admin

### 4.4 Notifications Email Admin
- [ ] Supabase Edge Function `send-studio-request-email`
- [ ] Intégration Mailgun API
- [ ] Template email admin (nouveau projet soumis)
- [ ] Lien vers fichiers audio dans email

**Fichiers à créer:**
- `src/pages/StudioRequest.tsx`
- `src/pages/MyProjects.tsx`
- `src/components/studio/AudioUploader.tsx`
- `src/components/studio/ProjectCard.tsx`
- `supabase/functions/send-studio-request-email/`

---

## 📋 Phase 5: Boutique & Releases Bandcamp (À FAIRE)

### 5.1 Page Releases Améliorée
- [ ] Remplacer mock data par vraies releases
- [ ] Données releases (titre, artiste, date, cover, lien Bandcamp)
- [ ] Grid responsive avec covers
- [ ] Lecteur Bandcamp embed par release
- [ ] Liens "Buy on Bandcamp"

### 5.2 Intégration Bandcamp
- [ ] Collecter URLs Bandcamp des releases
- [ ] Embed Bandcamp player (iframe)
- [ ] Liens directs vers produits
- [ ] Section "Merch" si applicable

### 5.3 Page Shop Complète
- [ ] Créer `/shop` ou utiliser `/releases`
- [ ] Catégories: Releases / Merch
- [ ] Preview avec covers haute qualité
- [ ] Call-to-action vers Bandcamp

**Fichiers à modifier/créer:**
- `src/types/release.ts`
- `src/data/releases.ts`
- `src/pages/Releases.tsx` (refactor)
- `src/components/BandcampPlayer.tsx`

---

## 📋 Phase 6: Newsletter (À FAIRE)

### 6.1 Formulaire Inscription
- [ ] Composant `NewsletterSignup` dans Footer
- [ ] Page dédiée `/newsletter`
- [ ] Champs: Email + préférences (News / Releases)
- [ ] Connexion table `newsletter_subscribers`
- [ ] Success message

### 6.2 Templates Email
- [ ] Template "News" - Actualités label
- [ ] Template "Release" - Nouvelle sortie
- [ ] Design HTML responsive
- [ ] Variables dynamiques (artiste, cover, liens)

### 6.3 Admin: Envoyer Newsletter
- [ ] Page `/admin/newsletter` (role admin uniquement)
- [ ] Choisir template (News ou Release)
- [ ] Éditeur simple (titre, contenu, image)
- [ ] Preview email
- [ ] Envoyer à tous subscribers (via Mailgun)

### 6.4 Backend Newsletter
- [ ] Supabase Edge Function `send-newsletter`
- [ ] Batch sending (éviter rate limits)
- [ ] Logs envois (success/failed)
- [ ] Unsubscribe link dans emails

**Fichiers à créer:**
- `src/components/NewsletterSignup.tsx`
- `src/pages/Newsletter.tsx`
- `src/pages/admin/SendNewsletter.tsx`
- `src/utils/email-templates.ts`
- `supabase/functions/send-newsletter/`

---

## 📋 Phase 7: Admin Dashboard (À FAIRE)

### 7.1 Panel Admin Bookings
- [ ] Page `/admin/bookings`
- [ ] Liste toutes demandes booking
- [ ] Filtres: artiste, status, date
- [ ] Actions: Voir détails, changer status
- [ ] Envoyer réponse par email

### 7.2 Panel Admin Studio Requests
- [ ] Page `/admin/studio`
- [ ] Liste tous projets studio
- [ ] Voir/télécharger fichiers audio
- [ ] Changer status projet
- [ ] Notes internes

### 7.3 Panel Admin Newsletter
- [ ] Page `/admin/subscribers`
- [ ] Liste subscribers + stats
- [ ] Export CSV
- [ ] Gestion unsubscribes

### 7.4 Panel Admin Users
- [ ] Page `/admin/users`
- [ ] Liste users + rôles
- [ ] Promouvoir client → artist → admin
- [ ] Désactiver compte

**Fichiers à créer:**
- `src/pages/admin/` (Bookings, Studio, Subscribers, Users)
- `src/components/admin/` (composants réutilisables)

---

## 📋 Améliorations Futures

### UI/UX
- [ ] Mobile menu hamburger (navbar responsive)
- [ ] Dark mode toggle (optionnel)
- [ ] Animations page transitions
- [ ] Loading skeletons
- [ ] Toast notifications (react-hot-toast)
- [ ] Modal confirmations

### Features
- [ ] Upload videos performances (YouTube URLs ou Storage)
- [ ] Section "Events" - calendrier shows/festivals
- [ ] Blog/News section
- [ ] Contact form général
- [ ] Politique confidentialité / CGU

### Optimisations
- [ ] Lazy loading images
- [ ] Code splitting routes
- [ ] Image optimization (next/image alternative)
- [ ] PWA (Progressive Web App)
- [ ] Analytics (Google Analytics ou Plausible)

### SEO
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Open Graph meta tags
- [ ] Structured data (JSON-LD)
- [ ] Canonical URLs

### Déploiement
- [ ] Deploy sur Vercel
- [ ] Configurer domaine custom (transubtilrecords.com)
- [ ] SSL certificate
- [ ] Environment variables production
- [ ] CI/CD pipeline

---

## 🐛 Bugs / Issues Connus

_Aucun pour le moment_

---

## 📚 Documentation À Créer

- [ ] README.md complet
- [ ] CONTRIBUTING.md
- [ ] Architecture documentation
- [ ] API documentation (Supabase functions)
- [ ] User guide (comment utiliser le studio)
- [ ] Admin guide

---

## 🔧 Configuration Nécessaire

### Services Externes
- [ ] **Supabase** (Database, Auth, Storage)
  - Créer projet: https://supabase.com
  - Guide: `SUPABASE_SETUP.md`
- [ ] **Mailgun** (Emails)
  - Créer compte: https://mailgun.com
  - 5000 emails/mois gratuit
- [ ] **Vercel** (Hosting)
  - Lier repo GitHub
  - Deploy automatique

### Variables d'Environnement Production
```bash
# .env.local (développement)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Vercel Environment Variables (production)
# Ajouter les mêmes dans Settings → Environment Variables
```

---

## 📦 Dépendances à Ajouter (Future)

```bash
# Toast notifications
npm install react-hot-toast

# Form validation (si besoin plus robuste que HTML5)
npm install react-hook-form zod @hookform/resolvers

# Date picker
npm install react-datepicker

# Drag & drop upload
npm install react-dropzone

# Rich text editor (newsletter)
npm install @tiptap/react @tiptap/starter-kit
```

---

## 🎨 Assets Manquants

- [ ] Logo Transubtil Records (SVG)
- [ ] Favicon (ico + SVG + PNG)
- [ ] Images artistes (migrer de l'autre PC)
- [ ] Covers releases
- [ ] Images placeholder de qualité
- [ ] Background patterns/textures (optionnel)

---

## 📝 Notes

- **Stack actuel**: React + TypeScript + Vite + Supabase + TailwindCSS
- **Style**: Minimaliste blanc/transparent, pas de violet
- **Auth**: Email/Password (Magic Link optionnel à activer)
- **Workflow Studio**: Pas de chat interne, tout par email
- **Newsletter**: 2 templates (News + Release)

---

## 🚀 Quick Start (Développeur continuant le projet)

```bash
# 1. Clone & Install
git clone <repo>
npm install

# 2. Configure Supabase
# Suivre: SUPABASE_SETUP.md
cp .env.local.example .env.local
# Éditer .env.local avec credentials

# 3. Run dev
npm run dev

# 4. Build production
npm run build
npm run preview
```

---

## 📞 Contact Admin

**Email admin**: Définir dans Supabase → studio@transubtilrecords.com
**Role admin**: Promouvoir user dans Supabase après première inscription

---

_Dernière mise à jour: 2025-01-18_
