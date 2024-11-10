from datetime import datetime
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorCollection
from database import Database
from .raffle_models import Raffle, Winner
import logging


logger = logging.getLogger(__name__)

class RaffleRepository:
    @property
    def collection(self) -> AsyncIOMotorCollection:
        return Database.get_db().raffles

    async def get_current_raffle(self) -> Optional[Raffle]:
        raffle_dict = await self.collection.find_one(
            {"is_active": True},
        )
        return Raffle(**raffle_dict) if raffle_dict else None

    async def create_raffle(self, raffle: Raffle) -> str:
        result = await self.collection.insert_one(raffle.dict())
        return str(result.inserted_id)

    async def update_winners(self, raffle_id: str, winners: List[Winner], total_pool) -> bool:
        result = await self.collection.update_one(
            {"id": raffle_id},
            {
                "$set": {
                    "winners": [w.dict() for w in winners],
                    "total_pool": total_pool,
                }
            }
        )
        return result.modified_count > 0

    async def set_inactive(self, raffle_id: str) -> bool:
        result = await self.collection.update_one(
            {"id": raffle_id},
            {"$set": {"is_active": False}}
        )
        return result.modified_count > 0

    async def get_ended_raffles(self, current_time: datetime) -> List[Raffle]:
        cursor = self.collection.find({
            "end_time": {"$lt": current_time},
            "is_active": True,
            "winners": None
        })
        return [Raffle(**raffle) for raffle in await cursor.to_list(None)]

    async def get_last_completed_raffle(self) -> Optional[Raffle]:
        try:
            # Find the most recent completed raffle
            cursor = self.collection.find({
                "is_active": False
            }).sort("end_time", -1).limit(1)  # Added sort by end_time

            logger.info("Querying last completed raffle")  # Fixed logging syntax

            results = await cursor.to_list(None)

            if not results:
                logger.info("No completed raffles found")
                return None

            raffle_dict = results[0]
            logger.info(f"Found raffle with ID: {raffle_dict.get('id')}")

            return Raffle(**raffle_dict)

        except Exception as e:
            logger.error(f"Error getting last completed raffle: {e}")  # Added error logging
            return None