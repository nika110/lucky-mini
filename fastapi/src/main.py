import asyncio
import os
import grpc.aio
from concurrent import futures
import websockets
import logging

from database import Database
from raffle.raffle_31_service import Raffle31Service
from users import auth_pb2_grpc
from users.auth_servicer import AuthServicer
from raffle.raffle_servicer import RaffleServicer
from raffle import raffle_pb2_grpc
from raffle.websocket_server import websocket_handler
from raffle.raffle_monitor import RaffleMonitor
from raffle.raffle_service import RaffleService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)



async def init_db():
    await Database.connect_db()
    db = Database.get_db()

    # Create indexes
    await db.raffles.create_index("is_active")
    await db.users.create_index("telegram_id", unique=True)

    # await db.tickets.create_index("raffle_id")
    # await db.tickets.create_index([("raffle_id", 1), ("user_id", 1)])

async def ensure_active_raffle():
    raffle_service = RaffleService()
    raffle_31_service = Raffle31Service()
    new_raffle = await raffle_service._create_new_raffle()
    new_31_raffle = await raffle_31_service._create_new_31_raffle()
    logger.info(f"Created new raffle: {new_raffle.id}, ends at {new_raffle.end_time}")
    logger.info(f"Created new raffle 31: {new_31_raffle.id}, ends at {new_31_raffle.end_time}")

async def serve():
    await init_db()

    await ensure_active_raffle()

    server = grpc.aio.server(futures.ThreadPoolExecutor(max_workers=10))
    raffle_pb2_grpc.add_RaffleServiceServicer_to_server(RaffleServicer(), server)
    auth_pb2_grpc.add_AuthServiceServicer_to_server(AuthServicer(), server)
    grpc_addr = "[::]:50052"
    server.add_insecure_port(grpc_addr)
    await server.start()

    ws_host = os.getenv("WEBSOCKET_HOST", "0.0.0.0")
    ws_port = int(os.getenv("WEBSOCKET_PORT", "8766"))

    monitor = RaffleMonitor()
    monitor_task = asyncio.create_task(monitor.monitor_raffles())

    # Start WebSocket server
    async with websockets.serve(websocket_handler, ws_host, ws_port):
        logger.info(f"WebSocket server started on ws://{ws_host}:{ws_port}")
        try:
            await asyncio.gather(
                server.wait_for_termination(),
                monitor_task
            )
        except asyncio.CancelledError:
            monitor_task.cancel()
            await monitor_task
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            raise

if __name__ == "__main__":
    asyncio.run(serve())