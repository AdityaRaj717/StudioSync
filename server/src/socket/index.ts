import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "https";
import { roomHandler } from "./roomHandler.ts";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import User from "../model/User.ts";

interface AuthenticatedSocket extends Socket {
  data: {
    user?: {
      id: string;
      email: string;
      name: string;
    };
  };
}

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: [
        process.env.UI_URL || "https://localhost:5173",
        "http://localhost:5173",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket: AuthenticatedSocket, next) => {
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) {
      return next(new Error("Authentication error: No cookies provided."));
    }

    const parsedCookies = cookie.parse(cookies);
    const token = parsedCookies.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided."));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        sub: string;
      };
      const user = await User.findById(decoded.sub).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found."));
      }

      socket.data.user = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      };
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token."));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.data.user?.name} (${socket.id})`);

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
