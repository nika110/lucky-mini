# users/auth_service.py
import jwt
from datetime import datetime, timedelta
import uuid
from typing import Optional, Tuple
from .user_models import User
from .user_repo import UserRepository
from config import settings

class AuthService:
    def __init__(self):
        self.user_repo = UserRepository()

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

    async def authenticate_telegram(
            self,
            telegram_id: str,
            referred_by: Optional[str] = None
    ) -> Tuple[User, str]:
        # Check if user exists
        user = await self.user_repo.get_user_by_telegram_id(telegram_id)

        if not user:
            # Create new user
            user = User(
                id=str(uuid.uuid4()),
                telegram_id=telegram_id,
                ton_public_key="",  # Empty until user adds wallet
                balance=0.0,
                created_at=datetime.utcnow(),
                xp=0,
                referred_by=referred_by
            )
            await self.user_repo.create_user(user)

        # Generate token
        token = self.create_token(user)

        return user, token

    async def update_ton_wallet(
            self,
            telegram_id: str,
            ton_public_key: str
    ) -> User:
        user = await self.user_repo.get_user_by_telegram_id(telegram_id)
        if not user:
            raise ValueError("User not found")

        user.ton_public_key = ton_public_key
        await self.user_repo.update_user(user)
        return user

    async def validate_token(self, token: str) -> Optional[User]:
        try:
            # Decode token
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )

            # Get and return user
            return await self.user_repo.get_user_by_id(payload["user_id"])
        except jwt.InvalidTokenError:
            return None