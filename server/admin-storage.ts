import express, { Request, Response } from 'express';
import multer from 'multer';
import { O2SwitchStorage } from '../src/lib/sftp.js';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Réutiliser le même client SFTP que pour les uploads users (évite les connexions multiples)
const storage = O2SwitchStorage.getInstance();

// Helper function to get Supabase client for user authentication (uses anon key)
function getSupabaseClient() {
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
}

// Helper function to get Supabase admin client (uses service key, bypasses RLS)
function getSupabaseAdminClient() {
  if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase admin credentials not configured');
  }
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Multer configuration for file uploads - NO LIMIT for admin
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // 10 GB max (essentially unlimited for most use cases)
  },
});

// Helper function to verify admin user
async function verifyAdminUser(authHeader: string | undefined) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  // Check if user is admin - use admin client to bypass RLS policies
  const supabaseAdmin = getSupabaseAdminClient();
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id);

  if (!profiles || profiles.length === 0 || profiles[0].role !== 'admin') {
    return null;
  }

  return user;
}

// List files in a directory
router.post('/list', async (req: Request, res: Response) => {
  try {
    const user = await verifyAdminUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { path = '/' } = req.body;

    // Connecter et lister les fichiers (le singleton réutilise la connexion si déjà établie)
    await storage.connect();
    const files = await storage.listAdminFiles(path);

    res.json({
      success: true,
      files,
      currentPath: path,
    });
  } catch (error) {
    console.error('Admin storage list error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to list files',
    });
  }
});

// Upload a file
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const user = await verifyAdminUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { path = '/' } = req.body;
    const remotePath = `${path}/${req.file.originalname}`.replace(/\/+/g, '/');

    console.log('⬆️  Admin uploading file:', req.file.originalname, `(${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);

    const file = await storage.uploadFile(req.file.buffer, remotePath, 'admin');

    res.json({
      success: true,
      file,
    });
  } catch (error) {
    console.error('Admin storage upload error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to upload file',
    });
  }
});

// Download a file
router.post('/download', async (req: Request, res: Response) => {
  try {
    const user = await verifyAdminUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { path } = req.body;

    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: 'Path is required' });
    }

    const data = await storage.downloadAdminFile(path);

    // Set appropriate headers
    const filename = path.split('/').pop() || 'download';
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', data.length);

    res.send(data);
  } catch (error) {
    console.error('Admin storage download error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to download file',
    });
  }
});

// Delete a file or directory
router.post('/delete', async (req: Request, res: Response) => {
  try {
    const user = await verifyAdminUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { path } = req.body;

    if (!path) {
      return res.status(400).json({ error: 'Path is required' });
    }

    await storage.deleteAdminFile(path);

    res.json({ success: true });
  } catch (error) {
    console.error('Admin storage delete error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete',
    });
  }
});

// Create a directory
router.post('/create-folder', async (req: Request, res: Response) => {
  try {
    const user = await verifyAdminUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { path, name } = req.body;

    if (!path || !name) {
      return res.status(400).json({ error: 'Path and name are required' });
    }

    const remotePath = `${path}/${name}`.replace(/\/+/g, '/');

    await storage.createAdminDirectory(remotePath);

    res.json({
      success: true,
      path: remotePath,
    });
  } catch (error) {
    console.error('Admin storage create folder error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create folder',
    });
  }
});

// Search files
router.post('/search', async (req: Request, res: Response) => {
  try {
    const user = await verifyAdminUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { path = '/', query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const files = await storage.searchAdminFiles(path, query);

    res.json({
      success: true,
      files,
    });
  } catch (error) {
    console.error('Admin storage search error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to search files',
    });
  }
});

export default router;
