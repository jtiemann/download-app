// frontend/src/hooks/useDownload.js
import { useState, useCallback } from 'react';
import { downloadService } from '../services/downloadService';

export const useDownload = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const startDownload = useCallback(async (fileId) => {
    try {
      setStatus('initializing');
      const download = await downloadService.initializeDownload(fileId);
      
      setStatus('downloading');
      const result = await download.start({
        onProgress: (bytes, total) => {
          setProgress((bytes / total) * 100);
        }
      });

      setStatus('complete');
      return result;
    } catch (error) {
      setError(error);
      setStatus('error');
      throw error;
    }
  }, []);

  return {
    startDownload,
    progress,
    status,
    error
  };
};
