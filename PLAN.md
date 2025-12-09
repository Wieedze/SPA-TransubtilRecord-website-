# Plan d'implémentation - Architecture hybride Supabase + o2switch

## Objectifs

### 1. Stockage personnel Admin (NextCloud)
Ajouter un système de stockage personnel type Google Drive pour l'admin, en utilisant NextCloud hébergé sur o2switch (gratuit, open-source).

### 2. Migration des fichiers lourds vers o2switch
Déplacer les uploads de démos et projets (fichiers audio) de Supabase Storage vers o2switch pour économiser l'espace et les coûts.

## Architecture hybride finale

### 🔐 Sur Supabase (données légères uniquement)
- **Auth** : Authentification des utilisateurs (emails, passwords)
- **Profiles** : Données utilisateurs (rôles, infos personnelles)
- **Notifications** : Système de notifications
- **Feedback** : Messages de feedback utilisateurs
- **Submissions metadata** : Titres, genres, status, dates, **file_url** (URL vers o2switch)
- **Studio requests metadata** : Informations sur les demandes, **file_url** (URL vers o2switch)

💾 **Stockage Supabase** : ~500 MB database (largement suffisant)

### 💾 Sur o2switch (fichiers lourds UNIQUEMENT)
**Service d'upload unifié** : Next.js API Routes (TypeScript)

**Structure des dossiers :**
```
/home/compte/
├── public-uploads/
│   └── users/                    # Fichiers uploadés par les users
│       ├── label-submissions/    # Démos (WAV/AIFF, max 250MB)
│       └── studio-requests/      # Fichiers studio (illimité)
│
└── private-uploads/
    └── admin/                    # Espace privé admin (NextCloud)
```

**Restrictions utilisateurs :**
- **Démos (label_submissions)** :
  - Formats : WAV ou AIFF uniquement
  - Taille max : 250 MB par fichier
  - Quota : **3 soumissions actives max** (statut "pending" ou "under_review")
  - Une fois acceptée/refusée, le user peut soumettre à nouveau

- **Studio requests** :
  - Formats : Tous formats audio
  - Taille : Aucune limite
  - Quota : Aucune limite
  - **Accès réservé** : Uniquement les users avec `has_studio_access = true`
  - Attribution manuelle par l'admin via le dashboard

💾 **Stockage o2switch** : Quasi-illimité (dépend de l'offre o2switch)

### ☁️ NextCloud (admin uniquement)
- Stockage personnel admin indépendant
- Interface type Google Drive
- Gratuit et open-source
- Apps mobile/desktop disponibles
- Accès via `storage.transubtilrecord.com`

## Avantages de cette architecture

✅ **Simplicité** : Un seul service d'upload unifié (Next.js API)
✅ **Sécurité** : Auth et données sensibles sur Supabase (infrastructure pro)
✅ **Coût** : Plan gratuit Supabase suffisant, o2switch déjà payé, NextCloud gratuit
✅ **Performance** : Queries rapides (Supabase) + stockage massif (o2switch)
✅ **Scalabilité** : Espace quasi-illimité pour fichiers audio
✅ **Maintenance** : Tout en TypeScript (Next.js), pas de PHP à maintenir
✅ **Flexibilité** : Restrictions différentes par type d'upload

## Flux de données

### Système simplifié (nouveau)

**Upload utilisateur (démo) :**
```
User → Next.js API (/api/upload) → Validation (WAV/AIFF, 250MB max)
                                → o2switch /public-uploads/users/label-submissions/
                                → Retourne URL
                                ↓
                        Supabase DB (metadata + file_url)
```

**Upload utilisateur (studio request) :**
```
User → Next.js API (/api/upload) → Validation (tous formats, illimité)
                                → o2switch /public-uploads/users/studio-requests/
                                → Retourne URL
                                ↓
                        Supabase DB (metadata + file_url)
```

**Upload admin (personnel) :**
```
Admin → NextCloud (storage.transubtilrecord.com)
                                ↓
                    o2switch /private-uploads/admin/
```

### Lecture d'un fichier
```
User → Demande fichier → Supabase DB (récupère file_url o2switch)
                                    ↓
                        Next.js API (/api/download?url=...) → Streaming depuis o2switch
```

---

# PARTIE 1 : Création du service d'upload Next.js vers o2switch

## Phase 1 : Configuration o2switch + accès SFTP

### 1.1 Structure des dossiers sur o2switch
```
/home/votre-compte/
├── public-uploads/
│   └── users/
│       ├── label-submissions/   # Démos WAV/AIFF
│       └── studio-requests/     # Tous formats
│
└── private-uploads/
    └── admin/                   # NextCloud (installé en Phase 2)
```

### 1.2 Prérequis o2switch
- [ ] Accéder au cPanel o2switch
- [ ] Créer les dossiers via le File Manager OU via SFTP
- [ ] Configurer les permissions (755 pour les dossiers)
- [ ] Récupérer les credentials SFTP/FTP :
  - Host
  - Port (22 pour SFTP)
  - Username
  - Password

### 1.3 Variables d'environnement Next.js
- [ ] Ajouter dans `.env.local` :

```env
# o2switch SFTP
O2SWITCH_SFTP_HOST=your-host.o2switch.net
O2SWITCH_SFTP_PORT=22
O2SWITCH_SFTP_USER=your-username
O2SWITCH_SFTP_PASSWORD=your-password
O2SWITCH_BASE_PATH=/home/votre-compte/public-uploads/users

# Base URL pour accès aux fichiers
O2SWITCH_PUBLIC_URL=https://transubtilrecord.com/uploads

# Restrictions
MAX_FILE_SIZE_DEMO=262144000  # 250 MB en bytes
MAX_FILES_PER_USER=10
ALLOWED_DEMO_FORMATS=audio/wav,audio/x-wav,audio/aiff,audio/x-aiff
```

## Phase 2 : Installation des dépendances Next.js

### 2.1 Installer les packages nécessaires
- [ ] Installer `ssh2-sftp-client` pour SFTP
- [ ] Installer `file-type` pour validation des types de fichiers

```bash
npm install ssh2-sftp-client
npm install file-type
npm install -D @types/ssh2-sftp-client
```

## Phase 3 : Création de l'API Next.js

### 3.1 Service SFTP (lib/sftp.ts)
- [ ] Créer le service de connexion SFTP
- [ ] Gérer le pool de connexions
- [ ] Implémenter upload et download

**Fichier : `/src/lib/sftp.ts`**
```typescript
import SftpClient from 'ssh2-sftp-client';
import path from 'path';

export class O2SwitchStorage {
  private client: SftpClient;

  constructor() {
    this.client = new SftpClient();
  }

  async connect() {
    await this.client.connect({
      host: process.env.O2SWITCH_SFTP_HOST!,
      port: parseInt(process.env.O2SWITCH_SFTP_PORT || '22'),
      username: process.env.O2SWITCH_SFTP_USER!,
      password: process.env.O2SWITCH_SFTP_PASSWORD!,
    });
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    type: 'label-submissions' | 'studio-requests'
  ): Promise<string> {
    const remotePath = path.join(
      process.env.O2SWITCH_BASE_PATH!,
      type,
      filename
    );

    await this.client.put(buffer, remotePath);

    // Retourner l'URL publique
    return `${process.env.O2SWITCH_PUBLIC_URL}/${type}/${filename}`;
  }

  async disconnect() {
    await this.client.end();
  }

  async fileExists(filename: string, type: string): Promise<boolean> {
    const remotePath = path.join(
      process.env.O2SWITCH_BASE_PATH!,
      type,
      filename
    );
    return this.client.exists(remotePath);
  }
}
```

### 3.2 Utilitaires de validation (lib/upload-utils.ts)
- [ ] Validation des types de fichiers
- [ ] Vérification des quotas
- [ ] Génération de noms uniques

**Fichier : `/src/lib/upload-utils.ts`**
```typescript
import { fileTypeFromBuffer } from 'file-type';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_DEMO_MIMES = ['audio/wav', 'audio/x-wav', 'audio/aiff', 'audio/x-aiff'];
const MAX_DEMO_SIZE = 262144000; // 250 MB
const MAX_ACTIVE_SUBMISSIONS = 3;

export async function validateDemoFile(buffer: Buffer, filename: string) {
  // Vérifier la taille
  if (buffer.length > MAX_DEMO_SIZE) {
    throw new Error('File too large. Maximum size is 250 MB.');
  }

  // Vérifier le type MIME réel du fichier (pas juste l'extension)
  const fileType = await fileTypeFromBuffer(buffer);

  if (!fileType || !ALLOWED_DEMO_MIMES.includes(fileType.mime)) {
    throw new Error('Invalid file format. Only WAV and AIFF are allowed for demos.');
  }

  return true;
}

export async function validateStudioFile(buffer: Buffer) {
  // Pas de limite pour studio requests
  // Juste vérifier que c'est un fichier audio
  const fileType = await fileTypeFromBuffer(buffer);

  if (!fileType || !fileType.mime.startsWith('audio/')) {
    throw new Error('Invalid file format. Only audio files are allowed.');
  }

  return true;
}

export async function checkUserDemoQuota(userId: string): Promise<boolean> {
  const supabase = await createClient();

  // Compter uniquement les soumissions actives (pending ou under_review)
  const { count, error } = await supabase
    .from('label_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['pending', 'under_review']);

  if (error) throw error;

  return (count || 0) < MAX_ACTIVE_SUBMISSIONS;
}

export async function checkStudioAccess(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('has_studio_access')
    .eq('id', userId)
    .single();

  if (error) throw error;

  return data?.has_studio_access === true;
}

export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalFilename.split('.').pop();
  return `${timestamp}_${random}.${extension}`;
}
```

### 3.3 API Route Upload (app/api/upload/route.ts)
- [ ] Créer l'endpoint d'upload
- [ ] Gérer l'authentification Supabase
- [ ] Valider les fichiers selon le type

**Fichier : `/src/app/api/upload/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { O2SwitchStorage } from '@/lib/sftp';
import {
  validateDemoFile,
  validateStudioFile,
  checkUserDemoQuota,
  checkStudioAccess,
  generateUniqueFilename,
} from '@/lib/upload-utils';

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parser le FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'label-submissions' | 'studio-requests';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type || !['label-submissions', 'studio-requests'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid upload type' },
        { status: 400 }
      );
    }

    // 3. Convertir le fichier en Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Validation selon le type
    if (type === 'label-submissions') {
      // Vérifier le quota (3 soumissions actives max)
      const hasQuota = await checkUserDemoQuota(user.id);
      if (!hasQuota) {
        return NextResponse.json(
          { error: 'Upload quota exceeded. Maximum 3 active demo submissions allowed. Please wait for your pending demos to be reviewed.' },
          { status: 403 }
        );
      }

      // Valider le fichier (WAV/AIFF, 250MB max)
      await validateDemoFile(buffer, file.name);
    } else {
      // Vérifier l'accès studio
      const hasAccess = await checkStudioAccess(user.id);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied. Studio requests are only available to authorized clients.' },
          { status: 403 }
        );
      }

      // Valider le fichier studio (tous formats audio, illimité)
      await validateStudioFile(buffer);
    }

    // 5. Générer un nom unique
    const uniqueFilename = generateUniqueFilename(file.name);

    // 6. Upload vers o2switch via SFTP
    const storage = new O2SwitchStorage();
    await storage.connect();
    const fileUrl = await storage.uploadFile(buffer, uniqueFilename, type);
    await storage.disconnect();

    // 7. Retourner l'URL
    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: uniqueFilename,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

// Config pour Next.js (augmenter la limite de taille)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '300mb', // Légèrement plus que 250MB pour la démo
    },
  },
};
```

### 3.4 Tester l'API
- [ ] Tester l'upload de démo (WAV/AIFF)
- [ ] Tester l'upload studio request
- [ ] Vérifier les validations (taille, format, quota)
- [ ] Vérifier que les fichiers arrivent bien sur o2switch

---

## Phase 4 : Modification du frontend

### 4.1 Service d'upload client (lib/upload-service.ts)
- [ ] Créer le service côté client
- [ ] Gérer la progression d'upload
- [ ] Gérer les erreurs

**Fichier : `/src/lib/upload-service.ts`**
```typescript
export interface UploadResponse {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const uploadFile = async (
  file: File,
  type: 'label-submissions' | 'studio-requests',
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Gérer la progression
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          });
        }
      });
    }

    // Gérer la réponse
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const data: UploadResponse = JSON.parse(xhr.responseText);
          if (data.success && data.url) {
            resolve(data.url);
          } else {
            reject(new Error(data.error || 'Upload failed'));
          }
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          reject(new Error(data.error || `Upload failed: ${xhr.statusText}`));
        } catch {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      }
    });

    // Gérer les erreurs
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    // Envoyer la requête
    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
};
```

### 4.2 Modifier les composants de soumission
- [ ] Identifier les composants qui uploadent des fichiers
- [ ] Remplacer `supabase.storage.upload()` par `uploadFile()`
- [ ] Ajouter la barre de progression
- [ ] Gérer les nouvelles erreurs (quota, accès studio)

**Exemple de modification :**
```typescript
// AVANT (avec Supabase Storage)
const handleSubmit = async (formData: FormData, audioFile: File) => {
  // Upload vers Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('submissions')
    .upload(`${user.id}/${Date.now()}_${audioFile.name}`, audioFile);

  if (uploadError) throw uploadError;

  const fileUrl = supabase.storage
    .from('submissions')
    .getPublicUrl(uploadData.path).data.publicUrl;

  // Sauvegarder metadata
  await supabase.from('label_submissions').insert({
    user_id: user.id,
    file_url: fileUrl,
    ...formData
  });
};

// APRÈS (avec o2switch via Next.js API)
import { uploadFile } from '@/lib/upload-service';

const [uploadProgress, setUploadProgress] = useState(0);

const handleSubmit = async (formData: FormData, audioFile: File) => {
  try {
    // 1. Upload vers o2switch (avec progression)
    const fileUrl = await uploadFile(
      audioFile,
      'label-submissions',
      (progress) => setUploadProgress(progress.percentage)
    );

    // 2. Sauvegarder metadata dans Supabase
    const { error } = await supabase.from('label_submissions').insert({
      user_id: user.id,
      file_url: fileUrl, // URL o2switch
      ...formData
    });

    if (error) throw error;

    toast.success('Demo submitted successfully!');
  } catch (error) {
    // Gérer les erreurs spécifiques
    if (error.message.includes('quota exceeded')) {
      toast.error('You have 3 pending demos. Wait for review before submitting more.');
    } else if (error.message.includes('Access denied')) {
      toast.error('Studio requests are only available to authorized clients.');
    } else {
      toast.error(error.message);
    }
  }
};
```

### 4.3 Conditionner l'accès Studio Request
- [ ] Masquer/désactiver le formulaire studio si `has_studio_access = false`
- [ ] Afficher un message explicatif pour demander l'accès

**Exemple :**
```typescript
// Dans le composant StudioRequestForm
const { data: profile } = await supabase
  .from('profiles')
  .select('has_studio_access')
  .eq('id', user.id)
  .single();

if (!profile?.has_studio_access) {
  return (
    <div className="access-denied">
      <h3>Studio Access Required</h3>
      <p>Studio requests are reserved for authorized clients.</p>
      <p>Contact us to request access.</p>
    </div>
  );
}
```

### 4.4 Tester les uploads
- [ ] Tester la soumission de démo (WAV/AIFF)
- [ ] Tester le quota (3 soumissions actives max)
- [ ] Tester l'accès refusé pour studio request sans autorisation
- [ ] Tester la soumission studio request avec accès
- [ ] Vérifier que les URLs sont correctes dans Supabase
- [ ] Tester la lecture des fichiers audio

---

## Phase 5 : Mise à jour de la base de données Supabase

### 5.1 Ajouter le champ `has_studio_access` à la table `profiles`
- [ ] Ajouter la colonne via SQL ou via le Dashboard Supabase

**SQL Migration :**
```sql
-- Ajouter le champ has_studio_access
ALTER TABLE profiles
ADD COLUMN has_studio_access BOOLEAN DEFAULT FALSE;

-- Créer un index pour améliorer les performances
CREATE INDEX idx_profiles_studio_access ON profiles(has_studio_access);
```

### 5.2 Créer une fonction admin pour gérer l'accès studio
- [ ] Créer une Row Level Security (RLS) policy
- [ ] Seul l'admin peut modifier `has_studio_access`

**RLS Policy :**
```sql
-- Seuls les admins peuvent modifier has_studio_access
CREATE POLICY "Only admins can update studio access"
ON profiles
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
```

---

## Phase 6 : Interface admin pour gérer l'accès studio

### 6.1 Créer la page de gestion des utilisateurs (Admin Dashboard)
- [ ] Créer `/admin/users` ou ajouter dans le dashboard existant
- [ ] Lister tous les utilisateurs
- [ ] Afficher le statut `has_studio_access`
- [ ] Toggle pour activer/désactiver l'accès

**Exemple de composant :**
```typescript
// components/admin/UserManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, has_studio_access')
      .order('created_at', { ascending: false });

    if (!error) setUsers(data);
  };

  const toggleStudioAccess = async (userId: string, currentAccess: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ has_studio_access: !currentAccess })
      .eq('id', userId);

    if (!error) {
      fetchUsers();
      toast.success('Studio access updated');
    }
  };

  return (
    <div className="user-management">
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Studio Access</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.full_name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span className={user.has_studio_access ? 'badge-success' : 'badge-default'}>
                  {user.has_studio_access ? 'Enabled' : 'Disabled'}
                </span>
              </td>
              <td>
                <button
                  onClick={() => toggleStudioAccess(user.id, user.has_studio_access)}
                  className="btn-sm"
                >
                  {user.has_studio_access ? 'Revoke Access' : 'Grant Access'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Phase 7 : Migration des fichiers existants (optionnel)

### 7.1 Script de migration
- [ ] Créer un script pour migrer les fichiers existants de Supabase vers o2switch
- [ ] Mettre à jour les URLs dans la base de données
- [ ] (Optionnel) Supprimer les fichiers de Supabase Storage

**Fichier : `/scripts/migrate-files.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Utiliser la service key
);

const migrateFiles = async () => {
  // 1. Récupérer toutes les submissions avec des fichiers
  const { data: submissions, error } = await supabase
    .from('label_submissions')
    .select('id, file_url')
    .not('file_url', 'is', null);

  if (error) throw error;

  console.log(`Found ${submissions.length} files to migrate`);

  for (const submission of submissions) {
    try {
      // 2. Télécharger le fichier depuis Supabase
      const response = await fetch(submission.file_url);
      const buffer = await response.buffer();
      const tempPath = `/tmp/${submission.id}.mp3`;
      fs.writeFileSync(tempPath, buffer);

      // 3. Upload vers o2switch
      const formData = new FormData();
      formData.append('file', fs.createReadStream(tempPath));
      formData.append('type', 'label-submissions');

      const uploadResponse = await fetch(
        'https://transubtilrecord.com/api/upload.php',
        {
          method: 'POST',
          body: formData
        }
      );

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        throw new Error('Upload failed');
      }

      // 4. Mettre à jour l'URL dans Supabase
      await supabase
        .from('label_submissions')
        .update({ file_url: uploadData.url })
        .eq('id', submission.id);

      console.log(`✅ Migrated: ${submission.id}`);

      // Nettoyer le fichier temporaire
      fs.unlinkSync(tempPath);

      // 5. (Optionnel) Supprimer de Supabase Storage
      // await supabase.storage.from('submissions').remove([oldPath]);

    } catch (error) {
      console.error(`❌ Failed to migrate ${submission.id}:`, error);
    }
  }

  console.log('Migration complete!');
};

migrateFiles();
```

### 7.2 Exécuter la migration
- [ ] Tester le script sur quelques fichiers
- [ ] Backup de la base de données avant migration
- [ ] Exécuter la migration complète
- [ ] Vérifier que tous les fichiers sont accessibles

---

# PARTIE 2 : Installation NextCloud (stockage personnel admin)

## Phase 1 : Installation NextCloud sur o2switch

#### 1.1 Préparation
- [ ] Se connecter au cPanel o2switch
- [ ] Créer un sous-domaine : `storage.transubtilrecord.com` (ou `drive.transubtilrecord.com`)
- [ ] Créer une base de données MySQL dédiée pour NextCloud

#### 1.2 Installation via Softaculous
- [ ] Accéder à Softaculous dans cPanel
- [ ] Rechercher "NextCloud"
- [ ] Configurer l'installation :
  - Domaine : sous-domaine créé
  - Nom d'utilisateur admin
  - Mot de passe fort
  - Base de données créée précédemment
- [ ] Lancer l'installation (automatique, ~5 min)

#### 1.3 Configuration initiale NextCloud
- [ ] Accéder à l'interface NextCloud
- [ ] Configurer les paramètres de sécurité
- [ ] Désactiver l'inscription publique
- [ ] Configurer les quotas de stockage (illimité pour admin)
- [ ] Installer les apps essentielles :
  - Files (déjà installé)
  - Photos
  - Music/Audio Player
  - PDF Viewer
  - Video Player

### Phase 2 : Sécurisation

#### 2.1 HTTPS & SSL
- [ ] Activer le certificat SSL (Let's Encrypt via cPanel)
- [ ] Forcer HTTPS dans NextCloud

#### 2.2 Authentification
- [ ] Configurer l'authentification à deux facteurs (2FA)
- [ ] Limiter les tentatives de connexion
- [ ] Configurer la politique de mot de passe

#### 2.3 Accès
- [ ] Restreindre l'accès au compte admin uniquement
- [ ] Configurer les adresses IP autorisées (optionnel)

### Phase 3 : Intégration avec l'application (optionnel)

#### 3.1 Lien dans le dashboard admin
- [ ] Ajouter un bouton/lien dans la navbar admin
- [ ] Icône "Cloud Storage" ou "My Drive"
- [ ] Ouvre NextCloud dans un nouvel onglet

Exemple de code :
```tsx
// Dans Navbar.tsx (section admin)
{user?.role === 'admin' && (
  <a
    href="https://storage.transubtilrecord.com"
    target="_blank"
    className="nav-link"
  >
    <CloudIcon /> My Storage
  </a>
)}
```

#### 3.2 SSO (Single Sign-On) - Avancé (optionnel)
- [ ] Configurer l'authentification NextCloud via JWT
- [ ] Permettre la connexion automatique depuis l'app
- [ ] Documentation : NextCloud OIDC/SAML

### Phase 4 : Configuration avancée (optionnel)

#### 4.1 Applications mobiles
- [ ] Installer l'app NextCloud sur mobile (iOS/Android)
- [ ] Configurer la synchronisation automatique

#### 4.2 Client desktop
- [ ] Installer le client NextCloud desktop
- [ ] Configurer la synchronisation de dossiers

#### 4.3 Partage de fichiers
- [ ] Configurer les liens de partage publics
- [ ] Définir les durées d'expiration
- [ ] Protection par mot de passe

## Estimation du temps (NextCloud)

- **Phase 1** : 30 minutes - 1 heure (installation)
- **Phase 2** : 30 minutes (sécurisation)
- **Phase 3** : 15 minutes (lien simple) ou 2-3 heures (SSO)
- **Phase 4** : 30 minutes (apps et config avancée)

**Total NextCloud** : 1h30 - 2h pour une installation complète

---

# Estimation globale du projet

## PARTIE 1 : Migration uploads vers o2switch (Next.js API)
- **Phase 1** : Configuration o2switch + SFTP (1 heure)
- **Phase 2** : Installation dépendances Next.js (15 min)
- **Phase 3** : Création API Next.js (3-4 heures)
- **Phase 4** : Modification frontend (3-4 heures)
- **Phase 5** : Mise à jour BDD Supabase (30 min)
- **Phase 6** : Interface admin gestion users (2-3 heures)
- **Phase 7** : Migration fichiers existants (1-2 heures, optionnel)

**Total PARTIE 1** : 10-13 heures (ou 11-15 heures avec migration)

## PARTIE 2 : NextCloud stockage admin
- **Installation complète** : 1h30 - 2h

**TOTAL PROJET** : 11h30 - 15h (minimum) ou 13h - 17h (avec migration)

---

# Résumé des avantages globaux

## Avantages de l'architecture hybride

✅ **Simplicité** : Tout en TypeScript (Next.js), pas de PHP à maintenir
✅ **Sécurité** : Données sensibles sur infrastructure professionnelle Supabase
✅ **Coût** : Plan gratuit Supabase suffisant, o2switch déjà payé, NextCloud gratuit
✅ **Scalabilité** : Espace quasi-illimité pour fichiers audio
✅ **Performance** : Queries rapides (Supabase) + stockage massif (o2switch)
✅ **Flexibilité** : Restrictions par type d'upload (démos vs studio)
✅ **Contrôle** : Accès studio géré manuellement par l'admin
✅ **Backup séparé** : Risques distribués entre 2 infrastructures

## Avantages NextCloud

✅ Gratuit et open-source
✅ Interface professionnelle type Google Drive
✅ Applications mobile/desktop disponibles
✅ Synchronisation automatique
✅ Indépendant du système de soumissions
✅ Preview intégré (images, vidéos, audio, PDF)
✅ Partage de fichiers possible

## Points d'attention

⚠️ **Développement** : 11-15 heures de travail pour la migration complète
⚠️ **SFTP** : Nécessite les credentials o2switch et configuration SFTP
⚠️ **Migration** : Déplacement des fichiers existants (optionnel)
⚠️ **Tests** : Bien tester avant de passer en production
⚠️ **Backup** : Configurer des sauvegardes régulières sur o2switch
⚠️ **Performance** : Vérifier que o2switch gère bien le trafic
⚠️ **BDD Update** : Ajouter `has_studio_access` à la table profiles

## Sécurité

### Fichiers audio (Next.js API)
- **Authentification obligatoire** : Via Supabase Auth
- **Validation stricte des types** : WAV/AIFF pour démos, tous audio pour studio
- **Limite de taille** : 250 MB pour démos, illimité pour studio
- **Quota** : 3 soumissions actives max pour démos
- **Accès contrôlé** : Studio requests réservé aux users autorisés
- **Noms de fichiers obscurcis** : Timestamp + random
- **Protection SFTP** : Connexion sécurisée vers o2switch

### NextCloud
- HTTPS obligatoire (Let's Encrypt)
- Authentification 2FA recommandée
- Accès limité à l'admin
- Chiffrement possible au repos

## Backup recommandé

### Base de données Supabase
- Backup automatique par Supabase (inclus)
- Export manuel régulier recommandé

### Fichiers o2switch
- Backup automatique via cPanel (configurer)
- Considérer un backup externe (Backblaze, AWS S3, etc.)

### NextCloud
- Inclus dans le backup o2switch
- Export possible vers autre cloud

## Ordre de priorité recommandé

### PARTIE 1 : Service d'upload (PRIORITÉ HAUTE)
1. **Phase 1-2** : Configuration o2switch + Installation packages (1h15)
2. **Phase 3** : Création API Next.js (3-4h)
3. **Phase 5** : Mise à jour BDD Supabase + `has_studio_access` (30min)
4. **Phase 4** : Modification frontend (3-4h)
5. **Phase 6** : Interface admin gestion users (2-3h)

**Total PARTIE 1** : 10-13 heures

### PARTIE 2 : NextCloud (PRIORITÉ MOYENNE)
6. **Installation NextCloud** sur o2switch (1h30-2h)

### OPTIONNEL : Migration (PRIORITÉ BASSE)
7. **Phase 7** : Migrer les fichiers existants (1-2h)

**Pourquoi cet ordre ?**
- Nouveaux uploads vers o2switch = économie immédiate
- Système de quota et accès studio = sécurité et contrôle
- NextCloud peut attendre (non critique pour les users)
- Migration anciens fichiers = peut se faire progressivement ou pas du tout

---

# Prochaines étapes

## Avant de commencer
- [ ] ✅ Valider l'architecture globale (VALIDÉE)
- [ ] Vérifier l'accès cPanel o2switch
- [ ] Récupérer les credentials SFTP o2switch
- [ ] Vérifier l'espace disponible sur o2switch
- [ ] Backup de la base de données Supabase actuelle
- [ ] Décider si migration des anciens fichiers nécessaire

## Démarrage recommandé

### Étape 1 : Configuration initiale (1h30)
1. Accéder à o2switch cPanel
2. Créer la structure de dossiers
3. Récupérer credentials SFTP
4. Ajouter les variables d'environnement dans `.env.local`
5. Installer les packages npm

### Étape 2 : Backend (4-5h)
1. Créer le service SFTP (`lib/sftp.ts`)
2. Créer les utilitaires de validation (`lib/upload-utils.ts`)
3. Créer l'API Route (`app/api/upload/route.ts`)
4. Mettre à jour la BDD Supabase (ajouter `has_studio_access`)
5. Tester l'API avec Postman/Thunder Client

### Étape 3 : Frontend (3-4h)
1. Créer le service client (`lib/upload-service.ts`)
2. Modifier les composants de soumission
3. Ajouter la barre de progression
4. Conditionner l'accès studio request
5. Tester les uploads end-to-end

### Étape 4 : Admin Dashboard (2-3h)
1. Créer la page de gestion des users
2. Implémenter le toggle `has_studio_access`
3. Tester l'attribution/révocation d'accès

### Étape 5 : NextCloud (1h30-2h)
1. Installer NextCloud via Softaculous
2. Configurer la sécurité
3. Ajouter le lien dans la navbar admin

### Étape 6 : Migration (optionnel, 1-2h)
1. Créer le script de migration
2. Tester sur quelques fichiers
3. Migration complète

---

**Date de création** : 2025-12-09
**Dernière mise à jour** : 2025-12-09
**Statut** : ✅ Architecture hybride VALIDÉE et DÉTAILLÉE

## Résumé de l'architecture finale

### Supabase (Données légères)
- Auth + Profiles + Notifications + Feedback
- Métadonnées submissions (titre, genre, status, **file_url**)
- Nouveau champ : `has_studio_access` (boolean)

### o2switch (Fichiers lourds)
- Upload via Next.js API (TypeScript)
- `/public-uploads/users/label-submissions/` (WAV/AIFF, 250MB max, 3 actifs max)
- `/public-uploads/users/studio-requests/` (tous formats, illimité, accès contrôlé)
- `/private-uploads/admin/` (NextCloud pour stockage perso admin)

### Restrictions
- **Démos** : 3 soumissions actives max (status = pending/under_review)
- **Studio** : Réservé aux users avec `has_studio_access = true`
- **Admin** : Peut gérer l'accès studio via dashboard
