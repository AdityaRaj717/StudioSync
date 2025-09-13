import { useState } from "react";

export const useMediaStream = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const getUserFeed = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices.", error);
      alert("User denied video and mic access");
      return null;
    }
  };

  return { localStream, getUserFeed };
};
