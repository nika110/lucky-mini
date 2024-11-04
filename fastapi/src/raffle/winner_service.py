# winner_service.py
import random
import asyncio
from typing import List
import logging
from config import settings
from .raffle_models import Winner
from .ticket_repo import TicketRepository
from .raffle_repo import RaffleRepository
from .raffle_service import RaffleService
from .websocket_server import WebSocketManager

logger = logging.getLogger(__name__)

class WinnerService:
    def __init__(self):
        self.ticket_repo = TicketRepository()
        self.raffle_repo = RaffleRepository()
        self.raffle_service = RaffleService()
        self.websocket_manager = WebSocketManager()

    async def select_winners(self, raffle_id: str) -> List[Winner]:
        tickets = await self.ticket_repo.get_raffle_tickets(raffle_id)
        await self.raffle_repo.set_inactive(raffle_id)

        if not tickets:
            winners = []
        else:
            total_pool = len(tickets)
            winners_count = min(5, total_pool)

            random.shuffle(tickets)
            selected_tickets = tickets[:winners_count]

            winners = []
            if winners_count > 0:
                main_prize = total_pool * settings.MAIN_WINNER_PERCENTAGE
                remaining = total_pool * settings.SECONDARY_WINNERS_PERCENTAGE
                secondary_prize = remaining / (winners_count - 1) if winners_count > 1 else 0

                amounts = [main_prize] + [secondary_prize] * (winners_count - 1)

                for idx, (ticket, amount) in enumerate(zip(selected_tickets, amounts)):
                    winners.append(Winner(
                        user_id=ticket.user_id,
                        amount=amount,
                        position=idx + 1
                    ))

        # Send the raffle ended message first
        await self.websocket_manager.broadcast_update({
            "type": "raffle_ended",
            "raffle_id": raffle_id,
            "winners": [winner.dict() for winner in winners],
            "total_pool": len(tickets) if tickets else 0
        })

        logger.info(f"Raffle {raffle_id} ended with {len(winners)} winners. Waiting 20 seconds before starting new raffle...")

        # Wait for 20 seconds
        await asyncio.sleep(20)

        # Create new raffle after delay
        new_raffle = await self.raffle_service._create_new_raffle()
        logger.info(f"Created new raffle {new_raffle.id} after delay")

        return winners