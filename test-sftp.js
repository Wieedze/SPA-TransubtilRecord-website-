import SftpClient from 'ssh2-sftp-client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const testSFTP = async () => {
  const sftp = new SftpClient();

  try {
    console.log('🔌 Connecting to SFTP...');
    console.log('Host:', process.env.O2SWITCH_SFTP_HOST);
    console.log('Port:', process.env.O2SWITCH_SFTP_PORT);
    console.log('User:', process.env.O2SWITCH_SFTP_USER);

    await sftp.connect({
      host: process.env.O2SWITCH_SFTP_HOST,
      port: parseInt(process.env.O2SWITCH_SFTP_PORT || '22'),
      username: process.env.O2SWITCH_SFTP_USER,
      password: process.env.O2SWITCH_SFTP_PASSWORD,
    });

    console.log('✅ Connected successfully!');

    // First, check current directory
    const cwd = await sftp.cwd();
    console.log('📁 Current working directory:', cwd);

    // List home directory
    console.log('\n📂 Listing home directory:');
    const homeList = await sftp.list('.');
    console.log('Contents:', homeList.map(f => f.name));

    // Test list directory
    const basePath = process.env.O2SWITCH_BASE_PATH;
    console.log(`\n📂 Checking if ${basePath} exists...`);

    const dirExists = await sftp.exists(basePath);
    if (!dirExists) {
      console.log('⚠️  Directory does not exist. Creating...');
      await sftp.mkdir(basePath, true); // recursive
      console.log('✅ Directory created');
    } else {
      console.log('✅ Directory exists');
    }

    const list = await sftp.list(basePath);
    console.log('Contents:', list.map(f => f.name));

    // Test upload a small file
    console.log('\n📤 Testing file upload...');
    const testContent = Buffer.from('Test upload from Node.js at ' + new Date().toISOString());
    const testPath = `${basePath}/test-${Date.now()}.txt`;
    await sftp.put(testContent, testPath);
    console.log('✅ File uploaded successfully:', testPath);

    // Test if file exists
    const fileExists = await sftp.exists(testPath);
    console.log('✅ File exists:', fileExists);

    // Delete test file
    await sftp.delete(testPath);
    console.log('✅ Test file deleted');

    await sftp.end();
    console.log('\n✅ All tests passed! SFTP is working correctly.');

  } catch (error) {
    console.error('❌ SFTP Error:', error);
    process.exit(1);
  }
};

testSFTP();
