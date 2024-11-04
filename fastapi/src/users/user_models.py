from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional

class User(BaseModel):
    id: str
    telegram_id: str
    ton_public_key: str
    balance: float

    created_at: datetime
    xp: int
    referred_by: Optional[str]