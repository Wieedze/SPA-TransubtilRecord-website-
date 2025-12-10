const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ShareLinkOptions {
  filePath: string;
  fileName: string;
  fileSize: number;
  expiresIn?: number; // Duration in milliseconds
  password?: string;
  maxDownloads?: number;
}

export interface ShareLink {
  id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  token: string;
  created_by: string;
  created_at: string;
  expires_at: string | null;
  password_hash: string | null;
  max_downloads: number | null;
  download_count: number;
  is_active: boolean;
  last_accessed_at: string | null;
  url: string; // Added by backend
}

export interface SharedFileInfo {
  name: string;
  size: number;
  requiresPassword: boolean;
  expiresAt: string | null;
  maxDownloads: number | null;
  downloadCount: number;
  isActive: boolean;
}

/**
 * Create a new share link for a file
 */
export async function createShareLink(
  options: ShareLinkOptions,
  token: string
): Promise<ShareLink> {
  const response = await fetch(`${API_URL}/api/share/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create share link');
  }

  const data = await response.json();
  return data.shareLink;
}

/**
 * Get all share links created by the current user
 */
export async function getShareLinks(token: string): Promise<ShareLink[]> {
  const response = await fetch(`${API_URL}/api/share/list`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get share links');
  }

  const data = await response.json();
  return data.shareLinks;
}

/**
 * Deactivate a share link
 */
export async function deactivateShareLink(linkId: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/share/${linkId}/deactivate`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to deactivate share link');
  }
}

/**
 * Delete a share link permanently
 */
export async function deleteShareLink(linkId: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/share/${linkId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete share link');
  }
}

/**
 * Get information about a shared file (public, no auth required)
 */
export async function getSharedFileInfo(shareToken: string): Promise<SharedFileInfo> {
  const response = await fetch(`${API_URL}/api/shared/${shareToken}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get file information');
  }

  const data = await response.json();
  return data.file;
}

/**
 * Download a shared file (public, no auth required)
 */
export async function downloadSharedFile(
  shareToken: string,
  password?: string
): Promise<Blob> {
  const response = await fetch(`${API_URL}/api/shared/${shareToken}/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to download file');
  }

  return response.blob();
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    return 'Expired';
  } else if (diffHours < 24) {
    return `${diffHours}h remaining`;
  } else if (diffDays < 7) {
    return `${diffDays}d remaining`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
