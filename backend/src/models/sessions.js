// backend/src/models/session.js
import Redis from 'ioredis';
import config from '../config';

const redis = new Redis(config.redis.url);

export class SessionStore {
  static async create(session) {
    const key = `download:session:${session.token}`;
    await redis.hmset(key, session);
    await redis.expire(key, config.redis.sessionTTL);
    return session;
  }

  static async get(token) {
    const key = `download:session:${token}`;
    const session = await redis.hgetall(key);
    return Object.keys(session).length ? session : null;
  }

  static async update(token, updates) {
    const key = `download:session:${token}`;
    await redis.hmset(key, updates);
  }

  static async delete(token) {
    const key = `download:session:${token}`;
    await redis.del(key);
  }
}