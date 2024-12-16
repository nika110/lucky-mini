import { useEffect, useRef, useState } from "react";
import { WebSocketMessage, RaffleState } from "../types/websocket";

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

export const useRaffleSocket = () => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [raffleState] = useState<RaffleState>({
    currentPool: 0,
    ticketCount: 0,
    timeRemaining: 0,
  });

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        ws.current = new WebSocket(WEBSOCKET_URL);

        ws.current.onopen = () => {
          console.log("WebSocket connected");
          setIsConnected(true);
        };

        ws.current.onclose = () => {
          console.log("WebSocket disconnected");
          setIsConnected(false);
          // Попытка переподключения через 3 секунды
          setTimeout(connectWebSocket, 3000);
        };

        ws.current.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        ws.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage;

            console.log(message);
            // if (message.type === "RAFFLE_UPDATE") {
            //   setRaffleState((prevState) => ({
            //     ...prevState,
            //     ...message.data,
            //   }));
            // }
          } catch (error) {
            console.error("Error processing message:", error);
          }
        };
      } catch (error) {
        console.error("WebSocket connection error:", error);
      }
    };

    connectWebSocket();

    // Очистка при размонтировании
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    raffleState,
  };
};
