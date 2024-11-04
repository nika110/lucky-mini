from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

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


    #status: "won"| "lost" | "pending" = "pending"


# class Wallet(BaseModel):
#     wallet_type:
#
# class User(BaseModel):
#     telegram_id:str
