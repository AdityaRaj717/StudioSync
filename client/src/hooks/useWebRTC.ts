import { useEffect, useRef, useCallback } from "react";
import { Socket } from "socket.io-client";

export const useWebRTC = (
  socket: Socket,
  localStream: MediaStream | null,
  roomId: string,
  myId: string,
  clients: string[]
) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const queuedOfferRef = useRef<RTCSessionDescriptionInit | null>(null);

  const getOpponentId = useCallback((): string | null => {
    const opponent = clients.find((client) => client !== myId);
    return opponent || null;
  }, [clients, myId]);

  useEffect(() => {
    if (!localStream) return;

    const peerConfiguration = {
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302", "stun:stun.l.google.com:5349"],
        },
      ],
    };

    const setupPeerConnection = () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      peerConnectionRef.current = new RTCPeerConnection(peerConfiguration);

      localStream.getTracks().forEach((track) => {
        peerConnectionRef.current!.addTrack(track, localStream);
      });

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          const opponentId = getOpponentId();
          if (opponentId) {
            socket.emit("sendIceToServer", event.candidate, roomId, opponentId);
          }
        }
      };

      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
    };

    setupPeerConnection();

    socket.on("new-offer", async (offer) => {
      if (!peerConnectionRef.current) {
        queuedOfferRef.current = offer;
        return;
      }

      await peerConnectionRef.current.setRemoteDescription(offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      const opponentId = getOpponentId();
      if (opponentId) socket.emit("sending-answer", answer, roomId, opponentId);
    });

    socket.on("new-answer", async (answer) => {
      if (peerConnectionRef.current && answer) {
        await peerConnectionRef.current.setRemoteDescription(answer);
      }
    });

    socket.on("sendIceToClient", (candidate) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(candidate);
      }
    });

    return () => {
      socket.off("new-offer");
      socket.off("new-answer");
      socket.off("sendIceToClient");
    };
  }, [localStream, getOpponentId, roomId, socket]);

  const callUser = async (targetSocketId: string) => {
    if (peerConnectionRef.current) {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socket.emit("sending-offer", offer, roomId, targetSocketId);
    }
  };

  return { remoteVideoRef, callUser };
};
