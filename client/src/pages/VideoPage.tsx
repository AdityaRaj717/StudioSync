import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../hooks/useSocket";
import { useMediaStream } from "../hooks/useMediaStream";
import { useWebRTC } from "../hooks/useWebRTC";

import VideoPlayer from "../components/video/VideoPlayer";
import RoomControls from "../components/video/RoomControls";
import CallControls from "../components/video/CallControls";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

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
    <div className="flex h-screen bg-background text-foreground">
      {/* Control Panel Sidebar */}
      <aside className="w-80 border-r border-border p-4 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">StreamSync</h1>
          <div className="flex items-center gap-2">
            {/* 3. Add the Link and Button to go back */}
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="destructive-outline"
              size="sm"
            >
              Logout
            </Button>
          </div>
        </div>
        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Your Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Your unique ID:</p>
            <p className="font-mono text-sm break-words">
              {myId || "Connecting..."}
            </p>
          </CardContent>
        </Card>

        {localStream && !roomId && (
          <RoomControls
            socket={socket}
            setRoomId={setRoomId}
            setClients={setClients}
          />
        )}

        {roomId && (
          <CallControls
            clients={clients}
            myId={myId}
            callUser={callUser}
            roomId={roomId}
          />
        )}
      </aside>

      {/* Main Video Stage */}
      <main className="flex-1 flex flex-col justify-center items-center p-6">
        {localStream ? (
          <VideoPlayer
            localStream={localStream}
            remoteVideoRef={remoteVideoRef}
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl font-semibold">Welcome to StreamSync</h2>
            <p className="text-muted-foreground">
              Click the button to start your camera and microphone.
            </p>
            <Button onClick={getUserFeed} size="lg">
              Start Stream
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default VideoPage;
