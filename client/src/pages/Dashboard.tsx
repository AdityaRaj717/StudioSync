import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface Session {
  _id: string;
  roomId: string;
  status: "active" | "completed";
  createdAt: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/sessions`,
          {
            withCredentials: true,
          }
        );
        setSessions(response.data.sessions);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground">
              Here are your recent recording sessions.
            </p>
          </div>
          <Button onClick={() => navigate("/video-page")}>
            Start New Session
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
            <CardDescription>
              View and manage your past recordings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Loading sessions...
                    </TableCell>
                  </TableRow>
                ) : sessions.length > 0 ? (
                  sessions.map((session) => (
                    <TableRow key={session._id}>
                      <TableCell className="font-mono">
                        {session.roomId}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            session.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(session.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled>
                              Download Recording
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                              View Participants
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No sessions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
