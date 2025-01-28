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
        try:
            raffle_dict = await self.collection.find_one(
                {"is_active": True},
            )
            if not raffle_dict:
                return None

            if raffle_dict.get('number_pools') is None:
                raffle_dict['number_pools'] = {}

            return NumberRaffle(**raffle_dict)
        except Exception as e:
            logger.error(f"Error fetching current raffle31: {str(e)}")
            raise

    async def create_raffle(self, raffle: NumberRaffle) -> str:
        try:
            if raffle.number_pools is None:
                raffle.number_pools = {}

            result = await self.collection.insert_one(raffle.dict())
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Error creating raffle: {str(e)}")
            raise

    async def get_ended_raffle(self, current_time: datetime) -> List[NumberRaffle]:
        try:
            cursor = self.collection.find({
                "end_time": {"$lt": current_time},
                "is_active": True,
                "winners": None
            })

            raffles = []
            async for raffle_dict in cursor:
                if raffle_dict.get('number_pools') is None:
                    raffle_dict['number_pools'] = {}
                raffles.append(NumberRaffle(**raffle_dict))

            return raffles
        except Exception as e:
            logger.error(f"Error fetching ended raffles: {str(e)}")
            raise