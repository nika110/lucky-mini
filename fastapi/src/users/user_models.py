from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional

class Referral(BaseModel):
    telegram_id: str
    xp: int

class User(BaseModel):
    id: str
    telegram_id: str
    ton_public_key: str
    balance: int
    created_at: datetime
    xp: int
    referred_by: Optional[str]
    referrals: Optional[list[Referral]] = []
    last_login: Optional[datetime] = None
    login_streak: int = 0
    last_streak_update: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: int(dt.timestamp())
        }