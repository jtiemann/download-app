import { Router } from 'express';
import { fileService } from '../services/fileService.js';

const router = Router();

router.get('/list', async (req, res) => {
  try {
    const files = await fileService.listFiles();
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list files', details: error.message });
  }
});

export const fileRoutes = router;