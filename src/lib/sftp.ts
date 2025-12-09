import SftpClient from 'ssh2-sftp-client';
import path from 'path';

export class O2SwitchStorage {
  private static instance: O2SwitchStorage | null = null;
  private client: SftpClient;
  private connected: boolean = false;

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
    }
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
}
