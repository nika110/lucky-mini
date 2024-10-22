// src/config/redis.ts
import Redis, { Redis as RedisType } from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

class RedisService {
  private static instance: RedisService;
  private client: RedisType;
  private isConnected: boolean = false;

  private constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        // Exponential backoff with max delay of 5 seconds
        const delay = Math.min(times * 50, 5000);
        return delay;
      },
      reconnectOnError: (err: Error) => {
        // Only reconnect on specific errors
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true; // Reconnect on READONLY error
        }
        return false;
      }
    });

    // Connection event handlers
    this.client.on('connect', () => {
      console.log('🚀 Redis client connecting...');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      console.log('✅ Redis client connected and ready');
    });

    this.client.on('error', (err: Error) => {
      this.isConnected = false;
      console.error('❌ Redis client error:', err);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      console.log('🔄 Redis client disconnected');
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Redis client reconnecting...');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public getClient(): RedisType {
    if (!this.isConnected) {
      console.warn('⚠️ Warning: Redis client is not connected');
    }
    return this.client;
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.quit();
        this.isConnected = false;
        console.log('👋 Redis client disconnected gracefully');
      } catch (error) {
        console.error('❌ Error disconnecting Redis client:', error);
        this.client.disconnect(false);
      }
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const ping = await this.client.ping();
      return ping === 'PONG';
    } catch (error) {
      console.error('❌ Redis health check failed:', error);
      return false;
    }
  }

  // Utility wrapper methods for common Redis operations
  public async set(key: string, value: string, expireSeconds?: number): Promise<'OK' | null> {
    try {
      if (expireSeconds) {
        return await this.client.set(key, value, 'EX', expireSeconds);
      }
      return await this.client.set(key, value);
    } catch (error) {
      console.error(`❌ Error setting Redis key ${key}:`, error);
      return null;
    }
  }

  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`❌ Error getting Redis key ${key}:`, error);
      return null;
    }
  }

  public async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error(`❌ Error deleting Redis key ${key}:`, error);
      return 0;
    }
  }

  public async exists(key: string): Promise<number> {
    try {
      return await this.client.exists(key);
    } catch (error) {
      console.error(`❌ Error checking Redis key ${key}:`, error);
      return 0;
    }
  }

  // Method for handling locks (useful for raffle operations)
  public async acquireLock(lockKey: string, ttlSeconds: number): Promise<boolean> {
    try {
      const result = await this.client.set(
        `lock:${lockKey}`,
        'locked',
        'EX',
        ttlSeconds,
        'NX'
      );
      return result === 'OK';
    } catch (error) {
      console.error(`❌ Error acquiring lock ${lockKey}:`, error);
      return false;
    }
  }

  public async releaseLock(lockKey: string): Promise<boolean> {
    try {
      const result = await this.client.del(`lock:${lockKey}`);
      return result === 1;
    } catch (error) {
      console.error(`❌ Error releasing lock ${lockKey}:`, error);
      return false;
    }
  }
}

// Export a singleton instance
export default RedisService.getInstance();

// Example usage in other files:
/*
import redisService from '../config/redis';

// Get Redis client
const redisClient = redisService.getClient();

// Or use utility methods
await redisService.set('key', 'value', 3600); // Set with 1 hour expiration
const value = await redisService.get('key');

// Use locks for critical operations
const locked = await redisService.acquireLock('raffle:123', 30);
if (locked) {
  try {
    // Perform critical operation
  } finally {
    await redisService.releaseLock('raffle:123');
  }
}
*/