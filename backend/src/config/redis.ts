// src/config/redis.ts
import Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL as string);

export default redisClient;