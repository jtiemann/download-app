import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import config from '../config/index.js';

export const downloadService = {
  async createReadStream(fileId, startByte = 0, endByte = null) {
    try {
      const filePath = await this.resolveFilePath(fileId);
      console.log(`Creating read stream for ${filePath} from byte ${startByte} to ${endByte}`);
      
      const options = {
        start: startByte
      };
      
      if (endByte !== null) {
        options.end = endByte;
      }

      const stream = createReadStream(filePath, options);
      
      // Add error handler to the stream
      stream.on('error', (error) => {
        console.error('Stream error:', error);
      });

      return stream;
    } catch (error) {
      console.error('Error creating read stream:', error);
      throw error;
    }
  },

  async getFileInfo(fileId) {
    try {
      const filePath = await this.resolveFilePath(fileId);
      console.log(`Getting file info for: ${filePath}`);
      const stats = await fs.stat(filePath);
      
      const info = {
        size: stats.size,
        name: path.basename(filePath),
        createTime: stats.birthtime,
        modifyTime: stats.mtime
      };
      
      console.log('File info:', info);
      return info;
    } catch (error) {
      console.error('Error getting file info:', error);
      throw error;
    }
  },

  async resolveFilePath(fileId) {
    // Sanitize the fileId
    const safeFileId = path.basename(fileId);
    const storagePath = process.env.FILE_STORAGE_PATH || path.join(process.cwd(), 'storage');
    const filePath = path.join(storagePath, safeFileId);
    
    console.log('Resolving file path:', {
      fileId,
      safeFileId,
      storagePath,
      resolvedPath: filePath
    });

    // Check if the storage directory exists
    try {
      await fs.access(storagePath);
    } catch (error) {
      console.error('Storage directory not accessible:', error);
      throw new Error('Storage directory not accessible');
    }

    // Check if the file exists
    try {
      await fs.access(filePath);
      return filePath;
    } catch (error) {
      console.error('File not accessible:', error);
      throw new Error(`File not found: ${safeFileId}`);
    }
  }
};