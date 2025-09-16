import { useState, useRef } from "react";
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
import { ArrowLeft, Mic, MicOff } from "lucide-react";

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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const handleStartRecording = () => {
    if (localStream) {
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(localStream, {
        mimeType: "video/webm; codecs=vp9",
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        const fileName = `recording-${roomId}-${myId}.webm`;

        setIsRecording(false);
        alert("Recording stopped. Starting upload...");

        try {
          const presignedUrlResponse = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/s3/presigned-url`,
            { fileName, fileType: blob.type },
            { withCredentials: true }
          );

          const { url } = presignedUrlResponse.data;

          await axios.put(url, blob, {
            headers: { "Content-Type": blob.type },
          });

          alert("Upload successful!");
        } catch (error) {
          console.error("Error uploading file:", error);
          alert("Upload failed. Please check the console for details.");
        }
      };

      recorder.start();
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

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
      <main className="flex-1 flex flex-col justify-center items-center p-6 gap-4">
        {localStream ? (
          <>
            <VideoPlayer
              localStream={localStream}
              remoteVideoRef={remoteVideoRef}
            />
            {/* 4. Add the recording buttons to the UI */}
            <div className="flex gap-4 mt-4">
              <Button
                onClick={
                  isRecording ? handleStopRecording : handleStartRecording
                }
                variant={isRecording ? "destructive" : "default"}
                size="lg"
              >
                {isRecording ? (
                  <MicOff className="mr-2 h-5 w-5" />
                ) : (
                  <Mic className="mr-2 h-5 w-5" />
                )}
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>
            </div>
          </>
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
