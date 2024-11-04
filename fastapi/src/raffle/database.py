from motor.motor_asyncio import AsyncIOMotorClient
from redis import asyncio as aioredis
from .config import settings

class Database:
    client: AsyncIOMotorClient = None
    redis = None

    @classmethod
    async def connect_db(cls):
        cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
        cls.redis = await aioredis.from_url(settings.REDIS_URL)

    @classmethod
    async def close_db(cls):
        if cls.client:
            cls.client.close()
        if cls.redis:
            await cls.redis.close()

    @classmethod
    def get_db(cls):
        return cls.client.raffle_db