import SftpClient from 'ssh2-sftp-client';
import path from 'path';

export class O2SwitchStorage {
  private client: SftpClient;

  constructor() {
    this.client = new SftpClient();
  }

  async connect() {
    await this.client.connect({
      host: process.env.O2SWITCH_SFTP_HOST!,
      port: parseInt(process.env.O2SWITCH_SFTP_PORT || '22'),
      username: process.env.O2SWITCH_SFTP_USER!,
      password: process.env.O2SWITCH_SFTP_PASSWORD!,
    });
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
    await this.client.end();
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
