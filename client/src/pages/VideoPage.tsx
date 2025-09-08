import { useEffect, useState, useRef } from "react";

function VideoPage() {
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  async function getUserFeed() {
    const videoFeed = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setStream(videoFeed);
  }

  return (
    <>
      <div>
        <video ref={videoRef} autoPlay playsInline muted></video>;
        <button className="border-2 p-2" onClick={getUserFeed}>
          Get Stream
        </button>
      </div>
    </>
  );
}

export default VideoPage;
