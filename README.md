# Large File Download Application

A robust application designed for handling large file downloads (up to 500GB) with chunked streaming, resume capability, and progress tracking.

## Features

- Chunked file downloading with configurable chunk sizes
- Direct-to-disk streaming using File System Access API
- Progress tracking and status updates
- Automatic retry with exponential backoff
- Rate limiting protection
- Redis-based session management
- Support for large files (tested up to 500GB)
- Download pause/resume capability
- Error handling and recovery

## Prerequisites

- Node.js (v18 or higher)
- Redis server
- Modern browser with File System Access API support

## Project Structure

```
download-app/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Helper functions
│   ├── storage/           # File storage directory
│   └── logs/             # Application logs
└── frontend/
    ├── src/
    │   ├── components/    # React components
    │   ├── services/      # API and download services
    │   └── hooks/        # Custom React hooks
    └── public/           # Static assets
```

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd download-app
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Start Redis server:
```bash
# Using Docker
docker run --name download-redis -p 6379:6379 -d redis

# Or use your system's Redis service
```

5. Configure environment variables:
```bash
# In backend/.env
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
NODE_ENV=development
FILE_STORAGE_PATH=/path/to/storage
```

## Usage

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Access the application at `http://localhost:3001`

## API Endpoints

### Initialize Download
```http
POST /api/downloads/init
Content-Type: application/json

{
  "fileId": "filename.ext"
}
```

### Download Chunk
```http
GET /api/downloads/chunk
Headers:
  x-download-token: [session-token]
  range: bytes=0-1048575
```

## Configuration Options

### Backend
- `chunkSize`: Default chunk size (default: 1MB)
- `maxConcurrent`: Maximum concurrent downloads (default: 3)
- `sessionTTL`: Download session lifetime (default: 24 hours)

### Frontend
- `chunkSize`: Size of each download chunk
- `maxRetries`: Maximum retry attempts per chunk
- `baseDelay`: Base delay for retry backoff

## Technical Details

### Chunked Download Process
1. Client initializes download and receives a session token
2. File is downloaded in configurable chunks
3. Chunks are written directly to disk using File System Access API
4. Progress is tracked and reported to the UI
5. Failed chunks are automatically retried with exponential backoff

### Error Handling
- Rate limiting with customizable thresholds
- Automatic retry for failed chunks
- Session management for download resumption
- Proper cleanup on failures

### Performance Optimization
- Configurable chunk sizes
- Direct-to-disk streaming
- Memory usage optimization
- Concurrent download limiting

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Linting
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## Troubleshooting

### Common Issues

1. **Rate Limiting**
   - Increase the rate limit thresholds in `backend/src/server.js`
   - Adjust the chunk size in the frontend configuration

2. **Memory Issues**
   - Decrease the chunk size
   - Adjust the garbage collection settings
   - Monitor Redis memory usage

3. **File Access Issues**
   - Check storage directory permissions
   - Verify file existence and readability
   - Check Redis connection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security

- All file paths are sanitized to prevent directory traversal
- Rate limiting prevents DoS attacks
- Session tokens are cryptographically secure
- Input validation on all endpoints

## Future Improvements

1. Multiple concurrent chunk downloads
2. Adaptive chunk sizing based on network conditions
3. Client-side encryption
4. Download queue management
5. Better progress visualization
6. Network speed monitoring
7. Automatic pause/resume on network issues
8. Improved error reporting

## Support

For support, please open an issue in the repository or contact the development team.
