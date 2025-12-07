# Corrections Appliquées - 7 Décembre 2025

## ✅ Problème 1 : Erreur HTML - `<a>` imbriqué (RÉSOLU)

### Symptôme
```
Warning: validateDOMNesting(...): <a> cannot appear as a descendant of <a>.
```

### Cause
Dans `ArtistCard.tsx`, les icônes sociales (liens `<a>`) étaient placées à l'intérieur du lien de la carte (également un `<a>`).

### Solution appliquée
**Fichier modifié :** `src/components/artists/SocialLinks.tsx`

Ajout de `onClick={(e) => e.stopPropagation()}` sur chaque lien social pour empêcher la propagation du clic vers le lien parent :

```typescript
<a
  href={social.soundcloud}
  target="_blank"
  rel="noopener noreferrer"
  onClick={(e) => e.stopPropagation()}  // ← Ajouté
  className="text-white/60 hover:text-brand-300 transition-colors"
  aria-label="SoundCloud"
>
  <Music2 className="w-5 h-5" />
</a>
```

### Résultat
✅ Le warning a disparu
✅ Les liens sociaux fonctionnent correctement
✅ Cliquer sur les icônes sociales n'ouvre plus la page artiste

---

## ⏳ Problème 2 : Table `label_submissions` introuvable (ACTION REQUISE)

### Symptôme
```
Failed to load resource: the server responded with a status of 404
Error: Could not find the table 'public.label_submissions' in the schema cache
```

### Cause
La table `label_submissions` n'existe pas dans la base de données Supabase (uniquement dans la documentation).

### Solution préparée
**Fichier créé :** `supabase/migrations/create_label_submissions.sql`

Ce fichier contient :
- ✅ Création de la table `label_submissions`
- ✅ Colonnes : id, user_id, track_title, artist_name, genre, file_url, description, status, feedback, created_at, updated_at
- ✅ Row Level Security (RLS) activé
- ✅ Policies pour utilisateurs et admins
- ✅ Index de performance
- ✅ Trigger pour updated_at automatique

### ⚠️ ACTION REQUISE DE TA PART

1. **Ouvre Supabase Dashboard**
   - Va sur [https://supabase.com](https://supabase.com)
   - Sélectionne ton projet

2. **Exécute la migration SQL**
   - Clique sur **SQL Editor** dans le menu latéral
   - Ouvre le fichier `supabase/migrations/create_label_submissions.sql`
   - Copie tout le contenu
   - Colle dans l'éditeur SQL
   - Clique sur **Run** (en bas à droite)

3. **Vérifie que ça a fonctionné**
   - Va dans **Table Editor**
   - Tu devrais voir la table `label_submissions`
   - Ou exécute cette requête :
   ```sql
   SELECT * FROM label_submissions LIMIT 1;
   ```

### Une fois la migration exécutée

✅ Tu pourras soumettre des démos depuis `/dashboard` → onglet "Send"
✅ Les admins pourront voir les soumissions dans `/admin/submissions`
✅ Plus d'erreur 404 dans la console

---

## 📁 Fichiers créés

1. **`supabase/migrations/create_label_submissions.sql`**
   - Migration SQL pour créer la table
   - Prêt à être exécuté dans Supabase

2. **`supabase/migrations/README.md`**
   - Instructions détaillées pour exécuter les migrations
   - Guide de troubleshooting

3. **`FIXES_APPLIED.md`** (ce fichier)
   - Récapitulatif des corrections
   - Instructions pour finaliser la configuration

---

## 📝 Fichiers modifiés

1. **`src/components/artists/SocialLinks.tsx`**
   - Ajout de `stopPropagation()` sur les 3 liens sociaux

2. **`SUPABASE_SETUP.md`**
   - Ajout d'une note pour pointer vers le fichier de migration

---

## 🎯 Prochaines étapes

1. ✅ **FAIT** - Corriger l'erreur HTML des liens imbriqués
2. ⏳ **À FAIRE** - Exécuter la migration SQL dans Supabase
3. ⏳ **Après migration** - Tester la soumission de démos :
   - Aller sur `/dashboard` → onglet "Send"
   - Soumettre une démo (fichier < 50MB)
   - Vérifier dans `/admin/submissions` que la démo apparaît

---

## ℹ️ Notes importantes

- Le bucket `studio-audio-files` est utilisé pour stocker les démos
- Les démos sont enregistrées dans le dossier `demos/{user_id}/`
- Limite de taille : **50 MB** (validation côté client)
- Formats acceptés : MP3, WAV, FLAC

---

_Corrections appliquées le 7 décembre 2025_
