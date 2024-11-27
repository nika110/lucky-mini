import json
from typing import Set
import websockets
from websockets.server import WebSocketServerProtocol
import asyncio
from database import Database
import logging
from config import settings

logger = logging.getLogger(__name__)

class BaseWebSocketManager:
    def __init__(self):
        self.connections: Set[WebSocketServerProtocol] = set()

    async def register(self, websocket: WebSocketServerProtocol):
        self.connections.add(websocket)
        logger.info(f"New connection registered. Total connections: {len(self.connections)}")

    async def unregister(self, websocket: WebSocketServerProtocol):
        if websocket in self.connections:
            self.connections.remove(websocket)
            logger.info(f"Connection unregistered. Total connections: {len(self.connections)}")

    async def _send_to_connections(self, message: str):
        websockets_to_remove = set()
        sent_count = 0

        for websocket in self.connections:
            try:
                await websocket.send(message)
                sent_count += 1
            except websockets.exceptions.ConnectionClosed:
                websockets_to_remove.add(websocket)

        # Clean up closed connections
        for websocket in websockets_to_remove:
            await self.unregister(websocket)

        logger.info(f"Message sent to {sent_count} connections")

class WebSocketManager(BaseWebSocketManager):
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.connections = set()
        return cls._instance

    async def broadcast_update(self, message_data: dict):
        message = json.dumps(message_data)
        await self._send_to_connections(message)


class BufferedWebSocketManager(BaseWebSocketManager):
    _instance = None
    BROADCAST_INTERVAL = settings.BROADCAST_INTERVAL  # seconds

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.connections = set()
            cls._instance.buffer_lock = asyncio.Lock()
            cls._instance._start_background_task()
            logger.info("Created new BufferedWebSocketManager instance")
        return cls._instance

    def _start_background_task(self):
        asyncio.create_task(self._periodic_broadcast())
        logger.info("Started periodic broadcast task")

    async def add_to_buffer(self, raffle_id: str, ticket_count: int):
        async with self.buffer_lock:
            redis_key = f"websocket_buffer:{raffle_id}"
            await Database.redis.hincrby(redis_key, "ticket_count", ticket_count)
            total_pool = await Database.redis.hincrby(f"raffle:{raffle_id}", "total_pool", ticket_count)
            await Database.redis.hset(redis_key, "total_pool", total_pool)
            logger.info(
                f"Added to buffer - raffle_id: {raffle_id}, ticket_count: {ticket_count}, total_pool: {total_pool}")

    async def _periodic_broadcast(self):  # Added underscore here to match the call
        while True:
            try:
                await asyncio.sleep(self.BROADCAST_INTERVAL)
                await self._flush_buffer()
            except Exception as e:
                logger.error(f"Error in periodic broadcast: {e}")

    async def _flush_buffer(self):
        buffer_keys = await Database.redis.keys("websocket_buffer:*")

        if not buffer_keys:
            logger.debug("No buffer keys to flush")
            return

        logger.info(f"Flushing {len(buffer_keys)} buffer keys")

        for buffer_key in buffer_keys:
            try:
                # Decode the buffer key if it's bytes
                raffle_id = buffer_key.decode('utf-8').split(":")[-1] if isinstance(buffer_key, bytes) else \
                buffer_key.split(":")[-1]

                pipeline = Database.redis.pipeline()
                pipeline.hgetall(buffer_key)
                pipeline.delete(buffer_key)
                results = await pipeline.execute()
                buffer_data = results[0]

                if not buffer_data:
                    continue

                # Convert bytes to string for ticket_count and total_pool
                ticket_count = int(
                    buffer_data[b"ticket_count"].decode('utf-8') if isinstance(buffer_data[b"ticket_count"], bytes) else
                    buffer_data[b"ticket_count"])
                total_pool = int(
                    buffer_data[b"total_pool"].decode('utf-8') if isinstance(buffer_data[b"total_pool"], bytes) else
                    buffer_data[b"total_pool"])

                message = {
                    "type": "pool_update",
                    "raffle_id": raffle_id,
                    "ticket_count": ticket_count,
                    "total_pool": total_pool
                }

                logger.info(f"Broadcasting message: {message}")
                await self._send_to_connections(json.dumps(message))

            except Exception as e:
                logger.error(f"Error processing buffer {buffer_key}: {e}", exc_info=True)


async def websocket_handler(websocket: WebSocketServerProtocol, path: str):
    logger.info(f"New WebSocket connection from {websocket.remote_address}, path: {path}")

    regular_manager = WebSocketManager()
    buffered_manager = BufferedWebSocketManager()

    try:
        await regular_manager.register(websocket)
        await buffered_manager.register(websocket)
        async for message in websocket:
            logger.info(f"Received message: {message}")
    except Exception as e:
        logger.error(f"Error in websocket handler: {e}")
    finally:
        await regular_manager.unregister(websocket)
        await buffered_manager.unregister(websocket)