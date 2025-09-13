import { useEffect, useState, useMemo } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (serverUrl: string) => {
  const socket = useMemo(() => io(serverUrl), [serverUrl]);
  const [myId, setMyId] = useState<string>("");
  const [clients, setClients] = useState<string[]>([]);

  useEffect(() => {
    socket.on("connect", () => {
      setMyId(socket.id);
    });

    socket.on("new-member-joined", (updatedClients: string[]) => {
      setClients(updatedClients);
    });

    return () => {
      socket.off("connect");
      socket.off("new-member-joined");
    };
  }, [socket]);

  return { socket, myId, clients, setClients };
};
