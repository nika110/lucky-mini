import grpc.aio
from . import raffle_pb2, raffle_pb2_grpc
from .raffle_service import RaffleService

class RaffleServicer(raffle_pb2_grpc.RaffleServiceServicer):
    def __init__(self):
        self.raffle_service = RaffleService()

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

