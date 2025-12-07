# Guide Administrateur - Transubtil Records

Ce guide explique comment configurer et utiliser les fonctionnalités d'administration.

## Créer un Utilisateur Admin

### Méthode 1: Via le Dashboard Supabase (Recommandé)

#### Étape 1: Trouver ton User ID
1. Va sur ton dashboard Supabase: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionne ton projet **Transubtil Records**
3. Clique sur **Authentication** dans le menu de gauche
4. Clique sur **Users**
5. Trouve ton compte utilisateur dans la liste
6. Copie l'**ID** (c'est un UUID qui ressemble à `a1b2c3d4-e5f6-7890-...`)

#### Étape 2: Promouvoir l'utilisateur en Admin
1. Clique sur **SQL Editor** dans le menu de gauche
2. Clique sur **New query**
3. Colle cette requête SQL (remplace `TON_USER_ID` par l'ID que tu as copié):

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = 'TON_USER_ID';
```

4. Clique sur **Run** (ou appuie sur Ctrl+Enter)
5. Tu devrais voir le message: `Success. No rows returned`

#### Étape 3: Vérifier
1. Retourne dans **SQL Editor**
2. Exécute cette requête pour vérifier:

```sql
SELECT id, full_name, role, email, created_at
FROM profiles
JOIN auth.users ON profiles.id = auth.users.id
WHERE role = 'admin';
```

Tu devrais voir ton utilisateur avec `role = 'admin'`.

### Méthode 2: Par Email

Si tu connais l'email de l'utilisateur à promouvoir:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'ton-email@example.com'
);
```

## Se Connecter en tant qu'Admin

1. **Déconnecte-toi** de l'application (important!)
2. **Reconnecte-toi** avec tes identifiants
   - L'application va recharger ton profil avec le nouveau rôle
3. Le lien **Dashboard** apparaît dans le Navbar
4. Tu as maintenant accès à `/admin/submissions`

## Fonctionnalités Admin

### Interface de Gestion des Démos (`/admin/submissions`)

Accessible uniquement aux administrateurs, cette page permet de:

#### Voir toutes les soumissions
- Liste de TOUS les démos soumis par TOUS les utilisateurs
- Informations affichées:
  - Titre du track
  - Nom de l'artiste
  - Genre (si renseigné)
  - Description
  - Date de soumission
  - ID de l'utilisateur
  - Statut actuel (pending/approved/rejected)

#### Filtrer les soumissions
- **All**: Toutes les soumissions
- **Pending**: En attente de review
- **Approved**: Approuvées
- **Rejected**: Rejetées

#### Écouter les démos
- Player audio intégré directement dans l'interface
- Pas besoin de télécharger pour écouter
- Contrôles standard (play, pause, volume, timeline)

#### Gérer les soumissions

**Approuver une soumission:**
1. Clique sur le bouton vert **Approve**
2. Le statut passe à "Approved"
3. L'artiste voit le changement dans son dashboard

**Rejeter une soumission:**
1. Clique sur le bouton rouge **Reject**
2. Le statut passe à "Rejected"
3. L'artiste voit le changement dans son dashboard

**Ajouter un feedback:**
1. Clique sur **Add Feedback** (ou **Edit Feedback** si déjà présent)
2. Tape ton message pour l'artiste
3. Clique sur **Save**
4. Le feedback apparaît dans le dashboard de l'artiste

## Gestion des Rôles

### Rôles disponibles

Il existe 3 rôles dans l'application:

- **`client`** (par défaut): Utilisateur standard
  - Peut soumettre des démos
  - Peut faire des demandes studio
  - Voit uniquement ses propres soumissions

- **`artist`**: Artiste du label
  - Mêmes droits que client
  - Profile affiché sur la page Artists (à configurer séparément)

- **`admin`**: Administrateur
  - Tous les droits des autres rôles
  - Accès à `/admin/submissions`
  - Peut voir/modifier toutes les soumissions
  - Peut approuver/rejeter les démos
  - Peut ajouter des feedbacks

### Promouvoir un utilisateur en Artist

```sql
UPDATE profiles
SET role = 'artist'
WHERE id = 'USER_ID';
```

### Rétrograder un admin en client

```sql
UPDATE profiles
SET role = 'client'
WHERE id = 'USER_ID';
```

### Lister tous les admins

```sql
SELECT
  profiles.id,
  auth.users.email,
  profiles.full_name,
  profiles.role,
  profiles.created_at
FROM profiles
JOIN auth.users ON profiles.id = auth.users.id
WHERE profiles.role = 'admin';
```

## Vérification du Statut Admin

### Dans le Dashboard Supabase

```sql
SELECT id, email, role, full_name
FROM profiles
JOIN auth.users ON profiles.id = auth.users.id
WHERE email = 'ton-email@example.com';
```

### Dans le Code (pour débugger)

Ajoute temporairement dans n'importe quelle page:

```typescript
import { useAuth } from '../contexts/AuthContext'

function DebugComponent() {
  const { profile, isAdmin } = useAuth()

  console.log('Profile:', profile)
  console.log('Is Admin:', isAdmin)

  return (
    <div>
      <p>Role: {profile?.role}</p>
      <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

### Dans la Console du Navigateur

1. Ouvre les DevTools (F12)
2. Va dans l'onglet **Console**
3. Tape:
```javascript
// Récupère les infos du contexte Auth
// (disponible seulement si tu es connecté)
```

## Sécurité

### Permissions dans Supabase

Les permissions sont gérées par Row Level Security (RLS):

- **Users**: Peuvent voir uniquement LEURS propres soumissions
- **Admins**: Peuvent voir/modifier TOUTES les soumissions

### Politiques RLS en place

```sql
-- Seuls les admins peuvent voir toutes les soumissions
CREATE POLICY "Admins can view all submissions"
  ON label_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### Bonnes pratiques

1. **Ne pas partager ton compte admin**
   - Crée des comptes admin séparés pour chaque administrateur

2. **Vérifier régulièrement les admins**
   ```sql
   SELECT email, role FROM profiles
   JOIN auth.users ON profiles.id = auth.users.id
   WHERE role = 'admin';
   ```

3. **Auditer les actions**
   - Supabase garde automatiquement un log des requêtes
   - Accessible dans Dashboard → Logs

## Problèmes Courants

### Le rôle ne change pas après la mise à jour
**Solution:**
1. Déconnecte-toi complètement de l'application
2. Vide le cache du navigateur (ou utilise mode Incognito)
3. Reconnecte-toi

### Erreur "Access Denied" sur `/admin/submissions`
**Vérifications:**
1. Vérifie que ton rôle est bien `admin`:
   ```sql
   SELECT role FROM profiles WHERE id = auth.uid();
   ```
2. Déconnecte/reconnecte-toi
3. Vérifie les RLS policies dans Supabase

### Erreur "table profiles does not exist"
**Solution:**
- Tu dois d'abord créer la table `profiles`
- Voir le fichier `SUPABASE_SETUP.md` pour la migration complète

### Je ne vois pas le lien "Dashboard" dans le Navbar
**Causes possibles:**
1. Tu n'es pas connecté
2. Ton profil n'a pas été chargé correctement
3. Vide le cache et reconnecte-toi

## Support

Si tu rencontres des problèmes:

1. Vérifie les logs Supabase (Dashboard → Logs)
2. Vérifie la console du navigateur (F12)
3. Assure-toi que les migrations SQL ont été exécutées
4. Vérifie que le bucket `label_demos` existe et a les bonnes policies

## Statistiques Utiles

### Nombre total de soumissions
```sql
SELECT COUNT(*) as total_submissions
FROM label_submissions;
```

### Soumissions par statut
```sql
SELECT status, COUNT(*) as count
FROM label_submissions
GROUP BY status;
```

### Soumissions récentes (7 derniers jours)
```sql
SELECT track_title, artist_name, status, created_at
FROM label_submissions
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Utilisateurs les plus actifs
```sql
SELECT
  auth.users.email,
  profiles.full_name,
  COUNT(label_submissions.id) as submission_count
FROM label_submissions
JOIN profiles ON label_submissions.user_id = profiles.id
JOIN auth.users ON profiles.id = auth.users.id
GROUP BY auth.users.email, profiles.full_name
ORDER BY submission_count DESC
LIMIT 10;
```
