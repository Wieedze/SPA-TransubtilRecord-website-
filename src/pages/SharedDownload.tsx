import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Lock, AlertCircle, CheckCircle, FileIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import {
  getSharedFileInfo,
  downloadSharedFile,
  formatFileSize,
  formatDate,
  type SharedFileInfo,
} from '../lib/share-service';

export default function SharedDownload() {
  const { token } = useParams<{ token: string }>();
  const [fileInfo, setFileInfo] = useState<SharedFileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadFileInfo();
    }
  }, [token]);

  const loadFileInfo = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const info = await getSharedFileInfo(token);
      setFileInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!token || !fileInfo) return;

    setDownloading(true);
    setDownloadError(null);

    try {
      const blob = await downloadSharedFile(
        token,
        fileInfo.requiresPassword ? password : undefined
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileInfo.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Reload file info to update download count
      await loadFileInfo();
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Failed to download file');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-900 flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-300 mx-auto mb-4"></div>
          <p>Loading file information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-800/50 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-brand-700/30"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Link Not Available
          </h2>
          <p className="text-white/70 text-center mb-6">{error}</p>
          <div className="flex flex-col gap-2 text-sm text-white/60">
            <p>This link may have:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Expired</li>
              <li>Been deactivated</li>
              <li>Reached its download limit</li>
              <li>Never existed</li>
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!fileInfo) {
    return null;
  }

  const isExpired = fileInfo.expiresAt && new Date(fileInfo.expiresAt) < new Date();
  const isLimitReached =
    fileInfo.maxDownloads !== null && fileInfo.downloadCount >= fileInfo.maxDownloads;
  const canDownload = fileInfo.isActive && !isExpired && !isLimitReached;

  return (
    <div className="min-h-screen bg-brand-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-800/50 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-brand-700/30"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500/20 rounded-full mb-4">
            <FileIcon className="w-8 h-8 text-brand-300" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Shared File</h1>
          <p className="text-white/60 text-sm">Transubtil Records</p>
        </div>

        {/* File Info */}
        <div className="space-y-4 mb-6">
          <div className="bg-brand-900/50 rounded-lg p-4">
            <p className="text-sm text-white/60 mb-1">File Name</p>
            <p className="text-white font-medium break-all">{fileInfo.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-900/50 rounded-lg p-4">
              <p className="text-sm text-white/60 mb-1">Size</p>
              <p className="text-white font-medium">{formatFileSize(fileInfo.size)}</p>
            </div>

            {fileInfo.expiresAt && (
              <div className="bg-brand-900/50 rounded-lg p-4">
                <p className="text-sm text-white/60 mb-1">Expires</p>
                <p className="text-white font-medium">{formatDate(fileInfo.expiresAt)}</p>
              </div>
            )}
          </div>

          {fileInfo.maxDownloads !== null && (
            <div className="bg-brand-900/50 rounded-lg p-4">
              <p className="text-sm text-white/60 mb-1">Downloads</p>
              <p className="text-white font-medium">
                {fileInfo.downloadCount} / {fileInfo.maxDownloads}
              </p>
            </div>
          )}
        </div>

        {/* Password Input (if required) */}
        {canDownload && fileInfo.requiresPassword && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/80 mb-2">
              <Lock className="inline w-4 h-4 mr-2" />
              Password Required
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-brand-900/50 border border-brand-700/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-brand-500"
            />
          </div>
        )}

        {/* Download Error */}
        {downloadError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{downloadError}</p>
          </div>
        )}

        {/* Download Button */}
        {canDownload ? (
          <button
            onClick={handleDownload}
            disabled={downloading || (fileInfo.requiresPassword && !password)}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download File
              </>
            )}
          </button>
        ) : (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium mb-1">Download Not Available</p>
                <p className="text-red-400/80 text-sm">
                  {isExpired && 'This link has expired.'}
                  {isLimitReached && 'Download limit has been reached.'}
                  {!fileInfo.isActive && 'This link has been deactivated.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {fileInfo.downloadCount > 0 && canDownload && (
          <div className="mt-4 p-3 bg-brand-500/10 border border-brand-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-brand-300 text-sm">
              <CheckCircle className="w-4 h-4" />
              <p>This file has been downloaded {fileInfo.downloadCount} time{fileInfo.downloadCount > 1 ? 's' : ''}</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
