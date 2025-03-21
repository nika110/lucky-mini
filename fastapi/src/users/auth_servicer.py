# users/auth_servicer.py
import grpc.aio
from . import auth_pb2, auth_pb2_grpc
from . import user_pb2
from .auth_service import AuthService
import logging
from google.protobuf.json_format import MessageToDict


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AuthServicer(auth_pb2_grpc.AuthServiceServicer):
    def __init__(self):
        self.auth_service = AuthService()

    def _create_user_profile(self, user) -> user_pb2.UserProfile:
        try:

            profile = user_pb2.UserProfile()

            profile.id = str(user.id)
            profile.telegram_id = str(user.telegram_id)
            profile.created_at = int(user.created_at.timestamp())

            profile.ton_public_key = str(user.ton_public_key) if user.ton_public_key else ""
            profile.balance = float(user.balance) if user.balance is not None else 0.0
            profile.xp = int(user.xp) if user.xp is not None else 0

            profile.balance = float(user.balance) if user.balance is not None else 0.0
            profile.xp = int(user.xp) if user.xp is not None else 0
            profile.referred_by = str(user.referred_by) if user.referred_by else ""
            #profile.referrals = [] #TODO PASS REFDERRAL USER TG_ID OR UID

            logger.info(f"Created profile fields:")
            logger.info(f"  id: {profile.id}")
            logger.info(f"  telegram_id: {profile.telegram_id}")
            logger.info(f"  ton_public_key: {profile.ton_public_key}")
            logger.info(f"  balance: {profile.balance}")
            logger.info(f"  created_at: {profile.created_at}")
            logger.info(f"  xp: {profile.xp}")
            logger.info(f"  referred_by: {profile.referred_by}")
            logger.info(f"  referred_by: {profile.referrals}")

            return profile

        except Exception as e:
            logger.error(f"Error creating user profile: {str(e)}", exc_info=True)
            raise


    def _create_ticket_proto(self, ticket) -> user_pb2.Ticket:
        return user_pb2.Ticket(
            raffle_id=ticket.raffle_id,
            ticket_number=ticket.ticket_number,
            user_id=ticket.user_id,
            purchase_time=int(ticket.purchase_time.timestamp())
        )

    async def AuthenticateTelegram(
            self,
            request: auth_pb2.AuthTelegramRequest,
            context: grpc.aio.ServicerContext,
    ) -> auth_pb2.AuthTelegramResponse:
        try:
            user, token, xp_earned = await self.auth_service.authenticate_telegram(
                telegram_id=request.telegram_id,
                telegram_auth_code=request.telegram_auth_code,
                referred_by=request.referred_by if request.HasField('referred_by') else None
            )

            response = auth_pb2.AuthTelegramResponse(
                token=token,
                user=self._create_user_profile(user)
            )

            logger.info(f"Successfully authenticated user: {user.telegram_id}")
            logger.info(f"Current login streak: {user.login_streak}")
            logger.info(f"XP earned from login: {xp_earned}")
            return response

        except ValueError as e:
            logger.error(f"Authentication validation error: {str(e)}")
            await context.abort(grpc.StatusCode.INVALID_ARGUMENT, str(e))
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            await context.abort(grpc.StatusCode.INTERNAL, str(e))


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
            user, tickets = await self.auth_service.validate_token(request.token)

            if not user:
                return auth_pb2.ValidateTokenResponse(is_valid=False)

            logger.info(f"Creating response for user: {user.dict()}")

            # Create response
            response = auth_pb2.ValidateTokenResponse(
                is_valid=True,
                user=self._create_user_profile(user)
            )

            # Add tickets
            if tickets:
                for ticket in tickets:
                    ticket_proto = response.tickets.add()
                    ticket_proto.raffle_id = str(ticket.raffle_id)
                    ticket_proto.ticket_number = str(ticket.ticket_number)
                    ticket_proto.user_id = str(ticket.user_id)
                    ticket_proto.purchase_time = int(ticket.purchase_time.timestamp())

            try:
                response_dict = MessageToDict(response, preserving_proto_field_name=True)
                logger.info(f"Final response: {response_dict}")
            except Exception as e:
                logger.error(f"Error logging response: {str(e)}")

            return response

        except Exception as e:
            logger.error(f"Error in ValidateToken: {str(e)}", exc_info=True)
            await context.abort(grpc.StatusCode.INTERNAL, str(e))
            return auth_pb2.ValidateTokenResponse()

    async def UpdateUserReferral(self, request, context):
        try:
            await self.auth_service.update_user_referred_by(
                user_id=request.user_id,
                referred_by=request.referred_by
            )
            return auth_pb2.UpdateUserReferralResponse()
        except ValueError as e:
            context.abort(grpc.StatusCode.NOT_FOUND, str(e))
        except Exception as e:
            context.abort(grpc.StatusCode.INTERNAL, str(e))

    async def ListUserReferrals(self, request, context):
        try:
            page = request.page or 1
            page_size = request.page_size or 10

            referrals, total_count = await self.auth_service.get_user_referral_list(
                request.user_id,
                page,
                page_size
            )

            response = auth_pb2.ListUserReferralsResponse()
            response.total_count = total_count

            for referral in referrals:
                referral_proto = auth_pb2.Referral()
                referral_proto.telegram_id = referral.telegram_id
                referral_proto.xp = referral.xp
                response.referrals.append(referral_proto)

            return response
        except ValueError as e:
            context.abort(grpc.StatusCode.NOT_FOUND, str(e))
        except Exception as e:
            context.abort(grpc.StatusCode.INTERNAL, str(e))

    async def GetConfig(self, request, context):
        try:
            ticket_price = str(self.auth_service.settings.TICKET_PRICE)
            response = auth_pb2.GetConfigResponse(ticket_price=ticket_price)
            return response
        except Exception as e:
            await context.abort(grpc.StatusCode.INTERNAL, str(e))

    async def IncreaseXp(self, request, context):
        await self.auth_service.increase_user_xp(
            user_id=request.user_id,
            xp=request.xp
        )
        return auth_pb2.IncreaseXpResponse(message="XP increased")