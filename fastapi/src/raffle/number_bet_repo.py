from typing import List
from motor.motor_asyncio import AsyncIOMotorCollection
from database import Database
from .raffle_models import NumberBet

class NumberBetRepository:
    @property
    def collection(self) -> AsyncIOMotorCollection:
        return Database.get_db().number_bets
    
    async def create_number_bet(self, number_bet: NumberBet) -> str:
        result = await self.collection.insert_one(number_bet.dict())
        return str(result.inserted_id)



