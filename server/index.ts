import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { Server } from "socket.io";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const key = fs.readFileSync(path.join(__dirname, "certs", "cert.key"));
const cert = fs.readFileSync(path.join(__dirname, "certs", "cert.crt"));

const server = https.createServer({ key, cert }, app);
const io = new Server(server, {
  cors: {
    origin: ["https://localhost:5173", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

const rooms = [];

io.on("connection", (socket) => {
  console.log("✅ A new user has connected");
  socket.on("room-id", (roomId) => {
    const room = rooms.find((room) => room.roomId === roomId);
    if (!room) {
      rooms.push({
        roomId: roomId,
        clients: [socket.id],
      });
      socket.join(roomId);
    }
    // console.log(socket.id);
    // console.log(rooms);
  });
  socket.on("join-room", (roomId, callback) => {
    const room = rooms.find((room) => room.roomId === roomId);
    let status = "";
    if (!room) status = "no-room";
    else {
      if (room.clients.length < 2) {
        room.clients.push(socket.id);
        socket.join(roomId);
        status = "ok";
        socket.to(roomId).emit("new-member-joined", room.clients);
      } else status = "room-full";
    }
    callback({
      status: status,
      clients: room.clients,
    });
  });

  socket.on("sending-offer", (offer, roomId) => {
    const room = rooms.find((room) => room.roomId === roomId);
    socket.to(roomId).emit("new-offer", offer);
  });
});

app.get("/", (req, res) => res.send("Hello World"));

server.listen(3000, () => console.log("Server listening on port 3000"));
