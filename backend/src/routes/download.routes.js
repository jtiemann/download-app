import { Router } from 'express';
import { downloadController } from '../controllers/downLoadController.js';

const router = Router();

router.post('/init', downloadController.initDownload);
router.get('/chunk', downloadController.downloadChunk);

export const downloadRoutes = router;