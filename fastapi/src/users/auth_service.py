# users/auth_service.py
import json
from urllib.parse import unquote, parse_qsl

import jwt
from datetime import datetime, timedelta
import uuid
from typing import Optional, Tuple, Dict
from .user_models import User
from .user_repo import UserRepository
from config import settings
import hmac
import hashlib
import logging
from raffle.ticket_repo import TicketRepository

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.user_repo = UserRepository()
        self.ticket_repo = TicketRepository()

        self.settings=settings



        self.secret_key = hmac.new(
                "WebAppData".encode(),
                settings.TELEGRAM_BOT_TOKEN.encode(),
                hashlib.sha256
            ).digest()

    def verify_telegram_auth(self, init_data: str) -> Optional[Dict]:
        try:
            # Split and create key-value pairs, excluding hash
            data_check_array = [
                chunk.split("=")
                for chunk in init_data.split("&")
                if not chunk.startswith("hash=")
            ]

            # Sort by keys and create data check string with unquoted values
            data_check_string = "\n".join(
                f"{rec[0]}={unquote(rec[1])}"
                for rec in sorted(data_check_array, key=lambda x: x[0])
            )

            # Get hash from original data
            hash_str = dict(chunk.split("=") for chunk in init_data.split("&")).get("hash")
            if not hash_str:
                return None

            # Generate secret key

            # Calculate hash
            calculated_hash = hmac.new(
                self.secret_key,
                data_check_string.encode(),
                hashlib.sha256
            ).hexdigest()

            logger.debug(f"Data check string: {data_check_string}")
            logger.debug(f"Calculated hash: {calculated_hash}")
            logger.debug(f"Received hash: {hash_str}")

            if calculated_hash != hash_str:
                return None

            # Parse user data if validation successful
            parsed_data = dict(parse_qsl(init_data))
            if 'user' in parsed_data:
                return json.loads(unquote(parsed_data['user']))

            return None

        except Exception as e:
            logger.error(f"Verification error: {str(e)}")
            return None
    async def authenticate_telegram(
            self,
            telegram_id: str,
            telegram_auth_code: str,
            referred_by: Optional[str] = None
    ) -> Tuple[User, str]:

        if referred_by:
            referred_by_user = await self.user_repo.get_user_by_telegram_id(referred_by) if referred_by else None
            if not referred_by_user:
                raise ValueError("Invalid referral user")

        auth_data = self.verify_telegram_auth(telegram_auth_code)
        if not auth_data:
            raise ValueError("Invalid Telegram authentication data")

        auth_telegram_id = str(auth_data.get('id'))
        if auth_telegram_id != telegram_id:
            raise ValueError("Telegram ID mismatch")

        user = await self.user_repo.get_user_by_telegram_id(telegram_id)

        if not user:
            user = User(
                id=str(uuid.uuid4()),
                telegram_id=telegram_id,
                ton_public_key="",
                balance=0.0,
                created_at=datetime.utcnow(),
                xp=0,
                referred_by=referred_by,
                referrals=[] #STORE TG_ID
            )
            await self.user_repo.create_user(user)

        token = self.create_token(user)

        return user, token

    def create_token(self, user: User) -> str:
        payload = {
            "user_id": user.id,
            "telegram_id": user.telegram_id,
            "exp": datetime.utcnow() + timedelta(days=settings.JWT_EXPIRATION_DAYS)
        }
        return jwt.encode(
            payload,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )


    async def update_ton_wallet(
            self,
            telegram_id: str,
            ton_public_key: str
    ) -> User:
        tg_id = jwt.decode(telegram_id,
                           settings.JWT_SECRET_KEY,
                           algorithms=[settings.JWT_ALGORITHM])['user_id']
        logger.info(tg_id)
        user = await self.user_repo.get_user_by_id(tg_id)
        if not user:
            raise ValueError("User not found")

        user.ton_public_key = ton_public_key
        await self.user_repo.update_user(user)
        return user

    
    async def validate_token(self, token: str):
        try:
            get_user = await self.user_repo.get_user_from_token(token)
            user = await self.user_repo.get_user_by_id(get_user["user_id"])
            if not user:
                return None, []

            tickets = await self.ticket_repo.get_user_tickets(user.id)
            logger.info(tickets)
            return user, tickets

        except jwt.InvalidTokenError:
            logger.warning("Invalid token")
            return None, []
        except Exception as e:
            logger.error(f"Error validating token: {e}")
            return None, []

    async def update_user_referred_by(self, user_id: str, referred_by: str):
        user = await self.user_repo.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        if user.telegram_id == referred_by:
            raise ValueError("you can not be your own referral")

        user_referred_by = await self.user_repo.get_user_by_telegram_id(referred_by)
        if not user_referred_by:
            raise ValueError("Referral user not found")
        user_referrals = []
        user.referred_by = referred_by
        user.referrals = user_referrals.append(referred_by)
        await self.user_repo.update_user(user)
        return user

    async def get_user_referral_list(self, user_id: str) -> list:
        return await self.user_repo.get_user_referral_list(user_id)

    async def increase_user_xp(self, user_id: str, xp: int):
        user = await self.user_repo.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        user.xp += xp
        await self.user_repo.update_user(user)
        return user


