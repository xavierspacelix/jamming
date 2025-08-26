"use client";

import React, { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { Play, Pause, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Pusher from "pusher-js";

interface RequestItem {
  id: string;
  title: string;
  videoId: string;
  thumbnail: string;
  channel: string;
}

export default function Player({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = React.use(params);
  const [current, setCurrent] = useState<RequestItem | null>(null);
  const playerRef = useRef<any>(null);
  const [isPaused, setIsPaused] = useState(false);

  const loadQueue = async () => {
    try {
      const res = await fetch(`/api/request?room=${code}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await res.text());
      const data: RequestItem[] = await res.json();
      if (data.length > 0) {
        setCurrent(data[0]);
        setIsPaused(false);
      } else {
        setCurrent(null);
      }
    } catch (err) {
      console.error("Failed to load queue:", err);
    }
  };

  useEffect(() => {
    loadQueue();
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "", {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
    });
    const channel = pusher.subscribe(`room-${code}`);
    const handler = (data: { queue: RequestItem[] }) => {
      setCurrent(data.queue[0] || null);
      setIsPaused(false);
    };
    channel.bind("queue-update", handler);
    return () => {
      channel.unbind("queue-update", handler);
      pusher.unsubscribe(`room-${code}`);
      pusher.disconnect();
    };
  }, [code]);

  const onEnd = async () => {
    if (!current) return;

    try {
      await fetch(`/api/request/${current.id}`, { method: "DELETE" });
      window.location.reload();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const skipToNext = () => {
    onEnd();
  };
  const togglePause = () => {
    if (!playerRef.current) return;
    if (isPaused) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
    setIsPaused(!isPaused);
  };
  const onReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target;
    playerRef.current.playVideo();
    setIsPaused(false);
  };
  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center h-screen ">
        <div className="text-6xl mb-4 opacity-50">🎵</div>
        <div className="text-2xl font-light">No videos in queue</div>
        <div className="text-sm opacity-75 mt-2">
          Add some music to get started
        </div>
      </div>
    );
  }

  return (
    // <div className="min-h-screen bg-background text-foreground antialiased">
    //   <div className="mx-auto max-w-7xl">
        <div className="relative z-10 py-8 flex flex-col items-center justify-center w-full h-screen">
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-30"
            style={{ backgroundImage: `url(${current.thumbnail})` }}
          />

          {/* Main player card */}
          <div className="bg-background backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-30"
              style={{ backgroundImage: `url(${current.thumbnail})` }}
            />
            {/* Video area */}
            <div className="relative aspect-video bg-background rounded-lg overflow-hidden">
              <YouTube
                videoId={current.videoId}
                opts={{
                  width: "100%",
                  height: "100%",
                  playerVars: {
                    autoplay: 1,
                    controls: 0,
                    modestbranding: 0,
                    rel: 0,
                    showinfo: 0,
                  },
                }}
                onEnd={onEnd}
                onReady={onReady}
                className="w-full h-full"
              />
            </div>

            {/* Player info and controls */}
            <div className="p-2">
              {/* Track info */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <img
                  src={current.thumbnail}
                  alt={current.title}
                  className="w-20 h-20 rounded-xl shadow-lg object-cover flex-shrink-0"
                />

                <div className="flex-1">
                  <h2 className="text-md font-bold text-gray-900 dark:text-white leading-tight">
                    {current.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                    {current.channel}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-4 h-4" />
                      Now Playing
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className=" relative flex items-center justify-center gap-4 mt-4">
                <Button size="icon" variant="default" onClick={togglePause}>
                  {isPaused ? (
                    <Play className="w-4 h-4" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                </Button>
                <Button size="icon" variant="destructive" onClick={skipToNext}>
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
    //   </div>
    // </div>
  );
}