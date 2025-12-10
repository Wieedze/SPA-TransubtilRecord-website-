export interface NextCloudFile {
  filename: string
  basename: string
  lastmod: string
  size: number
  type: 'file' | 'directory'
  mime?: string
  etag: string
}

export interface NextCloudListResponse {
  files: NextCloudFile[]
  currentPath: string
}

export interface NextCloudUploadResponse {
  success: boolean
  file?: NextCloudFile
  error?: string
}

export interface NextCloudDeleteResponse {
  success: boolean
  error?: string
}

export interface NextCloudCreateFolderResponse {
  success: boolean
  folder?: NextCloudFile
  error?: string
}

export interface NextCloudSearchResponse {
  files: NextCloudFile[]
}

export type SortField = 'name' | 'size' | 'date'
export type SortDirection = 'asc' | 'desc'

export interface FileSort {
  field: SortField
  direction: SortDirection
}
