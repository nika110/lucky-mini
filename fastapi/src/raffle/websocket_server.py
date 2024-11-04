import json
from typing import Set, Dict
import websockets
from websockets.server import WebSocketServerProtocol

class WebSocketManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.connections: Dict[str, Set[WebSocketServerProtocol]] = {}
        return cls._instance

    async def register(self, raffle_id: str, websocket: WebSocketServerProtocol):
        if raffle_id not in self.connections:
            self.connections[raffle_id] = set()
        self.connections[raffle_id].add(websocket)

    async def unregister(self, raffle_id: str, websocket: WebSocketServerProtocol):
        if raffle_id in self.connections:
            self.connections[raffle_id].remove(websocket)
            if not self.connections[raffle_id]:
                del self.connections[raffle_id]

    async def broadcast_pool_update(self, raffle_id: str, total_pool: int):
        if raffle_id in self.connections:
            message = json.dumps({
                "type": "pool_update",
                "raffle_id": raffle_id,
                "total_pool": total_pool
            })
            websockets_to_remove = set()

            for websocket in self.connections[raffle_id]:
                try:
                    await websocket.send(message)
                except websockets.exceptions.ConnectionClosed:
                    websockets_to_remove.add(websocket)

            for websocket in websockets_to_remove:
                await self.unregister(raffle_id, websocket)

async def websocket_handler(websocket: WebSocketServerProtocol, path: str):
    raffle_id = path.split('/')[-1]
    manager = WebSocketManager()

    try:
        await manager.register(raffle_id, websocket)
        async for message in websocket:
            pass
    finally:
        await manager.unregister(raffle_id, websocket)