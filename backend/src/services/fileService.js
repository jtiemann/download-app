import fs from 'fs/promises';
import path from 'path';
import config from '../config/index.js';

export const fileService = {
  async listFiles() {
    try {
      const storagePath = process.env.FILE_STORAGE_PATH || path.join(process.cwd(), 'storage');
      const files = await fs.readdir(storagePath);
      
      const fileDetails = await Promise.all(
        files.map(async (filename) => {
          const filePath = path.join(storagePath, filename);
          const stats = await fs.stat(filePath);
          
          return {
            name: filename,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            isDirectory: stats.isDirectory()
          };
        })
      );

      return fileDetails.filter(file => !file.isDirectory);
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Failed to list files');
    }
  }
};