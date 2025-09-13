import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "https";
import { roomHandler } from "./roomHandler.ts";

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: [
        process.env.UI_URL || "https://localhost:5173",
        "http://localhost:5173",
      ],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("A new user has connected: " + socket.id);

    roomHandler(io, socket);

    socket.on("sending-offer", (offer, roomId, targetSocketId) => {
      if (offer && targetSocketId) {
        io.to(targetSocketId).emit("new-offer", offer);
      }
    });

    socket.on("sending-answer", (answer, roomId, targetSocketId) => {
      if (answer && targetSocketId) {
        io.to(targetSocketId).emit("new-answer", answer);
      }
    });

    socket.on("sendIceToServer", (candidate, roomId, targetSocketId) => {
      if (candidate && targetSocketId) {
        io.to(targetSocketId).emit("sendIceToClient", candidate);
      }
    });
  });

  return io;
};
