import { useEffect, useState, useMemo } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (serverUrl: string) => {
  const socket = useMemo(
    () => io(serverUrl, { withCredentials: true }),
    [serverUrl]
  );
  const [myId, setMyId] = useState<string>("");
  const [clients, setClients] = useState<string[]>([]);

  useEffect(() => {
    socket.on("connect", () => {
      setMyId(socket.id);
    });

    socket.on("new-member-joined", (updatedClients: string[]) => {
      setClients(updatedClients);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      socket.off("connect");
      socket.off("new-member-joined");
      socket.off("connect_error");
    };
  }, [socket]);

  return { socket, myId, clients, setClients };
};
