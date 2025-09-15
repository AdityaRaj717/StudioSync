import { Socket, Server } from "socket.io";
import Session from "../model/Session.ts";

interface Client {
  socketId: string;
  userId: string;
}

interface Room {
  roomId: string;
  clients: Client[];
}

interface AuthenticatedSocket extends Socket {
  data: {
    user?: {
      id: string;
      email: string;
      name: string;
    };
  };
}

const rooms: Room[] = [];

export const roomHandler = (io: Server, socket: AuthenticatedSocket) => {
  const user = socket.data.user;
  if (!user) return;

  const createRoom = (roomId: string) => {
    let room = rooms.find((r) => r.roomId === roomId);
    if (!room) {
      room = { roomId, clients: [{ socketId: socket.id, userId: user.id }] };
      rooms.push(room);
      socket.join(roomId);
    }
  };

  const joinRoom = async (
    roomId: string,
    callback: (response: any) => void
  ) => {
    const room = rooms.find((r) => r.roomId === roomId);
    let status = "";
    if (!room) {
      status = "no-room";
    } else {
      const isUserInRoom = room.clients.some(
        (client) => client.userId === user.id
      );

      if (isUserInRoom) {
        status = "already-joined";
      } else if (room.clients.length < 2) {
        room.clients.push({ socketId: socket.id, userId: user.id });
        socket.join(roomId);
        status = "ok";

        try {
          await Session.updateOne(
            { roomId },
            { $addToSet: { participants: user.id } }
          );
        } catch (error) {
          console.error("Failed to add participant to session:", error);
        }

        const clientSocketIds = room.clients.map((c) => c.socketId);
        io.to(roomId).emit("new-member-joined", clientSocketIds);
      } else {
        status = "room-full";
      }
    }

    if (status === "already-joined") {
      alert("You are already in this room from another tab.");
    }

    callback({
      status,
      clients: room ? room.clients.map((c) => c.socketId) : [],
    });
  };

  const disconnect = () => {
    rooms.forEach((room) => {
      room.clients = room.clients.filter(
        (client) => client.socketId !== socket.id
      );

      if (room.clients.length > 0) {
        io.to(room.roomId).emit("member-left", socket.id);
      }
    });
    console.log(`User disconnected: ${user.name} (${socket.id})`);
  };

  socket.on("room-id", createRoom);
  socket.on("join-room", joinRoom);
  socket.on("disconnect", disconnect);
};
