from datetime import datetime, timedelta
import uuid
from typing import List, Tuple
import logging
from config import settings
from database import Database
from .raffle_models import Raffle, Ticket
from .raffle_repo import RaffleRepository
from .ticket_repo import TicketRepository
from .websocket_server import WebSocketManager

logger = logging.getLogger(__name__)

class RaffleService:
    def __init__(self):
        self.raffle_repo = RaffleRepository()
        self.ticket_repo = TicketRepository()
        self.websocket_manager = WebSocketManager()

    async def get_current_raffle(self) -> Raffle:
        current_raffle = await self.raffle_repo.get_current_raffle()
        return current_raffle

    async def get_total_pool(self, raffle_id: str) -> float:
        return float(await Database.redis.hget(f"raffle:{raffle_id}", "total_pool") or 0)

    async def _create_new_raffle(self) -> Raffle:
        raffle = Raffle(
            id=str(uuid.uuid4()),
            start_time=datetime.utcnow(),
            end_time=datetime.utcnow() + timedelta(minutes=settings.RAFFLE_DURATION_MINUTES),
            is_active=True
        )

        try:
            await self.raffle_repo.create_raffle(raffle)
            await Database.redis.hset(f"raffle:{raffle.id}", "total_pool", 0)

            await self.websocket_manager.broadcast_update({
                "type": "new_raffle",
                "raffle_id": raffle.id,
                "start_time": raffle.start_time.isoformat(),
                "end_time": raffle.end_time.isoformat()
            })

            logger.info(f"Created new raffle {raffle.id}, ending at {raffle.end_time}")
            return raffle

        except Exception as e:
            logger.error(f"Error creating new raffle: {str(e)}")
            raise

    async def purchase_real_tickets(self, user_id: str, ticket_count: int) -> Tuple[List[str], str]:
        pass


    async def purchase_tickets(self, user_id: str, ticket_count: int) -> Tuple[List[str], str]:
        current_raffle = await self.get_current_raffle()
        ticket_numbers = []

        for _ in range(ticket_count):
            ticket_number = str(uuid.uuid4())
            ticket = Ticket(
                raffle_id=current_raffle.id,
                ticket_number=ticket_number,
                user_id=user_id,
                purchase_time=datetime.utcnow()
            )
            await self.ticket_repo.create_ticket(ticket)

            # Update Redis and broadcast the new pool size
            new_pool = await Database.redis.hincrby(f"raffle:{current_raffle.id}", "total_pool", 1)
            await self.websocket_manager.broadcast_update({
                "type": "pool_update",
                "raffle_id": current_raffle.id,
                "total_pool": new_pool
            })

            ticket_numbers.append(ticket_number)

        return ticket_numbers, current_raffle.id

    async def get_last_completed_raffle(self):
        logger.info("Getting last completed raffle from service")
        raffle = await self.raffle_repo.get_last_completed_raffle()
        if raffle:
            logger.info(f"Found raffle with ID: {raffle.id}")
        else:
            logger.info("No raffle found")
        return raffle