from typing import Optional
from motor.motor_asyncio import AsyncIOMotorCollection
from .user_models import User

from database import Database

class UserRepository:
    @property
    def collection(self) -> AsyncIOMotorCollection:
        return Database.get_db().users

    async def create_user(self, user: User) -> bool:
        result = await self.collection.insert_one(user.dict())
        return bool(result.inserted_id)

    async def get_user_by_telegram_id(self, telegram_id: str) -> Optional[User]:
        user_dict = await self.collection.find_one({"telegram_id": telegram_id})
        return User(**user_dict) if user_dict else None

    async def get_user_by_wallet(self, ton_public_key: str) -> Optional[User]:
        user_dict = await self.collection.find_one({"ton_public_key": ton_public_key})
        return User(**user_dict) if user_dict else None

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        user_dict = await self.collection.find_one({"id": user_id})
        return User(**user_dict) if user_dict else None

    async def telegram_id_exists(self, telegram_id: str) -> bool:
        return bool(await self.collection.find_one({"telegram_id": telegram_id}))

    async def update_user(self, user: User) -> bool:
        result = await self.collection.update_one(
            {"id": user.id},
            {"$set": user.dict()}
        )
        return result.modified_count > 0

