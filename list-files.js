import SftpClient from 'ssh2-sftp-client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sftp = new SftpClient();

async function listFiles() {
  try {
    console.log('🔌 Connecting to SFTP...');
    await sftp.connect({
      host: process.env.O2SWITCH_SFTP_HOST,
      port: parseInt(process.env.O2SWITCH_SFTP_PORT || '22'),
      username: process.env.O2SWITCH_SFTP_USER,
      password: process.env.O2SWITCH_SFTP_PASSWORD,
    });
    console.log('✅ Connected!\n');

    const basePath = '/home/faji2535/public_html/public-uploads/users/label-submissions';

    console.log(`📂 Listing files in: ${basePath}`);
    const files = await sftp.list(basePath);

    console.log(`\n📁 Found ${files.length} files:\n`);
    files.forEach(file => {
      console.log(`  ${file.type === '-' ? '📄' : '📁'} ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    });

    await sftp.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listFiles();
