import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Upload, FolderPlus, Search, Home, ChevronRight,
  File, Folder, Image as ImageIcon, Music, Video, FileText,
  Download, Trash2, RefreshCw, Loader2, Share2, Copy, Check,
  Grid3x3, List, ArrowUpDown, X, Play, Pause, Volume2, VolumeX
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { NextCloudFile } from '../../types/nextcloud';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper Functions
const isImageFile = (file: NextCloudFile) => {
  const mime = file.mime?.toLowerCase() || '';
  const ext = file.basename?.toLowerCase().split('.').pop() || '';
  return mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
};

const isVideoFile = (file: NextCloudFile) => {
  const mime = file.mime?.toLowerCase() || '';
  const ext = file.basename?.toLowerCase().split('.').pop() || '';
  return mime.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext);
};

const isAudioFile = (file: NextCloudFile) => {
  const mime = file.mime?.toLowerCase() || '';
  const ext = file.basename?.toLowerCase().split('.').pop() || '';
  return mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext);
};

const getFileIcon = (file: NextCloudFile, large = false) => {
  const sizeClass = large ? 'w-12 h-12' : 'w-5 h-5';

  if (file.type === 'directory') return <Folder className={`${sizeClass} text-brand-300`} />;

  if (isImageFile(file)) return <ImageIcon className={`${sizeClass} text-blue-400`} />;
  if (isAudioFile(file)) return <Music className={`${sizeClass} text-purple-400`} />;
  if (isVideoFile(file)) return <Video className={`${sizeClass} text-red-400`} />;

  const mime = file.mime?.toLowerCase() || '';
  if (mime.includes('text') || mime.includes('pdf')) return <FileText className={`${sizeClass} text-green-400`} />;

  return <File className={`${sizeClass} text-gray-400`} />;
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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


  const pathParts = currentPath.split('/').filter(Boolean);

  const filteredFiles = files
    .filter(file =>
      file.basename?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Toujours mettre les dossiers en premier
      if (a.type === 'directory' && b.type !== 'directory') return -1;
      if (a.type !== 'directory' && b.type === 'directory') return 1;

      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = (a.basename || '').localeCompare(b.basename || '');
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'date':
          comparison = new Date(a.lastmod || 0).getTime() - new Date(b.lastmod || 0).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

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

      {/* View Controls & Sort */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between gap-4"
      >
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-brand-800/50 border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list' ? 'bg-brand-500 text-white' : 'text-white/60 hover:text-white'
            }`}
            title="Vue liste"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid' ? 'bg-brand-500 text-white' : 'text-white/60 hover:text-white'
            }`}
            title="Vue grille"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'size' | 'date')}
            className="px-3 py-2 bg-white border border-white/10 rounded-lg text-sm text-black"
          >
            <option value="name">Nom</option>
            <option value="size">Taille</option>
            <option value="date">Date</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-brand-800/50 border border-white/10 rounded-lg hover:bg-brand-700 transition-colors"
            title={sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
          >
            <ArrowUpDown className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search files..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-white/10 rounded-lg text-sm uppercase tracking-wider text-black placeholder:text-black/50 focus:outline-none focus:border-brand-500"
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
        ) : viewMode === 'list' ? (
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
                      } else if (isImageFile(file) || isVideoFile(file) || isAudioFile(file)) {
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
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
            {filteredFiles.map((file) => (
              <motion.div
                key={file.filename}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-brand-900/50 border border-white/10 rounded-lg overflow-hidden hover:bg-white/5 transition-all hover:scale-105"
              >
                {/* File Preview/Icon */}
                <button
                  onClick={() => {
                    if (file.type === 'directory') {
                      setCurrentPath(file.filename);
                    } else if (isImageFile(file) || isVideoFile(file) || isAudioFile(file)) {
                      setPreviewFile(file);
                    }
                  }}
                  className="w-full"
                >
                  {/* Thumbnail for images */}
                  {isImageFile(file) ? (
                    <FileThumbnail file={file} session={session} />
                  ) : (
                    <div className="flex justify-center items-center h-32 bg-brand-900/30">
                      <div className="text-brand-300">
                        {getFileIcon(file, true)}
                      </div>
                    </div>
                  )}

                  <div className="p-3">
                    <p className="font-medium text-sm truncate text-center">{file.basename}</p>
                    <p className="text-xs text-white/40 text-center mt-1">
                      {file.type === 'file' && formatFileSize(file.size)}
                    </p>
                  </div>
                </button>

                {/* Actions (overlay on hover) */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.type === 'file' && (
                    <>
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-1.5 bg-brand-900 hover:bg-brand-700 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setFileToShare(file);
                          setShowShareModal(true);
                        }}
                        className="p-1.5 bg-brand-900 hover:bg-brand-700 rounded transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(file)}
                    className="p-1.5 bg-brand-900 hover:bg-red-500 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
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
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          session={session}
        />
      )}
    </div>
  );
}

// File Thumbnail Component
function FileThumbnail({ file, session }: { file: NextCloudFile; session: any }) {
  const [error, setError] = useState(false);

  // Use streaming URL directly
  const thumbnailUrl = `${API_URL}/api/admin-storage/stream?path=${encodeURIComponent(file.filename)}&token=${session?.access_token}`;

  if (error) {
    return (
      <div className="flex justify-center items-center h-32 bg-brand-900/30">
        <ImageIcon className="w-12 h-12 text-blue-400/50" />
      </div>
    );
  }

  return (
    <div className="h-32 bg-brand-900/30 flex items-center justify-center overflow-hidden">
      <img
        src={thumbnailUrl}
        alt={file.basename}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
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
          className="w-full px-4 py-2 bg-white border border-white/10 rounded-lg mb-4 uppercase tracking-wider text-black placeholder:text-black/50 focus:outline-none focus:border-brand-500"
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

// File Preview Modal Component (Images, Videos, Audio)
function FilePreviewModal({ file, onClose, session }: { file: NextCloudFile; onClose: () => void; session: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Use streaming URL directly instead of blob
  const streamUrl = `${API_URL}/api/admin-storage/stream?path=${encodeURIComponent(file.filename)}&token=${session?.access_token}`;

  useEffect(() => {
    // Cleanup audio when modal closes
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  const handleAudioPlay = async () => {
    if (!audioElement && streamUrl) {
      const audio = new Audio();
      audio.src = streamUrl;
      audio.muted = isMuted;

      setAudioElement(audio);

      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);

      audio.play();
    } else if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
    }
  };

  const toggleMute = () => {
    if (audioElement) {
      audioElement.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 bg-brand-900/90 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-brand-300">
              {getFileIcon(file, true)}
            </div>
            <div>
              <h3 className="font-medium text-white">{file.basename}</h3>
              <p className="text-xs text-white/60">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="bg-brand-900/50 rounded-lg overflow-hidden">
          {isImageFile(file) && (
            <img
              src={streamUrl}
              alt={file.basename}
              className="w-full max-h-[70vh] object-contain"
            />
          )}

          {isVideoFile(file) && (
            <video
              controls
              className="w-full max-h-[70vh]"
              src={streamUrl}
            >
              Your browser does not support the video tag.
            </video>
          )}

          {isAudioFile(file) && (
            <div className="p-12 flex flex-col items-center justify-center gap-6">
              {/* Audio Visualizer */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center">
                  <Music className="w-16 h-16 text-white" />
                </div>
                {isPlaying && (
                  <div className="absolute inset-0 bg-brand-500/20 rounded-full animate-ping" />
                )}
              </div>

              {/* Audio Info */}
              <div className="text-center">
                <h3 className="font-medium text-xl text-white mb-2">{file.basename}</h3>
                <p className="text-sm text-white/60">{formatFileSize(file.size)}</p>
              </div>

              {/* Audio Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleMute}
                  className="p-3 bg-brand-800 hover:bg-brand-700 rounded-full transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleAudioPlay}
                  disabled={!streamUrl}
                  className="p-6 bg-brand-500 hover:bg-brand-600 rounded-full transition-colors disabled:opacity-50"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>

                <button
                  onClick={() => {
                    if (audioElement) {
                      audioElement.pause();
                      audioElement.currentTime = 0;
                      setIsPlaying(false);
                    }
                  }}
                  className="p-3 bg-brand-800 hover:bg-brand-700 rounded-full transition-colors"
                  disabled={!audioElement}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
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
