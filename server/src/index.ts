import dotenv from "dotenv";
dotenv.config();
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

import connect from "./config/db.ts";
import "./config/passport.ts";
import authRoute from "./routes/authRoute.ts";
import sessionRoute from "./routes/sessionRoute.ts";
import { initializeSocket } from "./socket/index.ts";
import s3Route from "./routes/s3Route.ts";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const key = fs.readFileSync(path.join(__dirname, "certs", "cert.key"));
const cert = fs.readFileSync(path.join(__dirname, "certs", "cert.crt"));

const PORT = process.env.PORT || 3000;
const server = https.createServer({ key, cert }, app);

initializeSocket(server);

const startServer = async () => {
  await connect();

  app.use(
    cors({
      origin: process.env.UI_URL,
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(passport.initialize());

  app.use("/auth", authRoute);
  app.use("/api/sessions", sessionRoute);
  app.use("/api/s3", s3Route);
  app.get("/", (req, res) => res.send("Hello World"));

  server.listen(PORT, () =>
    console.log(`🚀 Server listening on port: ${PORT}`)
  );
};

startServer();
