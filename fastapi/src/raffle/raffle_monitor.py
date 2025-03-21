# raffle_monitor.py
import asyncio
from datetime import datetime
import logging

from .raffle_31_repo import Raffle31Repository
from .raffle_models import Raffle
from .raffle_repo import RaffleRepository
from .winner_service import WinnerService
from database import Database
from .websocket_server import WebSocketManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RaffleMonitor:
    def __init__(self):
        self.raffle_repo = RaffleRepository()
        self.winner_service = WinnerService()
        self.raffle_31_repo = Raffle31Repository()
        self.websocket_manager = WebSocketManager()
        self.check_interval = 30  # seconds
        self.processing = False  # Lock to prevent concurrent processing

    async def process_ended_raffle(self, raffle: Raffle):
        if self.processing:
            logger.info("Already processing a raffle, skipping...")
            return

        try:
            self.processing = True
            # Get total pool from Redis
            total_pool = float(await Database.redis.hget(f"raffle:{raffle.id}", "total_pool") or 0)

            winners = await self.winner_service.select_winners(raffle.id)

            winners_dict = [
                {
                    "user_id": winner.user_id,
                    "amount": winner.amount,
                    "position": winner.position
                }
                for winner in winners
            ]

            await self.raffle_repo.request_winners_to_backend(winners_dict)

            # Update raffle with winners
            await self.raffle_repo.update_winners(raffle.id, winners, total_pool)


            logger.info(f"Successfully processed ended raffle {raffle.id} with {len(winners)} winners")

        except Exception as e:
            logger.error(f"Error processing ended raffle {raffle.id}: {str(e)}")
        finally:
            self.processing = False

    async def check_ended_raffles(self):
        try:
            current_time = datetime.utcnow()
            ended_raffles = await self.raffle_repo.get_ended_raffles(current_time)

            ended_31_raffle = await self.raffle_31_repo.get_ended_raffle(current_time)

            for raffle_31 in ended_31_raffle:
                #process ended raffle 31
                pass

            for raffle in ended_raffles:
                # Process only one raffle at a time
                await self.process_ended_raffle(raffle)
                break  # Only process the first ended raffle

        except Exception as e:
            logger.error(f"Error checking ended raffles: {str(e)}")

    async def monitor_raffles(self):
        logger.info("Starting raffle monitor service...")
        while True:
            await self.check_ended_raffles()
            await asyncio.sleep(self.check_interval)