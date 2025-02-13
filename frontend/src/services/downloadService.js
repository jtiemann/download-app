const API_URL = 'http://localhost:3000/api';

class FileStreamSaver {
  constructor(suggestedName) {
    this.fileHandle = null;
    this.writableStream = null;
    this.suggestedName = suggestedName;
    this.bytesWritten = 0;
  }

  async init() {
    try {
      console.log('Initializing FileStreamSaver for:', this.suggestedName);
      this.fileHandle = await window.showSaveFilePicker({
        suggestedName: this.suggestedName,
        types: [{
          description: 'ISO Image',
          accept: {
            'application/x-iso9660-image': ['.iso']
          }
        }],
      });

      console.log('File handle acquired, creating writable stream');
      this.writableStream = await this.fileHandle.createWritable();
      return true;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('File selection was cancelled');
      }
      console.error('Failed to initialize file stream:', error);
      throw error;
    }
  }

  async writeChunk(chunk, position) {
    try {
      console.log(`Writing chunk at position ${position}, size: ${chunk.size} bytes`);
      await this.writableStream.write({
        type: 'write',
        position: position,
        data: chunk
      });
      this.bytesWritten += chunk.size;
      console.log(`Successfully wrote chunk. Total bytes written: ${this.bytesWritten}`);
    } catch (error) {
      console.error('Failed to write chunk:', error);
      throw error;
    }
  }

  async close() {
    try {
      if (this.writableStream) {
        console.log('Closing file stream');
        await this.writableStream.close();
        console.log('File stream closed successfully');
      }
    } catch (error) {
      console.error('Failed to close file:', error);
      throw error;
    }
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Fetch attempt ${attempt + 1}/${maxRetries} for ${url}`);
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
        await sleep(waitTime);
        continue;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return response;
    } catch (error) {
      console.warn(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const waitTime = baseDelay * Math.pow(2, attempt);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await sleep(waitTime);
      }
    }
  }
  
  throw lastError;
}

export const downloadFile = async (fileId, { 
  onProgress, 
  chunkSize = 100 * 1024 * 1024, // 5MB chunks -> 100MB --jt
  maxRetries = 5,
  baseDelay = 1000
} = {}) => {
  let fileStreamSaver = null;

  try {
    // Initialize download
    console.log('Initializing download for:', fileId);
    const initResponse = await fetchWithRetry(
      `${API_URL}/downloads/init`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId })
      },
      maxRetries,
      baseDelay
    );

    const initData = await initResponse.json();
    console.log('Download initialized:', initData);
    
    const { token, fileSize, fileName } = initData;
    
    // Initialize the file stream
    console.log('Creating file stream saver');
    fileStreamSaver = new FileStreamSaver(fileName || fileId);
    await fileStreamSaver.init();

    let downloadedBytes = 0;
    let consecutiveFailures = 0;

    // Download and write file in chunks
    while (downloadedBytes < fileSize) {
      const endByte = Math.min(downloadedBytes + chunkSize - 1, fileSize - 1);
      
      try {
        console.log(`Requesting chunk: bytes ${downloadedBytes}-${endByte}`);
        const response = await fetchWithRetry(
          `${API_URL}/downloads/chunk`,
          {
            headers: {
              'x-download-token': token,
              'range': `bytes=${downloadedBytes}-${endByte}`,
            }
          },
          maxRetries,
          baseDelay * Math.pow(2, consecutiveFailures) // Increase delay with consecutive failures
        );

        const chunk = await response.blob();
        console.log(`Received chunk of size: ${chunk.size} bytes`);
        
        await fileStreamSaver.writeChunk(chunk, downloadedBytes);
        downloadedBytes += chunk.size;
        
        // Reset consecutive failures on success
        if (consecutiveFailures > 0) {
          console.log('Resetting consecutive failures counter');
          consecutiveFailures = 0;
        }
        
        if (onProgress) {
          onProgress(downloadedBytes, fileSize);
        }

        // Add a small delay between chunks to prevent overwhelming the server
        await sleep(50);

      } catch (error) {
        consecutiveFailures++;
        console.error(`Chunk download failed (attempt ${consecutiveFailures}):`, error);
        
        if (consecutiveFailures >= maxRetries) {
          throw new Error(`Download failed after ${maxRetries} consecutive chunk failures: ${error.message}`);
        }
        
        // Back off and try again
        const retryDelay = baseDelay * Math.pow(2, consecutiveFailures - 1);
        console.log(`Backing off for ${retryDelay}ms before retry`);
        await sleep(retryDelay);
      }
    }

    // Close the file
    await fileStreamSaver.close();
    console.log('Download completed successfully');
    return true;

  } catch (error) {
    console.error('Fatal download error:', error);
    if (fileStreamSaver?.writableStream) {
      try {
        await fileStreamSaver.close();
      } catch (closeError) {
        console.error('Error closing file after failure:', closeError);
      }
    }
    throw error;
  }
};