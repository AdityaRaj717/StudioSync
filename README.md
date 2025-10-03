StudioSync

StudioSync is a full-stack web application designed for real-time video conferencing and session recording. It provides a seamless experience for users to connect via peer-to-peer video calls, manage session rooms, and securely store recordings in the cloud. The application is built with a modern technology stack, featuring a React/TypeScript frontend and a Node.js/Express backend.
Key Features

    Authentication: Secure user sign-up and login using both email/password and Google OAuth 2.0. Session management is handled with JWT.

    Real-time Video & Audio: High-quality, low-latency peer-to-peer communication using WebRTC for video and audio streaming.

    Room Management: Users can create new, unique video rooms or join existing ones using a room ID.

    Session Recording: In-browser recording of video sessions using the MediaRecorder API.

    Cloud Storage: Recorded sessions are uploaded directly to an AWS S3 bucket using pre-signed URLs for secure and efficient storage.

    Dashboard & Session History: An intuitive user dashboard to view a history of all past recording sessions.

    Modern UI/UX: A responsive and visually appealing user interface built with Tailwind CSS and Radix UI components.

Tech Stack
Frontend (Client)

    Framework: React with Vite

    Language: TypeScript

    Styling: Tailwind CSS with Shadcn/UI components

    Real-time Communication: Socket.IO Client

    HTTP Client: Axios

    Routing: React Router

Backend (Server)

    Framework: Node.js with Express

    Language: TypeScript

    Database: MongoDB with Mongoose

    Real-time Communication: Socket.IO

    Authentication: Passport.js (Local, Google OAuth 2.0, JWT strategies)

    Cloud Storage: AWS SDK for S3 (for pre-signed URLs)

Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.
Prerequisites

    Node.js (version 18.x or higher)

    npm, yarn, or pnpm

    A running MongoDB instance (local or a cloud service like MongoDB Atlas)

    An AWS account with an S3 bucket and IAM credentials

Installation & Setup

    Clone the repository:

    git clone [https://github.com/adityaraj717/studiosync.git](https://github.com/adityaraj717/studiosync.git)
    cd studiosync

    Set up the backend:

        Navigate to the server directory: cd server

        Install dependencies: npm install

        Create a .env file and populate it with your credentials. See the .env.example section below.

    Set up the frontend:

        Navigate to the client directory: cd ../client

        Install dependencies: npm install

        Create a .env file and add your backend API URL.

Environment Variables

You will need to create .env files in both the client and server directories.
Server (/server/.env)

PORT=3000
MONGO_URI=<YOUR_MONGODB_CONNECTION_STRING>
UI_URL=https://localhost:5173
JWT_SECRET=<YOUR_SUPER_SECRET_JWT_KEY>

# Google OAuth Credentials
GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>

# AWS S3 Credentials
AWS_REGION=<YOUR_AWS_S3_BUCKET_REGION>
AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY>
AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_KEY>
AWS_BUCKET_NAME=<YOUR_AWS_S3_BUCKET_NAME>

Client (/client/.env)

VITE_API_URL=https://localhost:3000

Running the Application

    Start the backend server:

        From the /server directory:

    npm start

    The server will be running on https://localhost:3000.

    Start the frontend development server:

        From the /client directory:

    npm run dev

    The application will be accessible at https://localhost:5173.

Project Structure

The project is organized into two main directories: client for the frontend application and server for the backend API.

studiosync/
├── client/              # React frontend application
│   ├── public/
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── hooks/       # Custom React hooks (useSocket, useWebRTC, etc.)
│       ├── pages/       # Page components for routing
│       ├── App.tsx
│       └── main.tsx
├── server/              # Node.js backend API
│   ├── src/
│   │   ├── certs/       # SSL certificates for HTTPS
│   │   ├── config/      # Database and Passport.js configurations
│   │   ├── controllers/ # Request handlers and business logic
│   │   ├── model/       # Mongoose schemas and models
│   │   ├── routes/      # API route definitions
│   │   └── socket/      # Socket.IO event handlers
│   └── index.ts
└── README.md

Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

    Fork the Project

    Create your Feature Branch (git checkout -b feature/AmazingFeature)

    Commit your Changes (git commit -m 'Add some AmazingFeature')

    Push to the Branch (git push origin feature/AmazingFeature)

    Open a Pull Request

License

Distributed under the MIT License. See LICENSE for more information.
