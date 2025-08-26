"use client";

import type React from "react";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Track {
  id: string;
  videoId: string;
  title: string;
  channel?: string;
  thumbnail?: string;
  order: number;
  requestedBy: string;
  createdAt: string;
}

interface SongQueueProps {
  setQueue: React.Dispatch<React.SetStateAction<Track[]>>;
  queue: Track[];
  currentVideo: Track | null;
  code: string;
}

export function SongQueue({
  setQueue,
  queue,
  currentVideo,
  code,
}: SongQueueProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, trackId: string) => {
    setDraggedItem(trackId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", trackId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedItem !== targetId) {
      setDragOverItem(targetId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drag over if we're leaving the container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragOverItem(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverItem(null);

    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      return;
    }

    const draggedIndex = queue.findIndex((track) => track.id === draggedItem);
    const targetIndex = queue.findIndex((track) => track.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    // Update queue locally first for immediate UI feedback
    const newQueue = [...queue];
    const [draggedTrack] = newQueue.splice(draggedIndex, 1);
    newQueue.splice(targetIndex, 0, draggedTrack);

    // Update order values based on new positions
    const reorderedQueue = newQueue.map((track, index) => ({
      ...track,
      order: index + 1,
    }));

    setQueue(reorderedQueue);
    setDraggedItem(null);

    // Update order on server
    await updateOrder(reorderedQueue);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const updateOrder = async (newQueue: Track[]) => {
    try {
      const response = await fetch(`/api/request/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: code,
          order: newQueue.map((q) => q.id),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Failed to update order:", err);
      // TODO: Show error toast or revert queue order
    }
  };

  const removeFromQueue = async (trackId: string) => {
    setQueue((prev) => prev.filter((track) => track.id !== trackId));
    try {
      const res = await fetch(`/api/request/${trackId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
    } catch (e) {
      console.error(e);
    } finally {
    }
  };

  return (
    <Card className="w-full h-auto py-2">
      <div className="px-2">
        <h3 className="text-sm font-semibold mb-3">Queue ({queue.length})</h3>
        <div className="space-y-1">
          {queue.map((track, index) => (
            <div
              key={track.videoId + index}
              draggable
              onDragStart={(e) => handleDragStart(e, track.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, track.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-grab active:cursor-grabbing transition-colors group",
                currentVideo?.videoId === track.videoId && "bg-muted",
                draggedItem === track.id && "opacity-50"
              )}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={track.thumbnail || "/placeholder.svg"}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      currentVideo?.videoId === track.videoId && "text-primary"
                    )}
                  >
                    {track.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {track.channel}
                  </p>
                </div>

                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {decodeURIComponent(track.requestedBy)}
                </span>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => removeFromQueue(track.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
