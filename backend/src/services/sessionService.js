import crypto from 'crypto';
import Redis from 'ioredis';
import config from '../config/index.js';

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port
});

export const sessionService = {
  async createSession({ fileId }) {
    const token = crypto.randomBytes(32).toString('hex');
    const session = {
      token,
      fileId,
      createdAt: Date.now(),
      expiresAt: Date.now() + (config.redis.sessionTTL * 1000)
    };

    await redis.hmset(`download:${token}`, session);
    await redis.expire(`download:${token}`, config.redis.sessionTTL);

    return session;
  },

  async validateSession(token) {
    if (!token) return null;

    const session = await redis.hgetall(`download:${token}`);
    if (!session || !session.fileId) return null;

    const now = Date.now();
    if (now > parseInt(session.expiresAt)) {
      await redis.del(`download:${token}`);
      return null;
    }

    return session;
  },

  async updateSession(token, updates) {
    await redis.hmset(`download:${token}`, updates);
  }
};