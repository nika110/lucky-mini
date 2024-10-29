from beanie import Document
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Raffle(Document):
    title: str
    description: Optional[str]
    max_participants: int
    current_participants: List[str] = []
    status: str = "active"  # active, completed, cancelled
    winner: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    ends_at: Optional[datetime]

    class Settings:
        name = "raffles"
        
    @property
    def participants_count(self) -> int:
        return len(self.current_participants)

    @property
    def is_full(self) -> bool:
        return self.participants_count >= self.max_participants

class RaffleCreate(BaseModel):
    title: str
    description: Optional[str] = None
    max_participants: int
    ends_at: Optional[datetime] = None