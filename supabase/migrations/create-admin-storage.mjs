import Client from 'ssh2-sftp-client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sftp = new Client();

async function createAdminStorage() {
  try {
    console.log('🔌 Connecting to o2switch SFTP...');
    console.log('   Host:', process.env.O2SWITCH_SFTP_HOST);
    console.log('   Port:', process.env.O2SWITCH_SFTP_PORT);
    console.log('   User:', process.env.O2SWITCH_SFTP_USER);

    await sftp.connect({
      host: process.env.O2SWITCH_SFTP_HOST,
      port: parseInt(process.env.O2SWITCH_SFTP_PORT || '22'),
      username: process.env.O2SWITCH_SFTP_USER,
      password: process.env.O2SWITCH_SFTP_PASSWORD,
      readyTimeout: 60000, // 60 seconds timeout
      retries: 3,
      retry_minTimeout: 2000,
    });

    console.log('✅ Connected successfully!');

    const adminStoragePath = '/home/faji2535/admin-files';

    // Check if directory already exists
    const exists = await sftp.exists(adminStoragePath);

    if (exists) {
      console.log('ℹ️  Directory already exists:', adminStoragePath);
    } else {
      console.log('📁 Creating admin storage directory...');
      await sftp.mkdir(adminStoragePath, true);
      console.log('✅ Directory created successfully:', adminStoragePath);

      // Set permissions to 755
      await sftp.chmod(adminStoragePath, 0o755);
      console.log('🔒 Permissions set to 755');
    }

    // List directory to confirm
    const list = await sftp.list('/home/faji2535');
    const adminDir = list.find(item => item.name === 'admin-files');

    if (adminDir) {
      console.log('✅ Admin storage confirmed:');
      console.log(`   Path: ${adminStoragePath}`);
      console.log(`   Type: ${adminDir.type}`);
      console.log(`   Rights: ${adminDir.rights.user}${adminDir.rights.group}${adminDir.rights.other}`);
    }

    console.log('\n🎉 Admin storage setup complete!');

  } catch (error) {
    console.error('❌ Error creating admin storage:', error.message);
    process.exit(1);
  } finally {
    await sftp.end();
    console.log('🔌 SFTP connection closed');
  }
}

createAdminStorage();
