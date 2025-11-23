// Mock ioredis to avoid network calls
jest.mock('ioredis', () => ({
  default: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    get: jest.fn(),
    pttl: jest.fn(),
    eval: jest.fn(),
    del: jest.fn(),
  })),
}));

import { RedisLockService } from '@/contexts/coupons/infrastructure/adapters/locking/redis-lock.service';

describe('RedisLockService', () => {
  let service: RedisLockService;

  beforeEach(() => {
    jest.resetModules();
    service = new RedisLockService();
  });

  it('acquireLock returns lock info when set returns OK', async () => {
    const client = (service as any).client as any;
    client.set.mockResolvedValue('OK');

    const lock = await service.acquireLock('res1', 1000, 'owner1');
    expect(lock).not.toBeNull();
    expect(lock.resource).toBe('res1');
    expect(lock.owner).toBe('owner1');
    expect(client.set).toHaveBeenCalledWith('res1', 'owner1', 'PX', 1000, 'NX');
  });

  it('acquireLock returns null when set not OK', async () => {
    const client = (service as any).client as any;
    client.set.mockResolvedValue(null);

    const lock = await service.acquireLock('res2', 500);
    expect(lock).toBeNull();
  });

  it('getLockInfo returns null when key missing', async () => {
    const client = (service as any).client as any;
    client.get.mockResolvedValue(null);

    const info = await service.getLockInfo('missing');
    expect(info).toBeNull();
  });

  it('getLockInfo returns info when key present', async () => {
    const client = (service as any).client as any;
    client.get.mockResolvedValue('token123');
    client.pttl.mockResolvedValue(2000);

    const now = Date.now();
    const info = await service.getLockInfo('res3');
    expect(info).not.toBeNull();
    expect(info?.owner).toBe('token123');
    expect(info?.resource).toBe('res3');
    expect(info?.expiresAt).toBeGreaterThanOrEqual(now);
  });

  it('releaseLock with owner uses eval and does not call del when eval succeeds', async () => {
    const client = (service as any).client as any;
    client.eval.mockResolvedValue(1);

    const lock = { resource: 'res4', owner: 'tok' };
    await service.releaseLock(lock);
    expect(client.eval).toHaveBeenCalled();
    expect(client.del).not.toHaveBeenCalled();
  });

  it('releaseLock falls back to del when eval throws', async () => {
    const client = (service as any).client as any;
    client.eval.mockRejectedValue(new Error('fail'));
    client.del.mockResolvedValue(1);

    const lock = { resource: 'res5', owner: 'tok2' };
    await service.releaseLock(lock);
    expect(client.eval).toHaveBeenCalled();
    expect(client.del).toHaveBeenCalledWith('res5');
  });

  it('releaseLock with resource string calls del', async () => {
    const client = (service as any).client as any;
    client.del.mockResolvedValue(1);

    await service.releaseLock('res6');
    expect(client.del).toHaveBeenCalledWith('res6');
  });

  it('releaseLock with invalid input does nothing', async () => {
    const client = (service as any).client as any;
    client.del.mockClear();
    client.eval.mockClear();

    await service.releaseLock(undefined as any);
    expect(client.del).not.toHaveBeenCalled();
    expect(client.eval).not.toHaveBeenCalled();
  });
});
