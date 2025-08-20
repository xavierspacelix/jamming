"use client";

import React, { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { Play, Pause, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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
    const es = new EventSource(`/api/socket?room=${code}`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.queue) {
          setCurrent(data.queue[0] || null);
          setIsPaused(false);
        }
      } catch (err) {
        console.error(err);
      }
    };
    return () => es.close();
  }, [code]);

  useEffect(() => {
    if (current && playerRef.current) {
      playerRef.current.loadVideoById(current.videoId);
      playerRef.current.playVideo();
      setIsPaused(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [current]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime());
        setDuration(playerRef.current.getDuration());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [current]);

  const onEnd = async () => {
    if (!current) return;

    try {
      await fetch(`/api/request/${current.id}`, { method: "DELETE" });
      await loadQueue();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const skipToNext = async () => {
    await onEnd();
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
    <div className="relative z-10">
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-30"
        style={{ backgroundImage: `url(${current.thumbnail})` }}
      />
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Now Playing
        </h1>
        <div className="w-24 h-1 bg-blue-500 mx-auto mt-1 rounded-full"></div>
      </div>

      {/* Main player card */}
      <div className="bg-white backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-30"
          style={{ backgroundImage: `url(${current.thumbnail})` }}
        />
        {/* Video area */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <YouTube
            videoId={current.videoId}
            opts={{
              width: "100%",
              height: "100%",
              playerVars: {
                autoplay: 1,
                controls: 1,
                modestbranding: 1,
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
        <div className="py-4 px-6">
          {/* Track info */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <img
              src={current.thumbnail}
              alt={current.title}
              className="w-20 h-20 rounded-xl shadow-lg object-cover flex-shrink-0"
            />

            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                {current.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-1">
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
<<<<<<< HEAD
=======
          
          {/* Progress */}
          <div className="w-full mt-4">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-4">
            <Button
              size="icon"
              variant="secondary"
              onClick={togglePause}
            >
              {isPaused ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={skipToNext}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
>>>>>>> 613d868bf04bc8e76187c51ac88b5dbf73e87b8e
        </div>
      </div>
    </div>
  );
}
