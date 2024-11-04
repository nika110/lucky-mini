# websocket_server.py
import json
from typing import Set
import websockets
from websockets.server import WebSocketServerProtocol

class WebSocketManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.connections: Set[WebSocketServerProtocol] = set()
        return cls._instance

    async def register(self, websocket: WebSocketServerProtocol):
        self.connections.add(websocket)

    async def unregister(self, websocket: WebSocketServerProtocol):
        if websocket in self.connections:
            self.connections.remove(websocket)

    async def broadcast_update(self, message_data: dict):
        message = json.dumps(message_data)
        websockets_to_remove = set()

        for websocket in self.connections:
            try:
                await websocket.send(message)
            except websockets.exceptions.ConnectionClosed:
                websockets_to_remove.add(websocket)

        # Clean up closed connections
        for websocket in websockets_to_remove:
            await self.unregister(websocket)

async def websocket_handler(websocket: WebSocketServerProtocol, path: str):
    manager = WebSocketManager()

    try:
        await manager.register(websocket)
        async for message in websocket:
            pass  # You can handle incoming messages here if needed
    finally:
        await manager.unregister(websocket)