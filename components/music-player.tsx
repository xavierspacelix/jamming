"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

type Track = {
  id: string;
  videoId: string;
  title: string;
  channel?: string;
  thumbnail?: string;
  order: number;
  requestedBy: string;
  createdAt: string;
};

export function MusicPlayer({
  currentVideo,
  endOfVideo,
}: {
  currentVideo: Track | null;
  endOfVideo: (event: YouTubeEvent<number>) => void;
}) {
  
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<any>(null);
  const [duration, setDuration] = useState(0);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };
  const onReady = useCallback<NonNullable<YouTubeProps["onReady"]>>((event) => {
    playerRef.current = event.target;
    setDuration(event.target.getDuration());
    playerRef.current.playVideo();
  }, []);
  const onStateChange = useCallback<NonNullable<YouTubeProps["onStateChange"]>>(
    (event) => {
      setIsPlaying(event.data === 1);
    },
    []
  );

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(playerRef.current?.getCurrentTime() || 0);
      setDuration(playerRef.current?.getDuration() || 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        playerRef.current?.playVideo();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);
  return (
    <>
      <div className="p-3 border-b">
        {/* Track Info Section with Controls */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
              <img
                src={currentVideo?.thumbnail || "/placeholder.svg"}
                alt={currentVideo?.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-foreground truncate">
              {currentVideo?.title}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {currentVideo?.channel}
            </p>
          </div>

          {/* Controls on the right */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                if (isPlaying) {
                  playerRef.current?.pauseVideo();
                } else {
                  playerRef.current?.playVideo();
                }
              }}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Section */}
        <div>
          <Slider
            value={[currentTime]}
            onValueChange={(value) => {
              const time = Number(value[0]);
              playerRef.current?.seekTo(time, true);
              setCurrentTime(time);
            }}
            max={duration}
            step={0.1}
            className="w-full mb-1"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <YouTube
        ref={playerRef}
        videoId={currentVideo?.videoId}
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
        onEnd={(event) => {
          setDuration(0);
          setCurrentTime(0);
          endOfVideo(event);
        }}
        onReady={onReady}
        onStateChange={onStateChange}
        className="w-full h-full hidden"
      />
    </>
  );
}
