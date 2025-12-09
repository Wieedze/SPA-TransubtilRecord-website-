import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  // Récupérer le token d'authentification
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('You must be logged in to upload files');
  }

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
    xhr.open('POST', `${API_URL}/api/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
    xhr.send(formData);
  });
};
