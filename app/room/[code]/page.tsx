"use client";
import React, { useCallback, useEffect, useState } from "react";
import { MusicPlayer } from "@/components/music-player";
import { SongQueue } from "@/components/song-queue";
import { Button } from "@/components/ui/button";
import { getCookie } from "@/lib/cookies-client";
type RequestRow = {
  id: string;
  videoId: string;
  title: string;
  channel?: string;
  thumbnail?: string;
  order: number;
  requestedBy: string;
  createdAt: string;
};
export default function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const hostName = getCookie("hostName");
  const guestName = getCookie("guestName");
  const { code } = React.use(params);
  const [queue, setQueue] = useState<RequestRow[]>([]);
  const [nowPlaying, setNowPlaying] = useState<RequestRow | null>(null);
  // const [onEnd, setOnEnd] = useState(false);
  const loadQueue = useCallback(async () => {
    const res = await fetch(`/api/request?room=${code}`, { cache: "no-store" });
    if (!res.ok) return;
    const queueData = await res.json();
    setQueue(queueData);
    setNowPlaying(queueData[0] ?? null);
  }, [code]);
  const onEnd = async () => {
    if (!nowPlaying) return;

    try {
      await fetch(`/api/request/${nowPlaying.id}`, { method: "DELETE" });
      loadQueue();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };
  useEffect(() => {
    let es: EventSource | null = null;
    let retryDelay = 1000;
    const maxDelay = 16000;
    let retryTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      es = new EventSource(`/api/socket?room=${code}`);
      es.onopen = () => {
        retryDelay = 1000;
        loadQueue();
      };
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.queue) setQueue(data.queue);
        } catch (err) {
          console.error(err);
        }
      };
      es.onerror = () => {
        es?.close();
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, maxDelay);
      };
    };
    loadQueue();
    connect();

    return () => {
      es?.close();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [loadQueue, code]);
  return (
    <>
      <main className="flex-1">
        <div className="flex flex-1 flex-col gap-4 p-4 mb-2">
          <div className="bg-muted/50" />
          <SongQueue
            setQueue={setQueue}
            queue={queue}
            currentVideo={nowPlaying}
            code={code}
          />
        </div>
      </main>
      <footer className="border-t bg-background mt-auto w-full">
        {guestName === hostName && (
          <MusicPlayer
            currentVideo={nowPlaying}
            endOfVideo={(event) => {
              if (event.data == 0) {
                onEnd();
              }
            }}
          />
        )}

        <div className=" px-1 py-1 w-full">
          {/* Mobile Layout - Stack Vertically */}
          <div className="block sm:hidden">
            <div className="text-center space-y-3">
              <div className="text-base text-muted-foreground font-medium">
                © {new Date().getFullYear()} Jamming Space App. All rights
                reserved.
              </div>
              <p className="text-base text-muted-foreground">
                Made with ❤️ by
                <Button
                  asChild
                  variant={"link"}
                  className="h-auto p-1 text-base font-medium"
                >
                  <a
                    href="https://instagram.com/juanakbarr1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Juan Akbar Indrian
                  </a>
                </Button>
              </p>
            </div>
          </div>

          {/* Desktop Layout - Side by Side */}
          <div className="hidden sm:flex sm:items-center sm:justify-between">
            <div className="text-base text-muted-foreground font-medium">
              © {new Date().getFullYear()} Jamming Space App. All rights
              reserved.
            </div>
            <p className="text-base text-muted-foreground">
              Made with ❤️ by{" "}
              <Button
                asChild
                variant={"link"}
                className="h-auto p-2 text-base font-medium"
              >
                <a
                  href="https://instagram.com/juanakbarr1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Juan Akbar Indrian
                </a>
              </Button>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
