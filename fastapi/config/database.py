import os
from motor.motor_asyncio import AsyncIOMotorClient
from redis import Redis
from beanie import init_beanie
from models.raffle import Raffle

class DatabaseConfig:
    def __init__(self):
        self.mongodb_uri = os.getenv("MONGODB_URI", "mongodb://mongodb:27017/raffle_app")
        self.redis_url = os.getenv("REDIS_URL", "redis://redis:6379")
        self.mongodb_client = None
        self.redis_client = None

    async def connect_mongodb(self):
        try:
            self.mongodb_client = AsyncIOMotorClient(self.mongodb_uri)
            # Initialize Beanie with the MongoDB client
            db = self.mongodb_client.get_default_database()
            await init_beanie(database=db, document_models=[Raffle])
            print(" MongoDB connected successfully")
        except Exception as e:
            print(f" MongoDB connection error: {e}")
            raise e

    def connect_redis(self):
        try:
            redis_params = {
                'decode_responses': True,
                'socket_timeout': 5,
                'retry_on_timeout': True
            }
            self.redis_client = Redis.from_url(self.redis_url, **redis_params)
            self.redis_client.ping()
            print(" Redis connected successfully")
        except Exception as e:
            print(f" Redis connection error: {e}")
            raise e

    async def close_mongodb(self):
        if self.mongodb_client:
            self.mongodb_client.close()
            print(" MongoDB disconnected")

    def close_redis(self):
        if self.redis_client:
            self.redis_client.close()
            print(" Redis disconnected")

    async def health_check(self):
        try:
            # Check MongoDB
            await self.mongodb_client.admin.command('ping')
            # Check Redis
            self.redis_client.ping()
            return True
        except Exception as e:
            print(f" Health check failed: {e}")
            return False

db = DatabaseConfig()