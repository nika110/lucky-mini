from datetime import datetime, timedelta
import uuid
from typing import List, Tuple
import logging
from config import settings
from database import Database

from .number_bet_repo import NumberBetRepository
from .raffle_models import NumberRaffle, NumberBet
from .raffle_31_repo import Raffle31Repository
from .websocket_server import WebSocketManager, BufferedWebSocketManager

logger = logging.getLogger(__name__)

class Raffle31Service:
    def __init__(self):
        self.raffle_repo = Raffle31Repository()
        self.ticket_repo = NumberBetRepository()
        self.websocket_manager = WebSocketManager()
        self.buffered_websocket_manager = BufferedWebSocketManager()



    async def get_current_raffle(self) -> NumberRaffle:
        current_raffle = await self.raffle_repo.get_current_raffle31()
        return current_raffle


    async def _create_new_31_raffle(self) -> NumberRaffle:
        raffle = NumberRaffle(
            id=str(uuid.uuid4()),
            start_time=datetime.utcnow(),
            end_time=datetime.utcnow() + timedelta(minutes=settings.RAFFLE_DURATION_MINUTES),
            is_active=True
        )

        try:
            await self.raffle_repo.create_raffle(raffle)


            #append redis

            await self.websocket_manager.broadcast_update({
                "type": "new_raffle_31",
                "raffle_id": raffle.id,
                "start_time": raffle.start_time.isoformat(),
                "end_time": raffle.end_time.isoformat()
            })

            logger.info(f"Created new 31 raffle {raffle.id}, ending at {raffle.end_time}")
            return raffle

        except Exception as e:
            logger.error(f"Error creating new raffle: {str(e)}")
            raise


    async def purchase_tickets(self, user_id: str, ticket_count: int, to_number:int) -> Tuple[List[str], str]:
        current_raffle = await self.get_current_raffle()
        ticket_numbers = []

        logger.info(f"Purchasing {ticket_count} tickets for user {user_id}")

        for _ in range(ticket_count):
            ticket_number = str(uuid.uuid4())
            ticket = NumberBet(
                user_id=user_id,
                raffle_id=current_raffle.id,
                number=to_number,
                amount=ticket_count
            )
            await self.ticket_repo.create_number_bet(ticket)
            ticket_numbers.append(ticket_number)

        logger.info(f"Adding {ticket_count} tickets to buffer for raffle {current_raffle.id}")
        await self.buffered_websocket_manager.add_to_buffer(current_raffle.id, ticket_count)

        return ticket_numbers, current_raffle.id

    async def get_total_pool(self, raffle_id: str) -> dict:
        return {"5":10}



