export interface ILockService {
  acquireLock(resource: string, ttl: number, owner?: string): Promise<any | null>;
  releaseLock(lock: any): Promise<void>;
}

export interface ILockInfo {
  resource: string;
  expiresAt: number;
  owner?: string;
}

export interface ILockServiceFull extends ILockService {
  getLockInfo(resource: string): Promise<ILockInfo | null>;
}
