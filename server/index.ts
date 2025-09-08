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

io.on("connection", (socket) => {
  console.log("✅ A new user has connected");
});

app.get("/", (req, res) => res.send("Hello World"));

server.listen(3000, () => console.log("Server has started listening..."));
