import SftpClient from 'ssh2-sftp-client';
import fs from 'fs';

const sftp = new SftpClient();

async function uploadNextCloud() {
  try {
    console.log('🔌 Connecting to o2switch SFTP...');

    await sftp.connect({
      host: 'barbotte.o2switch.net',
      port: 22,
      username: 'faji2535',
      password: '4V3k-vexP-mpT$',
      readyTimeout: 90000,
      retries: 3,
      retry_factor: 2,
      retry_minTimeout: 3000,
    });

    console.log('✅ Connected to SFTP');

    // Créer le dossier pour le sous-domaine s'il n'existe pas
    const remotePath = '/home/faji2535/drive.transubtilrecord.com.faji2535.odns.fr';

    console.log(`📁 Checking/creating directory: ${remotePath}`);
    try {
      const exists = await sftp.exists(remotePath);
      if (!exists) {
        await sftp.mkdir(remotePath, true);
        console.log('✅ Directory created');
      } else {
        console.log('✅ Directory already exists');
      }
    } catch (err) {
      console.log('⚠️  Directory error, continuing...');
    }

    // Upload l'archive
    const localFile = '/tmp/nextcloud.tar.gz';
    const remoteFile = `${remotePath}/nextcloud.tar.gz`;

    console.log(`📤 Uploading NextCloud (282 MB)...`);
    console.log(`   From: ${localFile}`);
    console.log(`   To: ${remoteFile}`);
    console.log('   This may take 5-15 minutes depending on your connection...');
    console.log('');

    let lastPercent = 0;
    await sftp.fastPut(localFile, remoteFile, {
      step: (total, nb, fsize) => {
        const percent = Math.round((nb / fsize) * 100);
        if (percent !== lastPercent && percent % 5 === 0) {
          console.log(`   Progress: ${percent}% (${Math.round(nb / 1024 / 1024)} MB / ${Math.round(fsize / 1024 / 1024)} MB)`);
          lastPercent = percent;
        }
      }
    });

    console.log('');
    console.log('✅ NextCloud uploaded successfully!');
    console.log('');
    console.log('📝 Next steps to complete installation:');
    console.log('');
    console.log('1. Go to o2switch cPanel: https://cpanel.o2switch.net');
    console.log('2. Open "File Manager"');
    console.log('3. Navigate to: drive.transubtilrecord.com.faji2535.odns.fr');
    console.log('4. Right-click on "nextcloud.tar.gz" → Extract');
    console.log('5. Move all files from "nextcloud/" folder to the domain root');
    console.log('6. Delete "nextcloud.tar.gz" and empty "nextcloud/" folder');
    console.log('');
    console.log('7. Access NextCloud setup: https://drive.transubtilrecord.com.faji2535.odns.fr');
    console.log('8. Configure with:');
    console.log('   - Admin username: your choice');
    console.log('   - Admin password: strong password');
    console.log('   - Database: MySQL');
    console.log('   - Database name: faji2535_nextcloud_db');
    console.log('   - Database user: faji2535_nextcloud_user (create in cPanel if needed)');
    console.log('   - Database host: localhost');

    await sftp.end();
    console.log('');
    console.log('🔌 SFTP connection closed');

  } catch (error) {
    console.error('❌ Upload error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  }
}

uploadNextCloud();
