import SftpClient from 'ssh2-sftp-client';
import path from 'path';

export class O2SwitchStorage {
  private static instance: O2SwitchStorage | null = null;
  private client: SftpClient;
  private connected: boolean = false;
  private connecting: Promise<void> | null = null; // Verrou pour éviter les connexions simultanées

  private constructor() {
    this.client = new SftpClient();
  }

  // Singleton pattern pour réutiliser la même connexion
  static getInstance(): O2SwitchStorage {
    if (!O2SwitchStorage.instance) {
      O2SwitchStorage.instance = new O2SwitchStorage();
    }
    return O2SwitchStorage.instance;
  }

  async connect() {
    // Si déjà connecté, ne pas reconnecter
    if (this.connected) {
      console.log('♻️ Reusing existing SFTP connection');
      return;
    }

    // Si une connexion est en cours, attendre qu'elle se termine
    if (this.connecting) {
      console.log('⏳ Waiting for ongoing SFTP connection...');
      await this.connecting;
      return;
    }

    // Créer une promesse de connexion pour bloquer les autres tentatives
    this.connecting = (async () => {
      try {
        await this.client.connect({
          host: process.env.O2SWITCH_SFTP_HOST!,
          port: parseInt(process.env.O2SWITCH_SFTP_PORT || '22'),
          username: process.env.O2SWITCH_SFTP_USER!,
          password: process.env.O2SWITCH_SFTP_PASSWORD!,
          readyTimeout: 60000, // 60 seconds to establish connection
          retries: 3,
          retry_factor: 2,
          retry_minTimeout: 2000,
          keepaliveInterval: 10000, // Keep connection alive
          keepaliveCountMax: 3,
        });
        this.connected = true;
        console.log('✅ SFTP connection established');
      } catch (error) {
        this.connected = false;
        throw error;
      } finally {
        this.connecting = null;
      }
    })();

    await this.connecting;
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    type: 'label-submissions' | 'studio-requests' | 'admin'
  ): Promise<string> {
    let remotePath: string;
    let publicUrl: string | null = null;

    if (type === 'admin') {
      // Pour admin, filename est le chemin complet relatif
      const adminBasePath = process.env.ADMIN_STORAGE_PATH || '/home/faji2535/admin-files';
      remotePath = path.join(adminBasePath, filename);
      // Pas d'URL publique pour admin (fichiers privés)
    } else {
      remotePath = path.join(
        process.env.O2SWITCH_BASE_PATH!,
        type,
        filename
      );
      publicUrl = `${process.env.O2SWITCH_PUBLIC_URL}/${type}/${filename}`;
    }

    await this.client.put(buffer, remotePath);

    return publicUrl || remotePath;
  }

  async disconnect() {
    if (this.connected) {
      await this.client.end();
      this.connected = false;
      console.log('🔌 SFTP connection closed');
    }
  }

  async fileExists(filename: string, type: string): Promise<boolean> {
    try {
      const remotePath = path.join(
        process.env.O2SWITCH_BASE_PATH!,
        type,
        filename
      );
      return await this.client.exists(remotePath) !== false;
    } catch {
      return false;
    }
  }

  // Admin-specific methods
  async listAdminFiles(relativePath: string = '/'): Promise<any[]> {
    const adminBasePath = process.env.ADMIN_STORAGE_PATH || '/home/faji2535/admin-files';
    const fullPath = path.join(adminBasePath, relativePath);

    const list = await this.client.list(fullPath);
    return list
      .filter((item) => item.name !== '.' && item.name !== '..')
      .map((item) => ({
        basename: item.name,
        filename: path.join(relativePath, item.name),
        type: item.type === 'd' ? 'directory' : 'file',
        size: item.size,
        lastmod: new Date(item.modifyTime).toISOString(),
        mime: item.type === 'd' ? undefined : 'application/octet-stream',
      }));
  }

  async downloadAdminFile(relativePath: string): Promise<Buffer> {
    const adminBasePath = process.env.ADMIN_STORAGE_PATH || '/home/faji2535/admin-files';
    const fullPath = path.join(adminBasePath, relativePath);

    return await this.client.get(fullPath) as Buffer;
  }

  async deleteAdminFile(relativePath: string): Promise<void> {
    const adminBasePath = process.env.ADMIN_STORAGE_PATH || '/home/faji2535/admin-files';
    const fullPath = path.join(adminBasePath, relativePath);

    const stat = await this.client.stat(fullPath);
    if (stat.isDirectory) {
      await this.client.rmdir(fullPath, true);
    } else {
      await this.client.delete(fullPath);
    }
  }

  async createAdminDirectory(relativePath: string): Promise<void> {
    const adminBasePath = process.env.ADMIN_STORAGE_PATH || '/home/faji2535/admin-files';
    const fullPath = path.join(adminBasePath, relativePath);

    await this.client.mkdir(fullPath, true);
  }

  async searchAdminFiles(relativePath: string, query: string): Promise<any[]> {
    const adminBasePath = process.env.ADMIN_STORAGE_PATH || '/home/faji2535/admin-files';
    const fullPath = path.join(adminBasePath, relativePath);

    // Recursively list all files and filter by query
    const searchResults: any[] = [];
    const lowerQuery = query.toLowerCase();

    const searchDirectory = async (dirPath: string) => {
      const list = await this.client.list(dirPath);

      for (const item of list) {
        if (item.name === '.' || item.name === '..') continue;

        const itemPath = path.join(dirPath, item.name);
        const relativePath = itemPath.replace(adminBasePath, '').replace(/^\//, '');

        // Check if name matches query
        if (item.name.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            ...item,
            path: relativePath,
          });
        }

        // If it's a directory, search recursively
        if (item.type === 'd') {
          await searchDirectory(itemPath);
        }
      }
    };

    await searchDirectory(fullPath);
    return searchResults;
  }
}
