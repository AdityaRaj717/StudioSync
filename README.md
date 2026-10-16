# StudioSync

A full-stack web app for one-to-one video calls with in-browser session recording. Built solo with a React/TypeScript frontend and a Node.js/Express backend.

> **Status: work in progress.** Peer-to-peer calls, authentication, rooms and the session dashboard are implemented. The recording upload to S3 is written but hasn't been set up against a real bucket yet. Nothing is deployed.

## What's implemented

- **Authentication:** email/password and Google OAuth 2.0 via Passport.js, with JWT-based sessions.
- **Peer-to-peer video and audio:** WebRTC, with offers, answers and ICE candidates relayed over Socket.IO. Offers that arrive before the peer connection exists are queued.
- **Rooms:** create a room or join one by ID. Rooms are limited to two people.
- **Recording:** in-browser recording with the MediaRecorder API. The upload path asks the server for an S3 presigned URL so the video never passes through the server.
- **Dashboard:** history of past sessions, stored in MongoDB.

## Known limitations

- Rooms are kept in server memory, so they are lost on restart and can't be shared across multiple server instances.
- Only STUN is configured (no TURN server), so calls can fail on restrictive networks.
- Calls are one-to-one only.
- No automated tests yet.

## Tech stack

**Client:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Socket.IO client, Axios, React Router

**Server:** Node.js, Express 5, TypeScript, MongoDB with Mongoose, Socket.IO, Passport.js (local, Google OAuth 2.0, JWT), AWS SDK v3 for S3 presigned URLs

## Running locally

### Prerequisites

- Node.js 18 or newer
- A MongoDB instance (local or Atlas)
- [mkcert](https://github.com/FiloSottile/mkcert) for local HTTPS certificates. Browsers only allow camera access on secure origins.
- Optional: an S3 bucket and IAM credentials, needed only for recording uploads

### 1. Generate local certificates

The server reads `server/src/certs/cert.key` and `cert.crt`. These are git-ignored, so generate your own:

```bash
mkcert -install
mkdir -p server/src/certs
mkcert -key-file server/src/certs/cert.key -cert-file server/src/certs/cert.crt localhost 127.0.0.1
```

### 2. Server

Create `server/.env`:

```
PORT=3000
MONGO_URI=<mongodb connection string>
UI_URL=https://localhost:5173
JWT_SECRET=<random secret>

GOOGLE_CLIENT_ID=<google oauth client id>
GOOGLE_CLIENT_SECRET=<google oauth client secret>

# Only needed for recording uploads
AWS_REGION=<bucket region>
AWS_ACCESS_KEY_ID=<access key>
AWS_SECRET_ACCESS_KEY=<secret key>
AWS_BUCKET_NAME=<bucket name>
```

```bash
cd server
npm install
npm start
```

### 3. Client

Create `client/.env`:

```
VITE_API_URL=https://localhost:3000
```

```bash
cd client
npm install
npm run dev
```

The app runs at https://localhost:5173.

## Project structure

```
client/src/
  components/   auth, video controls, shadcn ui
  hooks/        useSocket, useWebRTC, useMediaStream
  pages/        Login, Signup, Dashboard, VideoPage
server/src/
  config/       database and Passport strategies
  controllers/  auth, sessions, S3 presigned URLs
  model/        User, Session
  routes/       REST routes
  socket/       Socket.IO room and signalling handlers
```

## Next steps

- Move room state to Redis so it survives restarts and works across instances
- Add a TURN server
- Finish and test the recording upload end to end
- Add tests
