import React, { useState } from 'react';
import { downloadFile } from '../services/downloadService';

function DownloadManager({ fileId }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    try {
      setStatus('downloading');
      setError(null);

      await downloadFile(fileId, {
        onProgress: (loaded, total) => {
          const percentage = (loaded / total) * 100;
          setProgress(percentage);
        }
      });

      setStatus('complete');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="download-manager">
      <div className="status-section">
        <p>Status: {status}</p>
        {error && <p className="error">Error: {error}</p>}
      </div>

      <div className="progress-section">
        {status === 'downloading' && (
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        )}
      </div>

      <button 
        onClick={handleDownload}
        disabled={status === 'downloading'}
      >
        {status === 'downloading' ? 'Downloading...' : 'Download File'}
      </button>

      <style jsx>{`
        .download-manager {
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 4px;
          max-width: 400px;
          margin: 0 auto;
        }

        .status-section {
          margin-bottom: 20px;
        }

        .error {
          color: red;
        }

        .progress-bar {
          width: 100%;
          height: 20px;
          background-color: #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          margin-bottom: 20px;
        }

        .progress-fill {
          height: 100%;
          background-color: #4CAF50;
          transition: width 0.3s ease-in-out;
        }

        .progress-text {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          color: #000;
          font-size: 12px;
        }

        button {
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default DownloadManager;