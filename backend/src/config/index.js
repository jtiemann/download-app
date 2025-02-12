import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  port: process.env.PORT || 3000,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    sessionTTL: 24 * 60 * 60 // 24 hours
  },
  download: {
    chunkSize: 1024 * 1024, // 1MB
    maxConcurrent: 3
  },
  storage: {
    path: process.env.FILE_STORAGE_PATH || path.join(dirname(dirname(__dirname)), 'storage')
  }
};