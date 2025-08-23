"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DoorOpen } from "lucide-react";
import { useState } from "react";
import { setCookieNonHttpOnly } from "@/lib/cookies-client";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);

  async function createRoom() {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }
    setLoadingCreate(true);
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName: name.trim() }),
        cache: "no-store",
      });
      if (!res.ok)
        throw new Error((await res.text()) || "Failed to create room");
      const { code, host } = await res.json();
      setCookieNonHttpOnly("guestName", name.trim(), 60 * 60 * 24 * 30);
      setCookieNonHttpOnly("hostName", host.trim(), 60 * 60 * 24 * 30);
      setCookieNonHttpOnly("roomCode", code, 60 * 60 * 24 * 7);
      window.location.href = `/room/${code}`;
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to create room");
    } finally {
      setLoadingCreate(false);
    }
  }

  async function joinRoom() {
    if (!name.trim() || !code.trim()) {
      alert("Please enter both name and room code.");
      return;
    }
    setLoadingJoin(true);
    try {
      const res = await fetch(`/api/room/validate?code=${code}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) throw new Error((await res.text()) || "Invalid room code");
      const { host } = await res.json();
      setCookieNonHttpOnly("guestName", name.trim(), 60 * 60 * 24 * 30);
      setCookieNonHttpOnly("roomCode", code.trim(), 60 * 60 * 24 * 7);
      setCookieNonHttpOnly("hostName", host.trim(), 60 * 60 * 24 * 7);
      window.location.href = `/room/${code}`;
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to join room");
    } finally {
      setLoadingJoin(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Join with room code or create new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Enter your name to join or create a room
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={64}
                className="text-base placeholder:text-gray-400"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              onClick={createRoom}
              disabled={!name.trim() || loadingCreate}
            >
              {loadingCreate ? "Creating..." : "Create Room"}
            </Button>
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-card text-muted-foreground relative z-10 px-2">
                Or continue with
              </span>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="code">Room Code</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter Room Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={64}
                />
                <Button
                  variant="outline"
                  disabled={!name.trim() || !code.trim() || loadingJoin}
                  onClick={joinRoom}
                >
                  <DoorOpen />
                  {loadingJoin ? "Joining..." : "Join"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
