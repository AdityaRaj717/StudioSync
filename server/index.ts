import dotenv from "dotenv";
dotenv.config();
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";

import connect from "./config/db.ts";
import "./config/passport.ts";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const key = fs.readFileSync(path.join(__dirname, "certs", "cert.key"));
const cert = fs.readFileSync(path.join(__dirname, "certs", "cert.crt"));

const PORT = process.env.PORT;
const server = https.createServer({ key, cert }, app);

await connect();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
  cors: {
    origin: ["https://localhost:5173", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

interface Room {
  roomId: string;
  clients: string[];
}

const rooms: Room[] = [];

io.on("connection", (socket) => {
  console.log("✅ A new user has connected: " + socket.id);

  socket.on("room-id", (roomId) => {
    let room = rooms.find((r) => r.roomId === roomId);
    if (!room) {
      room = { roomId, clients: [socket.id] };
      rooms.push(room);
      socket.join(roomId);
    }
  });

  socket.on("join-room", (roomId, callback) => {
    const room = rooms.find((r) => r.roomId === roomId);
    let status = "";
    if (!room) status = "no-room";
    else {
      if (room.clients.length < 2) {
        room.clients.push(socket.id);
        socket.join(roomId);
        status = "ok";
        // Notify existing members of new join
        io.to(roomId).emit("new-member-joined", room.clients);
      } else status = "room-full";
    }
    callback({
      status,
      clients: room ? room.clients : [],
    });
  });

  // Send offer directly to target client
  socket.on("sending-offer", (offer, roomId, targetSocketId) => {
    if (offer && targetSocketId) {
      console.log(`Offer from ${socket.id} to ${targetSocketId}`);
      io.to(targetSocketId).emit("new-offer", offer);
    }
  });

  // Send answer directly to target client
  socket.on("sending-answer", (answer, roomId, targetSocketId) => {
    if (answer && targetSocketId) {
      console.log(`Answer from ${socket.id} to ${targetSocketId}`);
      io.to(targetSocketId).emit("new-answer", answer);
    }
  });

  socket.on("sendIceToServer", (candidate, roomId, targetSocketId) => {
    if (candidate && targetSocketId) {
      io.to(targetSocketId).emit("sendIceToClient", candidate);
    }
  });

  socket.on("disconnect", () => {
    // Remove from rooms on disconnect
    rooms.forEach((room) => {
      room.clients = room.clients.filter((id) => id !== socket.id);
    });
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.get("/", (req, res) => res.send("Hello World"));

server.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
