import grpc.aio
from . import raffle_pb2, raffle_pb2_grpc
from .raffle_service import RaffleService
from .winner_service import WinnerService

class RaffleServicer(raffle_pb2_grpc.RaffleServiceServicer):
    def __init__(self):
        self.raffle_service = RaffleService()
        self.winner_service = WinnerService()

    async def PurchaseTickets(
        self,
        request: raffle_pb2.PurchaseTicketsRequest,
        context: grpc.aio.ServicerContext,
    ) -> raffle_pb2.PurchaseTicketsResponse:
        try:
            ticket_numbers, raffle_id = await self.raffle_service.purchase_tickets(
                request.user_id,
                request.ticket_count
            )
            return raffle_pb2.PurchaseTicketsResponse(
                ticket_numbers=ticket_numbers,
                raffle_id=raffle_id
            )
        except Exception as e:
            context.abort(grpc.StatusCode.FAILED_PRECONDITION, str(e))
