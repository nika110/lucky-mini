import os
from fastapi import FastAPI, HTTPException
import grpc
from google.protobuf.json_format import MessageToDict
import service_pb2
import service_pb2_grpc
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Raffle FastAPI Service")

# gRPC client configuration
GRPC_SERVER_HOST = os.getenv("GRPC_SERVER_HOST", "backend")
GRPC_SERVER_PORT = os.getenv("GRPC_SERVER_PORT", "50051")
GRPC_SERVER_ADDR = f"{GRPC_SERVER_HOST}:{GRPC_SERVER_PORT}"

def get_grpc_channel():
    try:
        channel = grpc.insecure_channel(GRPC_SERVER_ADDR)
        grpc.channel_ready_future(channel).result(timeout=10)
        return channel
    except grpc.FutureTimeoutError:
        logger.error(f" Cannot connect to gRPC server at {GRPC_SERVER_ADDR}")
        raise HTTPException(status_code=503, detail="gRPC server unavailable")
    except Exception as e:
        logger.error(f" Error connecting to gRPC server: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/")
async def root():
    return {
        "message": "Raffle FastAPI Service is running",
        "grpc_server": GRPC_SERVER_ADDR
    }

@app.get("/health")
async def health_check():
    try:
        channel = get_grpc_channel()
        channel.close()
        return {"status": "healthy", "grpc_connection": "ok"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@app.get("/raffle/{raffle_id}/status")
async def get_raffle_status(raffle_id: str):
    try:
        logger.info(f"📨 Received request for raffle status: {raffle_id}")
        
        channel = get_grpc_channel()
        stub = service_pb2_grpc.RaffleServiceStub(channel)
        
        request = service_pb2.RaffleRequest(raffle_id=raffle_id)
        logger.info(f" Sending gRPC request: {request}")
        
        response = stub.GetRaffleStatus(request)
        logger.info(f" Received gRPC response: {response}")
        
        result = MessageToDict(response)
        
        channel.close()
        
        return {
            "raffle_id": raffle_id,
            "response": result,
            "grpc_server": GRPC_SERVER_ADDR
        }
    except grpc.RpcError as e:
        logger.error(f" gRPC error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"gRPC error: {str(e)}")
    except Exception as e:
        logger.error(f" Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)