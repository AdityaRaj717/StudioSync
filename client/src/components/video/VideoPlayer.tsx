import { useRef, useEffect } from "react";

interface VideoPlayerProps {
  localStream: MediaStream | null;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  localStream,
  remoteVideoRef,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
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
  );
};

export default VideoPlayer;
