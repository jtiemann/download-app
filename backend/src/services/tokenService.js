// backend/src/services/tokenService.js
import crypto from 'crypto';

export const tokenService = {
  generate: () => crypto.randomBytes(32).toString('hex'),
  
  createSession: ({ fileId, userId }) => ({
    token: tokenService.generate(),
    fileId,
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + (config.redis.sessionTTL * 1000),
    bytesDownloaded: 0,
    status: 'active'
  }),

  validate: session => 
    session && Date.now() <= parseInt(session.expiresAt)
}