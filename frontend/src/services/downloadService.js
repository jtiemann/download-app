const API_URL = 'http://localhost:3000/api';

export const downloadFile = async (fileId, { onProgress } = {}) => {
  try {
    // Initialize download
    const initResponse = await fetch(`${API_URL}/downloads/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId }),
    });

    if (!initResponse.ok) {
      const error = await initResponse.json();
      throw new Error(error.details || 'Failed to initialize download');
    }

    const { token, fileSize, fileName } = await initResponse.json();
    let downloadedBytes = 0;
    
    // Create array to store chunks
    const chunks = [];

    // Download file in chunks
    while (downloadedBytes < fileSize) {
      const response = await fetch(`${API_URL}/downloads/chunk`, {
        headers: {
          'x-download-token': token,
          'range': `bytes=${downloadedBytes}-`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const chunk = await response.blob();
      chunks.push(chunk);
      downloadedBytes += chunk.size;
      
      if (onProgress) {
        onProgress(downloadedBytes, fileSize);
      }
    }

    // Combine all chunks into a single blob
    const completeFile = new Blob(chunks, { type: 'application/octet-stream' });

    // Create download link
    const downloadUrl = window.URL.createObjectURL(completeFile);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName || fileId; // Use fileName from server if available
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);

    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};