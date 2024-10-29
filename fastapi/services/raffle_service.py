from models.raffle import Raffle, RaffleCreate
from config.database import db
import json
from datetime import datetime, timedelta

class RaffleService:
    CACHE_TTL = 300  # 5 minutes

    @staticmethod
    async def create_raffle(raffle_data: RaffleCreate) -> Raffle:
        raffle = Raffle(**raffle_data.dict())
        await raffle.insert()
        
        # Cache the raffle data
        cache_key = f"raffle:{raffle.id}"
        db.redis_client.setex(
            cache_key,
            RaffleService.CACHE_TTL,
            json.dumps(raffle.dict())
        )
        
        return raffle

    @staticmethod
    async def get_raffle(raffle_id: str) -> Raffle:
        # Try to get from cache first
        cache_key = f"raffle:{raffle_id}"
        cached_raffle = db.redis_client.get(cache_key)
        
        if cached_raffle:
            return Raffle.parse_raw(cached_raffle)
        
        # If not in cache, get from database
        raffle = await Raffle.get(raffle_id)
        if raffle:
            # Update cache
            db.redis_client.setex(
                cache_key,
                RaffleService.CACHE_TTL,
                json.dumps(raffle.dict())
            )
        
        return raffle

    @staticmethod
    async def join_raffle(raffle_id: str, participant_id: str) -> bool:
        raffle = await Raffle.get(raffle_id)
        if not raffle or raffle.is_full or raffle.status != "active":
            return False

        # Add participant
        if participant_id not in raffle.current_participants:
            raffle.current_participants.append(participant_id)
            await raffle.save()

            # Invalidate cache
            cache_key = f"raffle:{raffle_id}"
            db.redis_client.delete(cache_key)

            return True
        return False

    @staticmethod
    async def list_active_raffles() -> list[Raffle]:
        return await Raffle.find({"status": "active"}).to_list()