# users/auth_servicer.py
import grpc.aio
from . import auth_pb2, auth_pb2_grpc
from . import user_pb2
from .auth_service import AuthService

class AuthServicer(auth_pb2_grpc.AuthServiceServicer):
    def __init__(self):
        self.auth_service = AuthService()

    def _create_user_profile(self, user) -> user_pb2.UserProfile:
        return user_pb2.UserProfile(
            id=user.id,
            telegram_id=user.telegram_id,
            ton_public_key=user.ton_public_key,
            balance=user.balance,
            created_at=int(user.created_at.timestamp()),
            xp=user.xp,
            referred_by=user.referred_by
        )

    async def AuthenticateTelegram(
            self,
            request: auth_pb2.AuthTelegramRequest,
            context: grpc.aio.ServicerContext,
    ) -> auth_pb2.AuthTelegramResponse:
        try:
            user, token = await self.auth_service.authenticate_telegram(
                telegram_id=request.telegram_id,
                referred_by=request.referred_by if request.HasField('referred_by') else None
            )

            return auth_pb2.AuthTelegramResponse(
                token=token,
                user=self._create_user_profile(user)
            )
        except Exception as e:
            context.abort(grpc.StatusCode.INTERNAL, str(e))

    async def UpdateTonWallet(
            self,
            request: auth_pb2.UpdateTonWalletRequest,
            context: grpc.aio.ServicerContext,
    ) -> auth_pb2.UpdateTonWalletResponse:
        try:
            user = await self.auth_service.update_ton_wallet(
                telegram_id=request.telegram_id,
                ton_public_key=request.ton_public_key
            )

            return auth_pb2.UpdateTonWalletResponse(
                user=self._create_user_profile(user)
            )
        except ValueError as e:
            context.abort(grpc.StatusCode.NOT_FOUND, str(e))
        except Exception as e:
            context.abort(grpc.StatusCode.INTERNAL, str(e))

    async def ValidateToken(
            self,
            request: auth_pb2.ValidateTokenRequest,
            context: grpc.aio.ServicerContext,
    ) -> auth_pb2.ValidateTokenResponse:
        try:
            user = await self.auth_service.validate_token(request.token)

            if not user:
                return auth_pb2.ValidateTokenResponse(is_valid=False)

            return auth_pb2.ValidateTokenResponse(
                is_valid=True,
                user=self._create_user_profile(user)
            )
        except Exception as e:
            context.abort(grpc.StatusCode.INTERNAL, str(e))