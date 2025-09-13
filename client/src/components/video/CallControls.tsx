import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { User, Video } from "lucide-react";

interface CallControlsProps {
  clients: string[];
  myId: string;
  callUser: (targetSocketId: string) => void;
  roomId: string;
}

const CallControls: React.FC<CallControlsProps> = ({
  clients,
  myId,
  callUser,
  roomId,
}) => {
  const otherClients = clients.filter((client) => client !== myId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Participants</CardTitle>
        <CardDescription className="break-words">
          Room ID: {roomId}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {otherClients.length > 0 ? (
          otherClients.map((client) => (
            <div
              key={client}
              className="flex justify-between items-center p-2 bg-secondary rounded-md"
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-mono truncate">
                  {client.substring(0, 8)}...
                </span>
              </div>
              <Button onClick={() => callUser(client)} size="sm">
                <Video className="h-4 w-4 mr-2" />
                Call
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Waiting for others to join...
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CallControls;
