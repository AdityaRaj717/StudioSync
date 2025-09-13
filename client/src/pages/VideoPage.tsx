import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useSocket } from "../hooks/useSocket";
import { useMediaStream } from "../hooks/useMediaStream";
import { useWebRTC } from "../hooks/useWebRTC";

import VideoPlayer from "../components/video/VideoPlayer";
import RoomControls from "../components/video/RoomControls";
import CallControls from "../components/video/CallControls";

function VideoPage() {
  const navigate = useNavigate();
  const { socket, myId, clients, setClients } = useSocket(
    "https://localhost:3000"
  );
  const { localStream, getUserFeed } = useMediaStream();
  const [roomId, setRoomId] = useState("");
  const { remoteVideoRef, callUser } = useWebRTC(
    socket,
    localStream,
    roomId,
    myId,
    clients
  );

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleLogout}
          className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        >
          Logout
        </button>
      </div>

      <div className="flex h-screen flex-col justify-center items-center gap-4">
        <p>Your ID: {myId}</p>

        <VideoPlayer
          localStream={localStream}
          remoteVideoRef={remoteVideoRef}
        />

        {!localStream && (
          <button className="border-2 p-2" onClick={getUserFeed}>
            Get Stream
          </button>
        )}

        {localStream && !roomId && (
          <RoomControls
            socket={socket}
            setRoomId={setRoomId}
            setClients={setClients}
          />
        )}

        {roomId && <p>Room ID: {roomId}</p>}

        {clients.length > 1 && (
          <CallControls clients={clients} myId={myId} callUser={callUser} />
        )}
      </div>
    </div>
  );
}

export default VideoPage;
