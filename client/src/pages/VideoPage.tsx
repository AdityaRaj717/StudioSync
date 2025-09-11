import { io } from "socket.io-client";
import { useCallback, useMemo, useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

function VideoPage() {
  const socket = useMemo(() => io("https://localhost:3000"), []);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [roomId, setRoomId] = useState("");
  const [myId, setMyId] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [clients, setClients] = useState<string[]>([]);

  // UI States
  const [createRoomButton, setCreateRoomButton] = useState(false);
  const [joinButton, setJoinButton] = useState(false);
  const [getStreamButton, setStreamButton] = useState(false);
  const [connectionState, setConnectionState] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Ref to store an offer if it arrives before the peer connection is ready
  const queuedOfferRef = useRef<RTCSessionDescriptionInit | null>(null);

  const getOpponentId = useCallback((): string | null => {
    const opponent = clients.find((client) => client !== myId);
    return opponent || null;
  }, [clients, myId]);

  useEffect(() => {
    socket.on("connect", () => {
      setMyId(socket.id);
    });

    // Show online clients
    socket.on("new-member-joined", (updatedClients: string[]) => {
      setClients(updatedClients);
    });

    // Recieve offer and create answer for the target client
    socket.on("new-offer", async (offer) => {
      // If we don't have a stream/peer connection, queue the offer and get the user's media.
      if (!peerConnectionRef.current) {
        queuedOfferRef.current = offer;
        await getUserFeed();
        return;
      }

      await peerConnectionRef.current.setRemoteDescription(offer);
      console.log("Client received offer and set remote description");

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      console.log("Client sending answer");

      const opponentId = getOpponentId();
      if (opponentId) socket.emit("sending-answer", answer, roomId, opponentId);
    });

    // Recieve the answer from other client
    socket.on("new-answer", async (answer) => {
      if (peerConnectionRef.current && answer) {
        console.log("Caller received answer");
        await peerConnectionRef.current.setRemoteDescription(answer);
      }
    });

    // Recieve Ice Candidates
    socket.on("sendIceToClient", (candidate) => {
      if (peerConnectionRef.current) {
        console.log("Recieving ICE Candidates from server");
        peerConnectionRef.current.addIceCandidate(candidate);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("new-member-joined");
      socket.off("new-offer");
      socket.off("new-answer");
      socket.off("sendIceToClient");
    };
  }, [getOpponentId, socket, roomId]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (!localStream) return;
    const peerConfiguration = {
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302", "stun:stun.l.google.com:5349"],
        },
      ],
    };

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    peerConnectionRef.current = new RTCPeerConnection(peerConfiguration);

    localStream.getTracks().forEach((track) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.addTrack(track, localStream);
      }
    });
    peerConnectionRef.current.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        console.log("Sending ICE Candidates to server");
        const opponentId = getOpponentId();
        if (opponentId) {
          socket.emit("sendIceToServer", event.candidate, roomId, opponentId);
        }
      }
    });
    peerConnectionRef.current.addEventListener("track", (event) => {
      if (remoteVideoRef.current) {
        console.log("Received remote track with streams:", event.streams[0]);
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    });

    // Check if there's a queued offer and process it
    if (queuedOfferRef.current) {
      const offer = queuedOfferRef.current;
      peerConnectionRef.current.setRemoteDescription(offer).then(async () => {
        const answer = await peerConnectionRef.current!.createAnswer();
        await peerConnectionRef.current!.setLocalDescription(answer);
        const opponentId = getOpponentId();
        if (opponentId) {
          socket.emit("sending-answer", answer, roomId, opponentId);
        }
      });
      queuedOfferRef.current = null;
    }
  }, [getOpponentId, roomId, socket, localStream]);

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
          setRoomId(joinRoomCode);
          break;
      }
    });
  }

  async function callUser(targetSocketId: string) {
    if (peerConnectionRef.current) {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log("Calling user created offer");
      socket.emit("sending-offer", offer, roomId, targetSocketId);
      setConnectionState(true);
    } else {
      console.error("Peer connection not initialized");
    }
  }

  return (
    <>
      <div className="flex h-[100vh] gap-3 flex-col justify-center items-center">
        <p>Your ID: {myId}</p>
        <div className="flex gap-3">
          <video
            className="border-2"
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
          ></video>
          <video
            className="border-2"
            ref={remoteVideoRef}
            autoPlay
            playsInline
          ></video>
        </div>
        {!connectionState && (
          <>
            <div className="flex flex-col gap-3 w-2xs">
              {!createRoomButton && !joinButton && (
                <>
                  <button
                    className="border-2 p-2"
                    onClick={() => {
                      setRoomId(uuidv4());
                      setCreateRoomButton(true);
                    }}
                  >
                    Create Room
                  </button>
                  <div className="flex gap-2">
                    <input
                      className="border-2"
                      type="text"
                      onChange={(e) => setJoinRoomCode(e.target.value)}
                    />
                    <button
                      className="border-2 p-2"
                      onClick={() => {
                        joinRoom();
                        setJoinButton(true);
                      }}
                    >
                      Join
                    </button>
                  </div>
                </>
              )}
              {!getStreamButton && (
                <button
                  className="border-2 p-2"
                  onClick={() => {
                    getUserFeed();
                    setStreamButton(true);
                  }}
                >
                  Get Stream
                </button>
              )}
            </div>
          </>
        )}

        {roomId && <p>Room ID: {roomId}</p>}
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
