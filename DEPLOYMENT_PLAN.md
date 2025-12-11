# Plan de Déploiement - Transubtil Records sur o2switch

## Situation Actuelle

- **Domaine :** https://transubtil-record.org/
- **Problème :** Le domaine affiche phpMyAdmin/BDD au lieu du site React
- **Infrastructure :**
  - Serveur SFTP o2switch : barbotte.o2switch.net
  - Application React buildée dans `/dist`
  - Backend Node.js (localisation à vérifier)
  - Base de données Supabase
  - Stockage de fichiers SFTP sur o2switch

## Objectif

Faire pointer https://transubtil-record.org/ vers l'application React frontend et configurer l'architecture complète de production.

---

## Étape 1 : Audit de l'Infrastructure Actuelle

### 1.1 Connexion SFTP et inspection
```bash
# Se connecter via SFTP à o2switch
# Host: barbotte.o2switch.net
# User: [ton username o2switch]
```

**Vérifications à faire :**
- [ ] Lister le contenu de `/public_html/`
- [ ] Identifier ce qui cause l'affichage de phpMyAdmin
- [ ] Vérifier l'existence du dossier `admin-files/` (déjà utilisé pour MyDrive)
- [ ] Vérifier les permissions des dossiers

### 1.2 Vérifier la configuration du backend
- [ ] Où tourne actuellement le serveur Node.js ?
  - Sur o2switch ?
  - Sur un autre hébergeur ?
  - En local uniquement ?
- [ ] Quelle est l'URL actuelle de l'API ?
- [ ] Le backend est-il configuré pour la production ?

### 1.3 Variables d'environnement
- [ ] Vérifier `.env` local
- [ ] Identifier toutes les variables nécessaires pour la production
- [ ] Lister les URLs à mettre à jour

---

## Étape 2 : Préparation du Frontend

### 2.1 Configuration des variables d'environnement de production

Créer un fichier `.env.production` :

```env
# API Configuration
VITE_API_URL=https://api.transubtil-record.org
# ou
VITE_API_URL=https://transubtil-record.org/api

# Supabase (garder les mêmes)
VITE_SUPABASE_URL=https://[ton-projet].supabase.co
VITE_SUPABASE_ANON_KEY=[ta-clé]

# Autres variables si nécessaires
```

### 2.2 Rebuild avec la configuration de production

```bash
npm run build
```

### 2.3 Créer le fichier .htaccess pour React Router

Créer `dist/.htaccess` :

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Gestion des fichiers statiques
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l

  # Rediriger toutes les routes vers index.html
  RewriteRule . /index.html [L]
</IfModule>

# Force HTTPS
<IfModule mod_rewrite.c>
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Compression Gzip
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache pour les assets statiques
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/font-woff "access plus 1 year"
  ExpiresByType application/font-woff2 "access plus 1 year"
  ExpiresByType font/ttf "access plus 1 year"
</IfModule>
```

---

## Étape 3 : Configuration du Backend Node.js

### 3.1 Options d'hébergement du backend

**Option A : Backend sur o2switch** (si supporté)
- Vérifier si o2switch supporte Node.js
- Configuration via cPanel ou SSH
- Utiliser PM2 pour gérer le processus Node.js

**Option B : Backend sur un service dédié** (recommandé)
- Heroku, Railway, Render, DigitalOcean
- Déployer le serveur Node.js séparément
- Configurer les variables d'environnement
- Obtenir l'URL de l'API de production

**Option C : API via sous-domaine sur o2switch**
- Créer `api.transubtil-record.org`
- Pointer vers le serveur Node.js

### 3.2 Variables d'environnement backend

```env
# Backend .env
PORT=3000
NODE_ENV=production

# Supabase
SUPABASE_URL=https://[ton-projet].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[ta-service-key]

# SFTP o2switch
SFTP_HOST=barbotte.o2switch.net
SFTP_PORT=22
SFTP_USERNAME=[ton-username]
SFTP_PASSWORD=[ton-password]

# CORS
ALLOWED_ORIGINS=https://transubtil-record.org,https://www.transubtil-record.org

# IP Whitelist pour admin
ADMIN_IP_WHITELIST=176.176.19.73
```

### 3.3 Mise à jour du code backend pour la production

Vérifier dans `server/index.ts` :

```typescript
// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}))

// Port configuration
const PORT = process.env.PORT || 3000
```

---

## Étape 4 : Déploiement sur o2switch

### 4.1 Sauvegarder l'existant

```bash
# Via SFTP, créer un backup
mkdir /backup_phpmyadmin_[date]
mv /public_html/* /backup_phpmyadmin_[date]/
```

Ou garder seulement les dossiers importants :
- Sauvegarder `admin-files/` si existe
- Sauvegarder toute configuration importante

### 4.2 Déplacer phpMyAdmin (optionnel)

**Option A : Sous-domaine**
- Créer `db.transubtil-record.org` dans cPanel
- Déplacer phpMyAdmin vers ce sous-domaine

**Option B : Sous-dossier protégé**
- Créer `/public_html/phpmyadmin/`
- Ajouter `.htaccess` avec protection par mot de passe
- Accessible via `https://transubtil-record.org/phpmyadmin/`

**Option C : Supprimer de l'accès public**
- Utiliser uniquement via cPanel
- Ne pas exposer publiquement

### 4.3 Upload des fichiers du build

Via SFTP :

```bash
# Structure finale de /public_html/ :
/public_html/
  ├── index.html                    # depuis dist/
  ├── .htaccess                     # créé à l'étape 2.3
  ├── assets/                       # depuis dist/assets/
  │   ├── index-*.js
  │   ├── index-*.css
  │   ├── transubtil_logo_*.png
  │   ├── fonts/
  │   └── ...
  ├── admin-files/                  # existant (MyDrive)
  └── phpmyadmin/                   # optionnel si Option B
```

**Commandes SFTP :**
1. Se connecter : `sftp username@barbotte.o2switch.net`
2. Naviguer : `cd public_html`
3. Upload : `put -r dist/* .`

Ou via FileZilla / Cyberduck :
- Host : `barbotte.o2switch.net`
- Protocol : SFTP
- Port : 22
- Glisser-déposer le contenu de `dist/` vers `public_html/`

### 4.4 Vérifier les permissions

```bash
# Les fichiers doivent être lisibles par le serveur web
chmod 644 /public_html/index.html
chmod 644 /public_html/.htaccess
chmod -R 755 /public_html/assets/
```

---

## Étape 5 : Configuration DNS et SSL

### 5.1 Vérifier la configuration DNS

Dans le cPanel o2switch, vérifier que :
- [ ] `transubtil-record.org` pointe vers l'IP du serveur
- [ ] `www.transubtil-record.org` redirige vers la version sans www (ou inverse)
- [ ] SSL/TLS est activé (Let's Encrypt)

### 5.2 Créer des sous-domaines si nécessaire

**Pour l'API (si hébergée sur o2switch) :**
- Sous-domaine : `api.transubtil-record.org`
- Document root : `/api` ou dossier séparé

**Pour phpMyAdmin :**
- Sous-domaine : `db.transubtil-record.org`

### 5.3 Activer le certificat SSL

Via cPanel :
- Aller dans "SSL/TLS Status"
- Activer AutoSSL pour tous les domaines/sous-domaines
- Vérifier que HTTPS fonctionne

---

## Étape 6 : Tests et Validation

### 6.1 Tests frontend

- [ ] https://transubtil-record.org/ affiche la page d'accueil
- [ ] Navigation entre les pages fonctionne (pas d'erreur 404)
- [ ] Les images et fonts se chargent correctement
- [ ] Les assets sont en cache (vérifier dans DevTools)
- [ ] Le site force HTTPS

### 6.2 Tests backend / API

- [ ] L'API est accessible depuis le frontend
- [ ] Les routes protégées nécessitent l'authentification
- [ ] CORS fonctionne correctement
- [ ] SFTP admin storage fonctionne (MyDrive)
- [ ] Upload de fichiers fonctionne
- [ ] Streaming audio/video fonctionne

### 6.3 Tests fonctionnels complets

- [ ] Inscription / Connexion
- [ ] Consultation des releases
- [ ] Lecture de musique
- [ ] Accès admin (MyDrive)
- [ ] Upload de fichiers admin
- [ ] Preview images/audio
- [ ] Studio requests (si accès accordé)
- [ ] Formulaire de contact

### 6.4 Tests de performance

- [ ] Lighthouse score > 90
- [ ] Temps de chargement < 3s
- [ ] Images optimisées
- [ ] Compression Gzip active

---

## Étape 7 : Configuration Post-Déploiement

### 7.1 Mettre à jour Supabase

Si nécessaire, ajouter le nouveau domaine dans :
- Authentication > URL Configuration
- Allowed URLs : `https://transubtil-record.org`

### 7.2 Mettre à jour les redirects OAuth

Si tu utilises OAuth (Google, etc.) :
- Mettre à jour les redirect URLs
- Ajouter `https://transubtil-record.org/auth/callback`

### 7.3 Configuration des emails

Vérifier que les emails fonctionnent :
- Reset password
- Confirmation d'inscription
- Contact forms

### 7.4 Monitoring et logs

- [ ] Configurer les logs d'erreur
- [ ] Mettre en place un monitoring (UptimeRobot, etc.)
- [ ] Configurer les alertes

---

## Étape 8 : Maintenance et Mises à Jour

### 8.1 Process de déploiement futur

```bash
# 1. Build local
npm run build

# 2. Upload via SFTP
sftp username@barbotte.o2switch.net
cd public_html
put -r dist/* .

# Ou créer un script de déploiement automatisé
```

### 8.2 Script de déploiement (optionnel)

Créer `deploy.sh` :

```bash
#!/bin/bash

echo "🚀 Déploiement de Transubtil Records..."

# Build
echo "📦 Building..."
npm run build

# Upload via SFTP
echo "⬆️  Uploading to o2switch..."
sshpass -p "$SFTP_PASSWORD" sftp -oBatchMode=no -b - $SFTP_USERNAME@barbotte.o2switch.net << EOF
  cd public_html
  put -r dist/* .
  quit
EOF

echo "✅ Déploiement terminé !"
```

### 8.3 Backup réguliers

- [ ] Sauvegarder la base de données régulièrement
- [ ] Sauvegarder les fichiers uploadés (`admin-files/`)
- [ ] Versionner le code (Git)

---

## Problèmes Potentiels et Solutions

### Problème 1 : Erreur 404 sur les routes React

**Cause :** `.htaccess` mal configuré

**Solution :**
```apache
# Vérifier que mod_rewrite est activé
# Ajouter RewriteBase si nécessaire
RewriteBase /
```

### Problème 2 : API CORS errors

**Cause :** Backend n'autorise pas le domaine frontend

**Solution :**
```typescript
// Dans server/index.ts
app.use(cors({
  origin: 'https://transubtil-record.org',
  credentials: true
}))
```

### Problème 3 : Assets ne se chargent pas

**Cause :** Chemins relatifs incorrects

**Solution :**
```typescript
// Dans vite.config.ts
export default defineConfig({
  base: '/', // Important !
  // ...
})
```

### Problème 4 : Backend Node.js ne démarre pas sur o2switch

**Cause :** o2switch ne supporte peut-être pas Node.js

**Solution :**
- Héberger le backend ailleurs (Railway, Render, etc.)
- Utiliser un sous-domaine `api.transubtil-record.org` pointant vers ce serveur

### Problème 5 : SSL/HTTPS ne fonctionne pas

**Cause :** Certificat non configuré

**Solution :**
- Activer AutoSSL dans cPanel
- Forcer HTTPS via `.htaccess` (voir Étape 2.3)

---

## Checklist Finale

### Avant le déploiement
- [ ] Build réussi (`npm run build`)
- [ ] Variables d'environnement configurées
- [ ] `.htaccess` créé
- [ ] Backend déployé et accessible
- [ ] Backup de l'existant effectué

### Pendant le déploiement
- [ ] Fichiers uploadés sur o2switch
- [ ] Permissions correctes
- [ ] SSL activé
- [ ] DNS configuré

### Après le déploiement
- [ ] Site accessible via https://transubtil-record.org/
- [ ] Toutes les pages fonctionnent
- [ ] API répond correctement
- [ ] Tests fonctionnels passent
- [ ] Performance acceptable

### Configuration finale
- [ ] phpMyAdmin sécurisé ou déplacé
- [ ] Monitoring en place
- [ ] Processus de déploiement documenté
- [ ] Backup configuré

---

## Informations à Collecter

Avant de commencer, rassemble ces informations :

1. **o2switch SFTP :**
   - ✅ Host : `barbotte.o2switch.net`
   - ❓ Username : `__________`
   - ❓ Password : `__________`

2. **Backend Node.js :**
   - ❓ Où est-il hébergé ? `__________`
   - ❓ URL de l'API : `__________`
   - ❓ Port : `__________`

3. **Supabase :**
   - ❓ Project URL : `__________`
   - ❓ Anon Key : `__________`
   - ❓ Service Role Key : `__________`

4. **Domaine :**
   - ✅ Domaine principal : `transubtil-record.org`
   - ❓ Accès cPanel : `__________`

5. **IP Whitelisting :**
   - ✅ IP actuelle : `176.176.19.73`

---

## Prochaines Étapes Immédiates

1. **Déterminer où héberger le backend Node.js**
   - Vérifier si o2switch supporte Node.js
   - Sinon, choisir un service alternatif (Railway recommandé)

2. **Vérifier le contenu actuel de /public_html/**
   - Se connecter en SFTP
   - Lister ce qui cause l'affichage de phpMyAdmin

3. **Configurer les variables d'environnement de production**
   - Créer `.env.production`
   - Rebuild l'application

4. **Déployer progressivement**
   - D'abord le backend
   - Puis le frontend
   - Tester à chaque étape

---

## Support et Ressources

- **Documentation o2switch :** https://faq.o2switch.fr/
- **Documentation Vite :** https://vitejs.dev/guide/static-deploy.html
- **React Router sur serveurs statiques :** https://reactrouter.com/en/main/guides/deployment
- **Supabase Production Checklist :** https://supabase.com/docs/guides/platform/going-into-prod

---

**Créé le :** 2025-12-11
**Dernière mise à jour :** 2025-12-11
**Status :** 📋 Plan prêt, en attente de déploiement
