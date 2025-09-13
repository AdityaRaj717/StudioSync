import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    alert(
      `Room created with ID: ${newRoomId}\nShare this ID with others to join.`
    );
  };

  const joinRoom = () => {
    if (!joinRoomCode) return;
    socket.emit("join-room", joinRoomCode, (response: any) => {
      switch (response.status) {
        case "no-room":
          alert("No room with that ID found!");
          break;
        case "room-full":
          alert("This room is already full.");
          break;
        case "ok":
          alert("Successfully joined the room!");
          setClients(response.clients);
          setRoomId(joinRoomCode);
          break;
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join a Room</CardTitle>
        <CardDescription>
          Create a new room or enter an existing room ID.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={createRoom} variant="outline">
          Create New Room
        </Button>
        <Separator />
        <div className="flex flex-col gap-2">
          <Input
            type="text"
            value={joinRoomCode}
            onChange={(e) => setJoinRoomCode(e.target.value)}
            placeholder="Enter Room ID to join"
          />
          <Button onClick={joinRoom}>Join Room</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomControls;
