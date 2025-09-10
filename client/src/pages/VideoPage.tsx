import { io } from "socket.io-client";
import { useMemo, useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

function VideoPage() {
  const socket = useMemo(() => io("https://localhost:3000"), []);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [roomId, setRoomId] = useState("");
  const [myId, setMyId] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [clients, setClients] = useState([]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    socket.on("connect", () => {
      setMyId(socket.id);
    });

    socket.on("new-member-joined", (clients) => {
      setClients(clients);
    });

    socket.on("new-offer", async (offer) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(offer);
        // Sanity Check
        if (peerConnectionRef.current.remoteDescription)
          console.log("Client 2 recieved offer and remote desc set");
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        // Sanity Check
        if (peerConnectionRef.current.localDescription)
          console.log("Client 2 sending answer");

        socket.emit("sending-answer", answer, joinRoomCode);
      } else getUserFeed();
    });

    socket.on("new-answer", (answer) => {
      if (answer) console.log("Caller recieved answer");
    });

    socket.on("sendIceToClient", (candidates) => {
      // peerConnectionRef.current.addIceCandidate(candidates);
    });
  }, [socket, joinRoomCode]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    const peerConfiguration = {
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302", "stun:stun.l.google.com:5349"],
        },
      ],
    };
    if (localStream) {
      peerConnectionRef.current = new RTCPeerConnection(peerConfiguration);
      localStream.getTracks().forEach((track) => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(track, localStream);
        }
      });

      peerConnectionRef.current.addEventListener("icecandidate", (event) => {
        if (event.candidate)
          socket.emit("sendIceToServer", event.candidate, roomId);
      });
    }
  }, [roomId, socket, localStream]);

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
    socket.emit("join-room", joinRoomCode, (response: any) => {
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

  async function callUser() {
    if (peerConnectionRef.current) {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      // Sanity Check
      if (peerConnectionRef.current.localDescription)
        console.log("Calling user created offer");
      socket.emit("sending-offer", offer, joinRoomCode);
    } else {
      console.error("Peer connection not initialized");
    }
  }

  return (
    <>
      <div className="flex h-[100vh] gap-3 flex-col justify-center items-center">
        <p>{myId}</p>
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
            {clients
              .filter((client) => client !== myId)
              .map((client, index) => (
                <li key={index}>
                  {client}{" "}
                  <button
                    className="border-2 p-2"
                    onClick={() => callUser(client)}
                  >
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
