import { io } from "socket.io-client";
import { useMemo, useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

const socket = io("https://localhost:3000");

function VideoPage() {
  const [stream, setStream] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    alert(`Room id: ${roomId}`);
    socket.emit("room-id", roomId);
  }, [roomId]);

  async function getUserFeed() {
    try {
      const videoFeed = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(videoFeed);
    } catch (error) {
      alert("User denied video and mic access");
    }
  }

  function joinRoom() {
    if (!joinRoomCode) return;
    socket.emit("join-room", joinRoomCode);
  }

  return (
    <>
      <div className="flex h-[100vh] gap-3 flex-col justify-center items-center">
        <div className="flex gap-3">
          <video
            className="border-2"
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
          ></video>
          <video className="border-2" ref={remoteVideoRef}></video>
        </div>
        <div className="flex flex-col gap-3 w-2xs">
          <button className="border-2 p-2" onClick={() => setRoomId(uuidv4())}>
            Create Room
          </button>
          <button className="border-2 p-2" onClick={getUserFeed}>
            Get Stream
          </button>
          <div className="flex gap-2">
            <input
              className="border-2"
              type="text"
              onChange={(e) => setJoinRoomCode(e.target.value)}
            />
            <button className="border-2 p-2" onClick={joinRoom}>
              Join
            </button>
          </div>
        </div>
        {roomId && <p>RoomId: {roomId}</p>}
      </div>
    </>
  );
}

export default VideoPage;
