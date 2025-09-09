import { io } from "socket.io-client";
import { useMemo, useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

function VideoPage() {
  const socket = useMemo(() => io("https://localhost:3000"), []);

  const [localStream, setLocalStream] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [clients, setClients] = useState([]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  socket.on("new-member-joined", (clients) => {
    setClients(clients);
  });

  socket.on("new-offer", (client) => {
    console.log("New offer recieved");
    console.log(client);
    if (socket.id !== client) alert("User Found");
  });

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    alert(`Room id: ${roomId}`);
    socket.emit("room-id", roomId);
  }, [socket, roomId]);

  async function getUserFeed() {
    try {
      const videoFeed = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(videoFeed);
    } catch (error) {
      alert("User denied video and mic access");
    }
  }

  function joinRoom() {
    if (!joinRoomCode) return;
    socket.emit("join-room", joinRoomCode, (response) => {
      switch (response.status) {
        case "no-room":
          alert("No room found!");
          break;
        case "room-full":
          alert("Room is Full!");
          break;
        case "ok":
          alert("Room Joined!");
          setClients(response.clients);
          break;
      }
    });
  }

  const peerConfiguration = {
    iceServers: [
      {
        urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
      },
    ],
  };

  async function callUser() {
    peerConnectionRef.current = new RTCPeerConnection(peerConfiguration);
    localStream.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, localStream);
    });

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socket.emit("sending-offer", offer, joinRoomCode, socket.id);
  }

  return (
    <>
      <div className="flex h-[100vh] gap-3 flex-col justify-center items-center">
        <p>{socket.id}</p>
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
        {roomId && <p>{roomId}</p>}
        {clients.length > 0 && (
          <ul>
            {clients.map((client, index) => (
              <li key={index}>
                {client}{" "}
                <button className="border-2 p-2" onClick={callUser}>
                  Call
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default VideoPage;
