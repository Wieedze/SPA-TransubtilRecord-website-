# Supabase Migrations

Ce dossier contient les migrations SQL pour la base de données Supabase.

## Comment exécuter une migration

1. **Allez dans Supabase Dashboard**
   - Connectez-vous à [https://supabase.com](https://supabase.com)
   - Sélectionnez votre projet Transubtil Records

2. **Ouvrez SQL Editor**
   - Dans le menu latéral, cliquez sur **SQL Editor**

3. **Exécutez le fichier SQL**
   - Ouvrez le fichier de migration (ex: `create_label_submissions.sql`)
   - Copiez tout le contenu
   - Collez dans l'éditeur SQL
   - Cliquez sur **Run** (en bas à droite)

4. **Vérifiez que ça a fonctionné**
   - Allez dans **Table Editor**
   - Vous devriez voir la nouvelle table créée

## Migrations disponibles

### `create_label_submissions.sql`
**Statut:** ⏳ À exécuter

Crée la table `label_submissions` pour gérer les soumissions de démos au label.

**Fonctionnalités:**
- Table avec colonnes: track_title, artist_name, genre, file_url, description, status, feedback
- Row Level Security (RLS) activé
- Policies pour utilisateurs et admins
- Index pour optimiser les performances
- Trigger pour updated_at automatique

**Requis pour:**
- Dashboard → onglet "Send" (soumettre des démos)
- Admin → `/admin/submissions` (gérer les soumissions)

**Comment vérifier après exécution:**
```sql
-- Vérifier que la table existe
SELECT * FROM label_submissions LIMIT 1;

-- Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'label_submissions';
```

## Notes importantes

- ⚠️ Ces migrations doivent être exécutées **manuellement** dans Supabase Dashboard
- ✅ Les migrations sont **idempotentes** (peuvent être exécutées plusieurs fois sans problème grâce à `IF NOT EXISTS`)
- 📝 Marquez les migrations comme **exécutées** dans ce README après les avoir lancées

## Troubleshooting

### Erreur: "relation already exists"
C'est normal si vous relancez la migration. Les commandes `IF NOT EXISTS` empêchent les erreurs.

### Erreur: "permission denied"
Vérifiez que vous êtes connecté en tant qu'admin du projet Supabase.

### La table n'apparaît pas dans Table Editor
Actualisez la page (F5) ou allez dans **Database** → **Tables** pour forcer le rafraîchissement.
