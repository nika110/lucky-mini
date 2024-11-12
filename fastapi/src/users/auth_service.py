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

        self.secret_key = hmac.new(
            settings.TELEGRAM_BOT_TOKEN.encode(),
            "WebAppData".encode(),
            hashlib.sha256
        ).digest()

    def verify_telegram_auth(self, auth_data: str) -> Optional[Dict]:
        try:
            parsed_data = dict(parse_qsl(auth_data))

            if 'hash' not in parsed_data:
                return None

            telegram_hash = parsed_data['hash']
            data_to_check = parsed_data.copy()
            data_to_check.pop('hash')

            data_check_string = '\n'.join(
                f"{k}={v}" for k, v in sorted(data_to_check.items())
            )

            calculated_hash = hmac.new(
                self.secret_key,
                data_check_string.encode(),
                hashlib.sha256
            ).hexdigest()

            if calculated_hash != telegram_hash:
                return None

            auth_date = int(parsed_data.get('auth_date', 0))
            if datetime.utcnow().timestamp() - auth_date > 86400:
                return None

            if 'user' in parsed_data:
                return json.loads(unquote(parsed_data['user']))

            return None

        except Exception as e:
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
                referred_by=referred_by
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
    def get_user_from_token(self, token: str):
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload


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
            get_user = self.get_user_from_token(token)
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