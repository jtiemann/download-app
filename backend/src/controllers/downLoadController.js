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
      const session = await sessionService.createSession({ fileId });
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
    const startByte = parseInt(req.headers.range?.split('=')?.[1] || '0');

    try {
      const session = await sessionService.validateSession(token);
      if (!session) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }

      const fileInfo = await downloadService.getFileInfo(session.fileId);
      const stream = await downloadService.createReadStream(session.fileId, startByte);
      
      // Set headers for chunked download
      res.writeHead(206, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileInfo.name}"`,
        'Content-Range': `bytes ${startByte}-${fileInfo.size - 1}/${fileInfo.size}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache'
      });

      stream.pipe(res);

      // Handle errors in the stream
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream failed', details: error.message });
        }
      });

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