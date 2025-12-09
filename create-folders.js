import SftpClient from 'ssh2-sftp-client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const createFolders = async () => {
  const sftp = new SftpClient();

  try {
    console.log('🔌 Connecting to SFTP...');
    await sftp.connect({
      host: process.env.O2SWITCH_SFTP_HOST,
      port: parseInt(process.env.O2SWITCH_SFTP_PORT || '22'),
      username: process.env.O2SWITCH_SFTP_USER,
      password: process.env.O2SWITCH_SFTP_PASSWORD,
    });

    console.log('✅ Connected successfully!');

    const basePath = process.env.O2SWITCH_BASE_PATH;

    // Create subdirectories
    const folders = [
      `${basePath}/label-submissions`,
      `${basePath}/studio-requests`
    ];

    for (const folder of folders) {
      const exists = await sftp.exists(folder);
      if (!exists) {
        console.log(`📁 Creating ${folder}...`);
        await sftp.mkdir(folder, true);
        console.log('✅ Created');
      } else {
        console.log(`✅ ${folder} already exists`);
      }
    }

    console.log('\n📂 Final directory structure:');
    const list = await sftp.list(basePath);
    console.log('Contents:', list.map(f => f.name));

    await sftp.end();
    console.log('\n✅ All folders created successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createFolders();
