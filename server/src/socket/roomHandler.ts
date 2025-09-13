import { Socket, Server } from "socket.io";

interface Room {
  roomId: string;
  clients: string[];
}

const rooms: Room[] = [];

export const roomHandler = (io: Server, socket: Socket) => {
  const createRoom = (roomId: string) => {
    let room = rooms.find((r) => r.roomId === roomId);
    if (!room) {
      room = { roomId, clients: [socket.id] };
      rooms.push(room);
      socket.join(roomId);
    }
  };

  const joinRoom = (roomId: string, callback: (response: any) => void) => {
    const room = rooms.find((r) => r.roomId === roomId);
    let status = "";
    if (!room) {
      status = "no-room";
    } else {
      if (room.clients.length < 2) {
        room.clients.push(socket.id);
        socket.join(roomId);
        status = "ok";
        io.to(roomId).emit("new-member-joined", room.clients);
      } else {
        status = "room-full";
      }
    }
    callback({
      status,
      clients: room ? room.clients : [],
    });
  };

  const disconnect = () => {
    rooms.forEach((room) => {
      room.clients = room.clients.filter((id) => id !== socket.id);
      if (room.clients.length > 0) {
        io.to(room.roomId).emit("member-left", socket.id);
      }
    });
    console.log(`User disconnected: ${socket.id}`);
  };

  socket.on("room-id", createRoom);
  socket.on("join-room", joinRoom);
  socket.on("disconnect", disconnect);
};
