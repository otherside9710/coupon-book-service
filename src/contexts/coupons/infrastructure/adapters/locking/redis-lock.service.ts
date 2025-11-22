import Redis from 'ioredis';
import { Injectable } from '@nestjs/common';
import { ILockServiceFull, ILockInfo } from '../../../domain/contracts/lock.service.port';

@Injectable()
export class RedisLockService implements ILockServiceFull {
  private client: Redis;

  constructor() {
    const host = process.env.REDIS_HOST || '127.0.0.1';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    this.client = new Redis({ host, port });
  }

  async acquireLock(resource: string, ttl: number, owner?: string): Promise<any | null> {
    const token = owner || `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ok = await this.client.set(resource, token, 'PX', ttl, 'NX');
    if (ok !== 'OK') return null;
    const expiresAt = Date.now() + ttl;
    return { resource, owner: token, expiresAt };
  }

  async getLockInfo(resource: string): Promise<ILockInfo | null> {
    const val = await this.client.get(resource);
    if (!val) return null;
    const ttl = await this.client.pttl(resource);
    const expiresAt = ttl > 0 ? Date.now() + ttl : Date.now();
    return { resource, owner: val, expiresAt };
  }

  async releaseLock(lockOrResource: any): Promise<void> {
    const key = typeof lockOrResource === 'string' ? lockOrResource : lockOrResource?.resource;
    if (!key) return;
    const token = typeof lockOrResource === 'string' ? null : lockOrResource?.owner || null;
    if (token) {
      const lua = `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`;
      try {
        await this.client.eval(lua, 1, key, token);
      } catch (e) {
        await this.client.del(key);
      }
    } else {
      await this.client.del(key);
    }
  }
}
