from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class Winner(BaseModel):
    user_id: str
    amount: float
    position: int

class Raffle(BaseModel):
    id: str
    start_time: datetime
    end_time: datetime
    total_pool: float = 0
    winners: Optional[List[Winner]] = None
    is_active: bool = True

class Ticket(BaseModel):
    raffle_id: str
    ticket_number: str
    user_id: str
    purchase_time: datetime

class NumberWinner(BaseModel):
    user_id: str
    amount: float

class NumberRaffle(BaseModel):
    id: str
    start_time: datetime
    end_time: datetime
    number_pools: Dict[str, float] = Field(default_factory=dict)
    winners: Optional[List[NumberWinner]] = None
    is_active: bool = True

class NumberBet(BaseModel):
    user_id:str
    raffle_id: str
    number: int
    amount: float
    purchase_time: datetime


# class Wallet(BaseModel):
#     wallet_type:
#
# class User(BaseModel):
#     telegram_id:str
