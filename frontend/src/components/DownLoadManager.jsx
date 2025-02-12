// Updated DownloadManager component
// frontend/src/components/DownloadManager.jsx
import React, { useState } from 'react';
import { useDownload } from '../hooks/useDownLoad';

const DownloadManager = ({ fileId }) => {
  const [downloads, setDownloads] = useState(new Map());
  const { startDownload, status, error } = useDownload();

  const handleDownload = async () => {
    try {
      const downloadId = Date.now().toString();
      setDownloads(prev => new Map(prev).set(downloadId, {
        progress: 0,
        status: 'starting'
      }));

      await startDownload(fileId, {
        onProgress: (bytes, total) => {
          setDownloads(prev => {
            const newMap = new Map(prev);
            newMap.set(downloadId, {
              progress: (bytes / total) * 100,
              status: 'downloading'
            });
            return newMap;
          });
        },
        onComplete: ({ fileName }) => {
          setDownloads(prev => {
            const newMap = new Map(prev);
            newMap.set(downloadId, {
              progress: 100,
              status: 'complete',
              fileName
            });
            return newMap;
          });
        }
      });
    } catch (error) {
      console.error('Download failed:', error);
      setDownloads(prev => {
        const newMap = new Map(prev);
        newMap.set(downloadId, {
          progress: 0,
          status: 'error',
          error: error.message
        });
        return newMap;
      });
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Download Manager</h2>
      
      <div className="space-y-4">
        {Array.from(downloads.entries()).map(([id, download]) => (
          <div key={id} className="border-b pb-2">
            <div className="flex justify-between mb-1">
              <span>{download.fileName || 'File'}</span>
              <span>{download.status}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded">
              <div 
                className="h-full bg-blue-500 rounded transition-all duration-300"
                style={{ width: `${download.progress}%` }}
              />
            </div>
            {download.error && (
              <div className="text-red-500 text-sm mt-1">
                {download.error}
              </div>
            )}
          </div>
        ))}
        
        <button
          onClick={handleDownload}
          disabled={status === 'downloading'}
          className="px-4 py-2 bg-blue-500 text-white rounded
                   disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Start New Download
        </button>
      </div>
    </div>
  );
};

export default DownloadManager;