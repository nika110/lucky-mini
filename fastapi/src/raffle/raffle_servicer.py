import grpc.aio
from . import raffle_pb2, raffle_pb2_grpc
from .raffle_service import RaffleService
import logging
from users.user_repo import UserRepository

from config import settings

from users.balance_service import BalanceService

logger = logging.getLogger(__name__)


class RaffleServicer(raffle_pb2_grpc.RaffleServiceServicer):
    def __init__(self):
        self.raffle_service = RaffleService()
        self.balance_service = BalanceService()
        self.user_service = UserRepository()

    async def PurchaseTickets(
        self,
        request: raffle_pb2.PurchaseTicketsRequest,
        context: grpc.aio.ServicerContext,
    ) -> raffle_pb2.PurchaseTicketsResponse:
        try:
            user = await self.balance_service.get_user_balance(request.user_id)
            if not user:
                await context.abort(grpc.StatusCode.NOT_FOUND, "User not found")
                return raffle_pb2.PurchaseTicketsResponse()

           if user.balance < request.ticket_count:
               await context.abort(
                   grpc.StatusCode.FAILED_PRECONDITION,
                   f"Insufficient balance. Required: {request.ticket_count}, Available: {user.balance}"
               )
               return raffle_pb2.PurchaseTicketsResponse()


            ticket_numbers, raffle_id = await self.raffle_service.purchase_tickets(
                request.user_id,
                request.ticket_count
            )

            decrease_balance = await self.balance_service.update_user_balance(request.user_id, -request.ticket_count)

            check_if_user_has_referrer = await self.user_service.get_user_by_id(request.user_id)
            if check_if_user_has_referrer.referred_by != "":
                referrer = await self.user_service.get_user_by_telegram_id(check_if_user_has_referrer.referred_by)
                await self.user_service.update_user_xp(referrer.id,(request.ticket_count*settings.REFERRAL_UPDATE_PER_TICKET_BUY))

            return raffle_pb2.PurchaseTicketsResponse(
                ticket_numbers=ticket_numbers,
                raffle_id=raffle_id
            )

        except Exception as e:
            context.abort(grpc.StatusCode.FAILED_PRECONDITION, str(e))

    async def GetCurrentRaffle(self, request, context):
        try:
            current_raffle = await self.raffle_service.get_current_raffle()
            if not current_raffle:
                context.abort(grpc.StatusCode.NOT_FOUND, "No active raffle found")

            total_pool = float(await self.raffle_service.get_total_pool(current_raffle.id) or 0)

            return raffle_pb2.GetCurrentRaffleResponse(
                raffle_id=current_raffle.id,
                end_time=int(current_raffle.end_time.timestamp()),
                current_pool=total_pool
            )
        except Exception as e:
            context.abort(grpc.StatusCode.INTERNAL, str(e))

    def _convert_to_proto_winner(self, winner) -> raffle_pb2.Winner:
        try:
            # Create a new Winner proto message
            proto_winner = raffle_pb2.Winner()

            # Explicitly set each field
            proto_winner.user_id = str(winner.user_id)
            proto_winner.amount = float(winner.amount)
            proto_winner.position = int(winner.position)

            return proto_winner
        except Exception as e:
            logger.error(f"Error converting winner to proto: {e}")
            raise

    async def GetRaffleResults(
            self,
            request: raffle_pb2.GetRaffleResultsRequest,
            context: grpc.aio.ServicerContext,
    ) -> raffle_pb2.GetRaffleResultsResponse:
        try:
            logger.info("Getting raffle results")
            last_raffle = await self.raffle_service.get_last_completed_raffle()

            if not last_raffle:
                logger.info("No completed raffle found")
                await context.abort(grpc.StatusCode.NOT_FOUND, "No completed raffles found")
                return raffle_pb2.GetRaffleResultsResponse()

            if not last_raffle.winners:
                logger.info(f"No winners found for raffle {last_raffle.id}")
                await context.abort(grpc.StatusCode.NOT_FOUND, "No winners found for the raffle")
                return raffle_pb2.GetRaffleResultsResponse()

            logger.info(f"Converting {len(last_raffle.winners)} winners to proto format")

            # Create response message
            response = raffle_pb2.GetRaffleResultsResponse()

            # Set fields explicitly
            response.raffle_id = last_raffle.id
            response.start_time = int(last_raffle.start_time.timestamp())
            response.end_time = int(last_raffle.end_time.timestamp())
            response.total_pool = float(last_raffle.total_pool)

            # Convert and add winners one by one
            for winner in last_raffle.winners:
                proto_winner = self._convert_to_proto_winner(winner)
                response.winners.append(proto_winner)

            logger.info("Successfully created response")
            return response

        except Exception as e:
            logger.error(f"Error in GetRaffleResults: {e}")
            await context.abort(grpc.StatusCode.INTERNAL, f"Internal error: {str(e)}")
            return raffle_pb2.GetRaffleResultsResponse()

    async def IncreaseBalance(self, request, context):
        try:
            user_id = request.user_id
            amount = request.amount

            success = await self.balance_service.update_user_balance(user_id, amount)
            if not success:
                await context.abort(grpc.StatusCode.INTERNAL, "Failed to update user balance")
                return raffle_pb2.IncreaseBalanceResponse()

            return raffle_pb2.IncreaseBalanceResponse()
        except Exception as e:
            await context.abort(grpc.StatusCode.INTERNAL, str(e))
            return raffle_pb2.IncreaseBalanceResponse()
