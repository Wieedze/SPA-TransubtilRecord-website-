import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Upload, FolderPlus, Search, Home, ChevronRight,
  File, Folder, Image as ImageIcon, Music, Video, FileText,
  Download, Trash2, RefreshCw, Loader2, Share2, Copy, Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { NextCloudFile } from '../../types/nextcloud';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function MyDrive() {
  const { session } = useAuth();
  const [files, setFiles] = useState<NextCloudFile[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [fileToShare, setFileToShare] = useState<NextCloudFile | null>(null);
  const [previewFile, setPreviewFile] = useState<NextCloudFile | null>(null);

  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath]);

  const loadFiles = async (path: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin-storage/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ path }),
      });

      if (!response.ok) throw new Error('Failed to load files');

      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Load files error:', error);
      alert('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', currentPath);

      const response = await fetch(`${API_URL}/api/admin-storage/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      await loadFiles(currentPath);
      setShowUploadModal(false);
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: NextCloudFile) => {
    if (!confirm(`Delete ${file.basename}?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/admin-storage/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ path: file.filename }),
      });

      if (!response.ok) throw new Error('Delete failed');

      await loadFiles(currentPath);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete');
    }
  };

  const handleDownload = async (file: NextCloudFile) => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin-storage/download`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ path: file.filename }),
        }
      );

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.basename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin-storage/create-folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ path: currentPath, name }),
      });

      if (!response.ok) throw new Error('Create folder failed');

      await loadFiles(currentPath);
      setShowFolderModal(false);
    } catch (error) {
      console.error('Create folder error:', error);
      alert('Failed to create folder');
    }
  };

  const getFileIcon = (file: NextCloudFile) => {
    if (file.type === 'directory') return <Folder className="w-5 h-5 text-brand-300" />;

    const mime = file.mime?.toLowerCase() || '';
    if (mime.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-400" />;
    if (mime.startsWith('audio/')) return <Music className="w-5 h-5 text-purple-400" />;
    if (mime.startsWith('video/')) return <Video className="w-5 h-5 text-red-400" />;
    if (mime.includes('text') || mime.includes('pdf')) return <FileText className="w-5 h-5 text-green-400" />;

    return <File className="w-5 h-5 text-gray-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pathParts = currentPath.split('/').filter(Boolean);

  const filteredFiles = files.filter(file =>
    file.basename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-bold">My Drive</h1>
          <p className="text-sm text-white/60 mt-1 uppercase tracking-wider">
            Personal file storage
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors text-sm uppercase tracking-wider"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button
            onClick={() => setShowFolderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-700 hover:bg-brand-600 rounded-lg transition-colors text-sm uppercase tracking-wider"
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </button>
          <button
            onClick={() => loadFiles(currentPath)}
            className="px-4 py-2 bg-brand-700 hover:bg-brand-600 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-white/60"
      >
        <button
          onClick={() => setCurrentPath('/')}
          className="hover:text-white transition-colors"
        >
          <Home className="w-4 h-4" />
        </button>
        {pathParts.map((part, index) => (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4" />
            <button
              onClick={() => setCurrentPath('/' + pathParts.slice(0, index + 1).join('/'))}
              className="hover:text-white transition-colors uppercase tracking-wider"
            >
              {part}
            </button>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search files..."
          className="w-full pl-10 pr-4 py-2 bg-brand-800 border border-white/10 rounded-lg text-sm uppercase tracking-wider placeholder:text-white/40 focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Files List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-brand-800/50 border border-white/10 rounded-lg overflow-hidden"
      >
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-brand-300 animate-spin" />
            <div className="text-white/60">
              <p className="font-medium">Chargement des fichiers...</p>
              <p className="text-sm text-white/40 mt-1">Connexion au serveur SFTP</p>
            </div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-8 text-center text-white/60">No files found</div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredFiles.map((file) => (
              <div
                key={file.filename}
                className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group"
              >
                <div className="flex-shrink-0">
                  {getFileIcon(file)}
                </div>

                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => {
                      if (file.type === 'directory') {
                        setCurrentPath(file.filename);
                      } else if (file.mime?.startsWith('image/')) {
                        setPreviewFile(file);
                      }
                    }}
                    className="text-left block w-full hover:text-brand-300 transition-colors"
                  >
                    <p className="font-medium truncate">{file.basename}</p>
                    <p className="text-xs text-white/40 uppercase tracking-wider mt-1">
                      {file.type === 'file' && formatFileSize(file.size)} · {formatDate(file.lastmod)}
                    </p>
                  </button>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.type === 'file' && (
                    <>
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setFileToShare(file);
                          setShowShareModal(true);
                        }}
                        className="p-2 hover:bg-brand-500/20 rounded-lg transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(file)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
          uploading={uploading}
        />
      )}

      {/* Create Folder Modal */}
      {showFolderModal && (
        <CreateFolderModal
          onClose={() => setShowFolderModal(false)}
          onCreate={handleCreateFolder}
        />
      )}

      {/* Share Modal */}
      {showShareModal && fileToShare && (
        <ShareModal
          file={fileToShare}
          onClose={() => {
            setShowShareModal(false);
            setFileToShare(null);
          }}
          session={session}
        />
      )}

      {/* Preview Modal */}
      {previewFile && previewFile.mime?.startsWith('image/') && (
        <ImagePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          session={session}
        />
      )}
    </div>
  );
}

// Upload Modal Component
function UploadModal({ onClose, onUpload, uploading }: { onClose: () => void; onUpload: (file: File) => void; uploading: boolean }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-brand-900 border border-white/10 rounded-lg p-6 max-w-md w-full"
      >
        <h2 className="text-xl font-bold mb-4">Upload File</h2>

        {uploading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-brand-300 animate-spin" />
            <div className="text-white/60 text-center">
              <p className="font-medium">Upload en cours...</p>
              <p className="text-sm text-white/40 mt-1">Envoi vers le serveur SFTP</p>
            </div>
          </div>
        ) : (
          <>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => selectedFile && onUpload(selectedFile)}
                disabled={!selectedFile}
                className="flex-1 px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
              >
                Upload
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-brand-700 hover:bg-brand-600 rounded-lg transition-colors uppercase tracking-wider text-sm"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// Create Folder Modal Component
function CreateFolderModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
  const [folderName, setFolderName] = useState('');

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-brand-900 border border-white/10 rounded-lg p-6 max-w-md w-full"
      >
        <h2 className="text-xl font-bold mb-4">Create Folder</h2>

        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Folder name"
          className="w-full px-4 py-2 bg-brand-800 border border-white/10 rounded-lg mb-4 uppercase tracking-wider placeholder:text-white/40 focus:outline-none focus:border-brand-500"
        />

        <div className="flex gap-3">
          <button
            onClick={() => folderName.trim() && onCreate(folderName.trim())}
            disabled={!folderName.trim()}
            className="flex-1 px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
          >
            Create
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-brand-700 hover:bg-brand-600 rounded-lg transition-colors uppercase tracking-wider text-sm"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Image Preview Modal Component
function ImagePreviewModal({ file, onClose, session }: { file: NextCloudFile; onClose: () => void; session: any }) {
  const imageUrl = `${API_URL}/api/nextcloud/download?path=${encodeURIComponent(file.filename)}`;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={file.basename}
          className="max-w-full max-h-[90vh] object-contain"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
        >
          ✕
        </button>
      </motion.div>
    </div>
  );
}

// Share Modal Component
function ShareModal({ file, onClose, session }: { file: NextCloudFile; onClose: () => void; session: any }) {
  const [expiresIn, setExpiresIn] = useState<number>(24 * 60 * 60 * 1000); // 24h par défaut
  const [password, setPassword] = useState('');
  const [maxDownloads, setMaxDownloads] = useState<number | undefined>(undefined);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreateShare = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/share/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          filePath: file.filename,
          fileName: file.basename,
          fileSize: file.size,
          expiresIn: expiresIn || undefined,
          password: password || undefined,
          maxDownloads: maxDownloads || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to create share link');

      const data = await response.json();
      setShareLink(data.shareLink.url);
    } catch (error) {
      console.error('Share error:', error);
      alert('Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-brand-900 border border-white/10 rounded-lg p-6 max-w-md w-full"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Partager: {file.basename}
        </h2>

        {!shareLink ? (
          <>
            {/* Expiration */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Expiration</label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-white/10 rounded-lg text-black"
              >
                <option value={60 * 60 * 1000}>1 heure</option>
                <option value={24 * 60 * 60 * 1000}>24 heures</option>
                <option value={7 * 24 * 60 * 60 * 1000}>7 jours</option>
                <option value={30 * 24 * 60 * 60 * 1000}>30 jours</option>
                <option value={0}>Jamais</option>
              </select>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Mot de passe (optionnel)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Protéger par mot de passe"
                className="w-full px-3 py-2 bg-white border border-white/10 rounded-lg text-black placeholder:text-black/50"
              />
            </div>

            {/* Max Downloads */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Limite de téléchargements (optionnel)</label>
              <input
                type="number"
                value={maxDownloads || ''}
                onChange={(e) => setMaxDownloads(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Illimité"
                min="1"
                className="w-full px-3 py-2 bg-white border border-white/10 rounded-lg text-black placeholder:text-black/50"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateShare}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-50 uppercase tracking-wider text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Créer le lien
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-brand-700 hover:bg-brand-600 rounded-lg transition-colors uppercase tracking-wider text-sm"
              >
                Annuler
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Share Link Created */}
            <div className="mb-4 p-3 bg-brand-800 rounded-lg">
              <p className="text-sm text-white/60 mb-2">Lien de partage créé:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-brand-900 border border-white/10 rounded-lg text-sm"
                />
                <button
                  onClick={handleCopy}
                  className="p-2 bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors"
                  title="Copier"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-sm text-white/60 mb-4 space-y-1">
              {expiresIn > 0 && <p>• Expire dans {expiresIn / (60 * 60 * 1000)} heures</p>}
              {password && <p>• Protégé par mot de passe</p>}
              {maxDownloads && <p>• Limite: {maxDownloads} téléchargements</p>}
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors uppercase tracking-wider text-sm"
            >
              Fermer
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
