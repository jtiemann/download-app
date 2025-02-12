import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import config from '../config/index.js';

export const downloadService = {
  async createReadStream(fileId, startByte = 0) {
    const filePath = await this.resolveFilePath(fileId);
    return createReadStream(filePath, { start: startByte });
  },

  async getFileInfo(fileId) {
    const filePath = await this.resolveFilePath(fileId);
    console.log('Getting file info for path:', filePath);
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      name: path.basename(filePath)
    };
  },

  async resolveFilePath(fileId) {
    // Sanitize the fileId to prevent directory traversal
    const sanitizedFileId = path.basename(fileId);
    const storagePath = process.env.FILE_STORAGE_PATH || path.join(process.cwd(), 'storage');
    console.log('Storage path:', storagePath);
    
    const filePath = path.join(storagePath, sanitizedFileId);
    console.log('Resolved file path:', filePath);

    // Verify the file exists
    try {
      await fs.access(filePath);
      return filePath;
    } catch (error) {
      throw new Error(`File not found: ${sanitizedFileId}`);
    }
  }
};