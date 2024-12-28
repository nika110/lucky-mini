from datetime import datetime
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorCollection
from database import Database
from .raffle_models import NumberRaffle
import logging
import aiohttp


logger = logging.getLogger(__name__)

class Raffle31Repository:
    @property
    def collection(self) -> AsyncIOMotorCollection:
        return Database.get_db().raffle31

    async def get_current_raffle31(self) -> Optional[NumberRaffle]:
        raffle_dict = await self.collection.find_one(
            {"is_active": True},
        )
        return NumberRaffle(**raffle_dict) if raffle_dict else None


    async def create_raffle(self, raffle: NumberRaffle) -> str:
        result = await self.collection.insert_one(raffle.dict())
        return str(result.inserted_id)


    async def get_ended_raffle(self, current_time: datetime) -> List[NumberRaffle]:
        cursor = self.collection.find({
            "end_time": {"$lt": current_time},
            "is_active": True,
            "winners": None
        })
        return [NumberRaffle(**raffle) for raffle in await cursor.to_list(None)]

