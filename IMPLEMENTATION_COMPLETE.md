# 🎉 Implémentation Complète - Système d'Upload o2switch

## ✅ Ce qui a été fait

### 1. Configuration
- ✅ Variables d'environnement ajoutées (`.env.local`)
- ✅ Packages installés (ssh2-sftp-client, file-type, express, multer, etc.)
- ✅ Scripts npm ajoutés pour démarrer le serveur

### 2. Backend (Serveur Express)
- ✅ Service SFTP créé (`src/lib/sftp.ts`)
- ✅ Utilitaires de validation (`src/lib/upload-utils.ts`)
- ✅ Serveur Express API (`server/index.ts`)
  - Endpoint `/api/upload` avec validation
  - Upload vers o2switch via SFTP
  - Vérification du quota (3 démos actives max)
  - Vérification de l'accès studio

### 3. Base de données Supabase
- ✅ Champ `has_studio_access` ajouté à la table `profiles`
- ✅ Index créé pour les performances
- ✅ RLS Policy pour sécuriser l'accès
- ✅ Type TypeScript `Profile` mis à jour

### 4. Frontend
- ✅ Service client d'upload (`src/lib/upload-service.ts`)
- ✅ Composant Dashboard modifié (démos)
  - Validation WAV/AIFF uniquement
  - Taille max 250 MB
  - Messages d'erreur personnalisés
- ✅ Composant StudioRequest modifié
  - Vérification de l'accès studio
  - Message si pas d'accès
  - Upload via le nouveau service
- ✅ Interface admin de gestion des users (`src/pages/admin/UserManagement.tsx`)

---

## 🚀 Comment tester

### Étape 1 : Démarrer le serveur backend

Dans un terminal, lance le serveur Express :

\`\`\`bash
npm run dev:server
\`\`\`

Tu devrais voir :
\`\`\`
🚀 Upload server running on http://localhost:3001
📁 SFTP Host: barbotte.o2switch.net
📍 Base Path: /home/faji2535/public_html/uploads
\`\`\`

### Étape 2 : Démarrer le frontend

Dans un autre terminal, lance Vite :

\`\`\`bash
npm run dev
\`\`\`

### Étape 3 : Tester l'upload de démo

1. **Connecte-toi** à l'application
2. **Va dans Dashboard** (onglet "Demo")
3. **Essaie d'uploader un fichier WAV ou AIFF** (max 250 MB)
4. **Vérifie** :
   - La barre de progression
   - Le fichier apparaît dans Supabase `label_submissions`
   - Le fichier est sur o2switch : `https://transubtil-record.org/uploads/label-submissions/`

### Étape 4 : Tester le quota de 3 démos actives

1. **Soumets 3 démos** en succession
2. **Essaie d'en soumettre une 4ème**
3. **Tu devrais voir** : "You have reached the maximum of 3 active demo submissions"
4. **Pour débloquer** : Change le status d'une démo en "approved" ou "rejected" dans Supabase

### Étape 5 : Tester l'accès studio

1. **Va sur** `/studio/request`
2. **Sans accès studio** : Tu vois le message "Studio Access Required"
3. **Pour donner l'accès** :
   - Va sur `/admin/users` (interface admin)
   - Clique sur "Grant Access" pour ton utilisateur
4. **Recharge la page** `/studio/request`
5. **Tu devrais maintenant voir** le formulaire
6. **Upload des fichiers audio** (tous formats, illimité)

### Étape 6 : Interface admin

1. **Va sur** `/admin/users`
2. **Tu vois la liste** de tous les utilisateurs
3. **Tu peux** :
   - Voir qui a l'accès studio (icône verte ✅)
   - Grant/Revoke l'accès studio pour chaque user

---

## 📂 Structure des fichiers o2switch

Sur ton serveur o2switch, tu devrais avoir :

\`\`\`
/home/faji2535/public_html/uploads/
├── label-submissions/
│   └── 1733866240000_abc123xyz.wav
│   └── 1733866250000_def456uvw.aiff
└── studio-requests/
    └── 1733866260000_ghi789rst.mp3
\`\`\`

URLs publiques :
- \`https://transubtil-record.org/uploads/label-submissions/1733866240000_abc123xyz.wav\`
- \`https://transubtil-record.org/uploads/studio-requests/1733866260000_ghi789rst.mp3\`

---

## 🔒 Sécurité implémentée

### Démos (label_submissions)
- ✅ Formats : **WAV et AIFF uniquement**
- ✅ Taille max : **250 MB**
- ✅ Quota : **3 soumissions actives max** (status = pending/under_review)
- ✅ Authentification obligatoire

### Studio Requests
- ✅ Formats : **Tous formats audio**
- ✅ Taille : **Illimitée**
- ✅ Accès : **Réservé aux users avec has_studio_access = true**
- ✅ Authentification obligatoire

### API Backend
- ✅ Validation côté serveur (type MIME réel avec file-type)
- ✅ Token Supabase vérifié sur chaque requête
- ✅ Noms de fichiers obscurcis (timestamp + random)
- ✅ Protection contre directory traversal
- ✅ CORS configuré

---

## 🐛 Troubleshooting

### Erreur : "Connection refused" sur le serveur

**Problème** : Le serveur Express n'est pas démarré

**Solution** :
\`\`\`bash
npm run dev:server
\`\`\`

### Erreur : "SFTP connection failed"

**Problème** : Mauvaises credentials o2switch

**Solution** :
- Vérifie les credentials dans \`.env.local\`
- Teste la connexion SFTP avec FileZilla

### Erreur : "File not found" après upload

**Problème** : Les dossiers n'existent pas sur o2switch

**Solution** :
- Connecte-toi au cPanel o2switch
- Vérifie que \`/home/faji2535/public_html/uploads/label-submissions/\` existe
- Vérifie que \`/home/faji2535/public_html/uploads/studio-requests/\` existe

### Les fichiers ne sont pas accessibles publiquement

**Problème** : Mauvaise URL ou permissions

**Solution** :
- Vérifie que les fichiers sont bien dans \`public_html/uploads/\`
- Vérifie les permissions (755 pour dossiers, 644 pour fichiers)
- Teste l'URL directement : \`https://transubtil-record.org/uploads/label-submissions/nom-du-fichier.wav\`

---

## 📊 Variables d'environnement

Assure-toi que ton \`.env.local\` contient :

\`\`\`env
# Supabase
VITE_SUPABASE_URL=https://ezcdwxpvpydmeimhgsey.supabase.co
VITE_SUPABASE_ANON_KEY=ton-anon-key

# API
VITE_API_URL=http://localhost:3001
VITE_APP_URL=http://localhost:5173

# o2switch SFTP
O2SWITCH_SFTP_HOST=barbotte.o2switch.net
O2SWITCH_SFTP_PORT=22
O2SWITCH_SFTP_USER=faji2535
O2SWITCH_SFTP_PASSWORD=4V3k-vexP-mpT$
O2SWITCH_BASE_PATH=/home/faji2535/public_html/uploads
O2SWITCH_PUBLIC_URL=https://transubtil-record.org/uploads

# Upload Restrictions
MAX_FILE_SIZE_DEMO=262144000
MAX_ACTIVE_SUBMISSIONS=3
ALLOWED_DEMO_FORMATS=audio/wav,audio/x-wav,audio/aiff,audio/x-aiff
\`\`\`

---

## 🎯 Prochaines étapes (optionnel)

### 1. Migration des fichiers existants
Si tu as déjà des fichiers sur Supabase Storage, tu peux les migrer avec le script dans \`PLAN.md\` (Phase 7).

### 2. Installation NextCloud
Pour l'espace privé admin, suis les instructions dans \`PLAN.md\` (PARTIE 2).

### 3. Déploiement en production
- Configure les variables d'environnement en production
- Change \`VITE_API_URL\` et \`VITE_APP_URL\` pour les URLs de production
- Déploie le serveur Express (Heroku, Railway, VPS, etc.)

---

## ✅ Checklist finale

- [x] Serveur Express démarré
- [x] Frontend démarré
- [ ] Test upload démo (WAV/AIFF)
- [ ] Test quota 3 démos actives
- [ ] Test accès studio refusé
- [ ] Test donner accès studio (admin)
- [ ] Test upload studio request
- [ ] Vérifier fichiers sur o2switch
- [ ] Vérifier URLs publiques fonctionnent

---

**Date d'implémentation** : 2025-12-09
**Statut** : ✅ Prêt à tester
