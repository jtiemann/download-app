import { downloadService } from '../services/downloadService.js';
import { sessionService } from '../services/sessionService.js';

export const downloadController = {
  async initDownload(req, res) {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'fileId is required' });
    }

    try {
      console.log('Getting file info for:', fileId);
      const fileInfo = await downloadService.getFileInfo(fileId);
      console.log('File info:', fileInfo);
      
      console.log('Creating session');
      const session = await sessionService.createSession({ 
        fileId,
        fileSize: fileInfo.size 
      });
      console.log('Session created:', session);

      res.json({
        token: session.token,
        expiresAt: session.expiresAt,
        fileName: fileInfo.name,
        fileSize: fileInfo.size
      });
    } catch (error) {
      console.error('Download initialization failed:', error);
      res.status(500).json({ 
        error: 'Failed to initialize download',
        details: error.message
      });
    }
  },

  async downloadChunk(req, res) {
    const token = req.headers['x-download-token'];
    const range = req.headers.range;

    if (!range) {
      return res.status(400).json({ error: 'Range header is required' });
    }

    try {
      const session = await sessionService.validateSession(token);
      if (!session) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }

      const [startStr, endStr] = range.replace('bytes=', '').split('-');
      const start = parseInt(startStr);
      const end = endStr ? parseInt(endStr) : session.fileSize - 1;
      
      const contentLength = end - start + 1;

      // Set headers for chunked download
      res.writeHead(206, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': contentLength,
        'Content-Range': `bytes ${start}-${end}/${session.fileSize}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache'
      });

      const stream = await downloadService.createReadStream(session.fileId, start, end);
      
      // Handle stream errors
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream failed', details: error.message });
        }
      });

      // Pipe the stream
      stream.pipe(res);

    } catch (error) {
      console.error('Download chunk failed:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Download failed',
          details: error.message
        });
      }
    }
  }
};