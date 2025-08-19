"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [code, setCode] = useState("");
  const createRoom = async () => {
    const res = await fetch("/api/room", { method: "POST" });
    const data = await res.json();
    window.location.href = `/room/${data.code}`;
  };
  return (
    <div className="grid place-items-center h-[80dvh]">
      <Card className="w-full max-w-xl">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-2xl font-bold">
            🎶 {process.env.NEXT_PUBLIC_APP_NAME || "Jam Request"}
          </h1>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={createRoom}>
              Create Room
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter Room Code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <Button
              variant="secondary"
              onClick={() => code && (window.location.href = `/room/${code}`)}
            >
              Join
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            No login required • Works with YouTube
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
