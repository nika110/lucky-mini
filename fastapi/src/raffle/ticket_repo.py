from typing import List
from motor.motor_asyncio import AsyncIOMotorCollection
from database import Database
from .raffle_models import Ticket

class TicketRepository:
    @property
    def collection(self) -> AsyncIOMotorCollection:
        return Database.get_db().tickets

    async def create_ticket(self, ticket: Ticket) -> str:
        result = await self.collection.insert_one(ticket.dict())
        return str(result.inserted_id)

    async def get_raffle_tickets(self, raffle_id: str) -> List[Ticket]:
        cursor = self.collection.find({"raffle_id": raffle_id})
        return [Ticket(**ticket) for ticket in await cursor.to_list(None)]

    async def get_user_tickets(self, user_id: str) -> List[Ticket]:
        cursor = self.collection.find({"user_id": user_id}).sort("purchase_time", -1)
        tickets = await cursor.to_list(None)
        return [Ticket(**ticket) for ticket in tickets]