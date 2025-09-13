import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface RoomControlsProps {
  socket: any;
  setRoomId: (roomId: string) => void;
  setClients: (clients: string[]) => void;
}

const RoomControls: React.FC<RoomControlsProps> = ({
  socket,
  setRoomId,
  setClients,
}) => {
  const [joinRoomCode, setJoinRoomCode] = useState("");

  const createRoom = () => {
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    socket.emit("room-id", newRoomId);
    alert(`Room created with ID: ${newRoomId}`);
  };

  const joinRoom = () => {
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
  };

  return (
    <div className="flex flex-col gap-3 w-xs">
      <button className="border-2 p-2" onClick={createRoom}>
        Create Room
      </button>
      <div className="flex gap-2">
        <input
          className="border-2"
          type="text"
          onChange={(e) => setJoinRoomCode(e.target.value)}
          placeholder="Enter Room ID"
        />
        <button className="border-2 p-2" onClick={joinRoom}>
          Join
        </button>
      </div>
    </div>
  );
};

export default RoomControls;
