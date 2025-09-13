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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
      <div className="bg-card border rounded-lg overflow-hidden">
        <video
          className="w-full h-full object-cover"
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
        />
        <p className="text-center font-semibold p-2 bg-secondary">Your View</p>
      </div>
      <div className="bg-card border rounded-lg overflow-hidden">
        <video
          className="w-full h-full object-cover"
          ref={remoteVideoRef}
          autoPlay
          playsInline
        />
        <p className="text-center font-semibold p-2 bg-secondary">
          Remote View
        </p>
      </div>
    </div>
  );
};

export default VideoPlayer;
