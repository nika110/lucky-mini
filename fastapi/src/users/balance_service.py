from motor.motor_asyncio import AsyncIOMotorCollection
from database import Database
from .user_models import User
from .user_repo import UserRepository

import logging
from typing import Optional

logger = logging.getLogger(__name__)

class BalanceService:
    @property
    def collection(self) -> AsyncIOMotorCollection:
        return UserRepository().collection

    async def get_user_balance(self, user_id: str) -> Optional[User]:
        try:
            user_dict = await self.collection.find_one({"id": user_id})
            if not user_dict:
                logger.info(f"User not found in DB: {user_id}")
                return None
            return User(**user_dict)
        except Exception as e:
            logger.error(f"Error getting user from DB: {e}")
            return None

    async def update_user_balance(self, user_id: str, balance: float) -> bool:
        try:
            result = await self.collection.update_one(
                {"id": user_id},
                {"$set": {"balance": balance}}
            )
            success = result.modified_count > 0
            if not success:
                logger.error(f"Failed to update balance for user {user_id}")
            return success
        except Exception as e:
            logger.error(f"Error updating user balance: {e}")
            return False



