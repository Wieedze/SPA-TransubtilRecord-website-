import { useState, useRef } from "react"
import { Upload, X, File, AlertCircle } from "lucide-react"

interface AudioUploaderProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  maxSizeMB?: number
}

export default function AudioUploader({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 100,
}: AudioUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = [
    "audio/wav",
    "audio/x-wav",
    "audio/mpeg",
    "audio/mp3",
    "audio/flac",
    "audio/x-flac",
    "audio/aiff",
    "audio/x-aiff",
  ]

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(wav|mp3|flac|aiff)$/i)) {
      return `${file.name}: Invalid file type. Only WAV, MP3, FLAC, and AIFF are allowed.`
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `${file.name}: File too large. Maximum size is ${maxSizeMB}MB.`
    }

    return null
  }

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return

    setError(null)

    const fileArray = Array.from(newFiles)

    // Check total files limit
    if (files.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Validate each file
    for (const file of fileArray) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    // Add files
    onFilesChange([...files, ...fileArray])
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
    setError(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all
          ${
            isDragging
              ? "border-white/60 bg-white/5"
              : "border-white/20 hover:border-white/40 hover:bg-white/5"
          }
        `}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-white/60" />
        <p className="text-white/80 mb-2">
          Drag & drop audio files here, or click to browse
        </p>
        <p className="text-sm text-white/40">
          WAV, MP3, FLAC, AIFF • Max {maxSizeMB}MB per file • {maxFiles} files max
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".wav,.mp3,.flac,.aiff,audio/*"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-white/60">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-brand-700/20 border border-white/10 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File className="w-5 h-5 text-white/60 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate">{file.name}</p>
                    <p className="text-xs text-white/40">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-white/10 rounded transition-colors shrink-0"
                >
                  <X className="w-4 h-4 text-white/60 hover:text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
