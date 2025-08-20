"use client";

import React, { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { Play, Pause, SkipForward, Volume2 } from "lucide-react";

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
  const [queue, setQueue] = useState<RequestItem[]>([]);
  const [current, setCurrent] = useState<RequestItem | null>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const loadQueue = async () => {
    try {
      const res = await fetch(`/api/request?room=${code}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await res.text());
      const data: RequestItem[] = await res.json();
      setQueue(data);
      if (data.length > 0) {
        setCurrent(data[0]);
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
          setQueue(data.queue);
          setCurrent(data.queue[0] || null);
        }
      } catch (err) {
        console.error(err);
      }
    };
    return () => es.close();
  }, [code]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime());
        setDuration(playerRef.current.getDuration());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (playerRef.current && current) {
      playerRef.current.loadVideoById(current.videoId);
      playerRef.current.playVideo();
    }
  }, [current]);

  const onEnd = async () => {
    if (!current) return;

    try {
      await fetch(`/api/request/${current.id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete:", err);
    }

  };

  const skipToNext = () => {
    onEnd();
  };
  const onReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target;
    playerRef.current.playVideo();
  };
  const onStateChange: YouTubeProps["onStateChange"] = (event) => {
    switch (event.data) {
      case 1:
        setIsPlaying(true);
        break;
      case 2:
        setIsPlaying(false);
        break;
      case 0:
        onEnd();
        break;
    }
  };
  const togglePlayPause = () => {
    if (!playerRef.current) return;
    const state = playerRef.current.getPlayerState();
    if (state === 1) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
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
                controls: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
              },
            }}
            onEnd={onEnd}
            onReady={onReady}
            onStateChange={onStateChange}
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
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {new Date(currentTime * 1000).toISOString().slice(14, 19)} / {new Date(duration * 1000).toISOString().slice(14, 19)}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlayPause}
                className="p-2 rounded-full bg-blue-500 text-white"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button
                onClick={skipToNext}
                className="p-2 rounded-full bg-blue-500 text-white"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
