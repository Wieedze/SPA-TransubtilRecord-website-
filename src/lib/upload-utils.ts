import { fileTypeFromBuffer } from 'file-type';
import { supabase } from './supabase';

const ALLOWED_DEMO_MIMES = ['audio/wav', 'audio/x-wav', 'audio/aiff', 'audio/x-aiff'];
const MAX_DEMO_SIZE = parseInt(process.env.MAX_FILE_SIZE_DEMO || '262144000'); // 250 MB
const MAX_ACTIVE_SUBMISSIONS = parseInt(process.env.MAX_ACTIVE_SUBMISSIONS || '3');

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
