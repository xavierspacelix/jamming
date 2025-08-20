"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Toaster } from "@/components/ui/sonner"; // optional
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableItem } from "@/components/SortableItem";
import { ColumnDef, useReactTable } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Link from "next/link";
import { ArrowBigLeft, ArrowRightToLineIcon } from "lucide-react";

type Video = {
  videoId: string;
  title: string;
  channel?: string;
  thumbnail?: string;
};
type RequestRow = {
  id: string;
  videoId: string;
  title: string;
  channel?: string;
  thumbnail?: string;
  order: number;
  createdAt: string;
};

export default function SearchPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = React.use(params);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Video[]>([]);
  const [queue, setQueue] = useState<RequestRow[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [processing, setProcessing] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    const res = await fetch(`/api/request?room=${code}`);
    if (!res.ok) return;
    setQueue(await res.json());
  }, [code]);

  useEffect(() => {
    loadQueue();
    const es = new EventSource(`/api/socket?room=${code}`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.queue) setQueue(data.queue);
      } catch (err) {
        console.error(err);
      }
    };
    return () => es.close();
  }, [loadQueue, code]);

  const handleSearch = async () => {
    if (!q.trim()) return;
    setLoadingSearch(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const json = await res.json();
      setResults(json || []);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const addVideo = async (v: Video) => {
    setProcessing(true);
    try {
      const res = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: code,
          video: {
            id: v.videoId,
            title: v.title,
            thumbnail: v.thumbnail,
            channel: v.channel,
          },
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      // toast success
    } catch (e) {
      console.error("Add video error:", e);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/request/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const updateOrder = async (newQueue: RequestRow[]) => {
    try {
      await fetch(`/api/request/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, order: newQueue.map((q) => q.id) }),
      });
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newQueue = [...queue];
    [newQueue[index - 1], newQueue[index]] = [
      newQueue[index],
      newQueue[index - 1],
    ];
    setQueue(newQueue);
    updateOrder(newQueue);
  };

  const moveDown = (index: number) => {
    if (index === queue.length - 1) return;
    const newQueue = [...queue];
    [newQueue[index], newQueue[index + 1]] = [
      newQueue[index + 1],
      newQueue[index],
    ];
    setQueue(newQueue);
    updateOrder(newQueue);
  };

  const columns: ColumnDef<RequestRow>[] = [
    {
      accessorKey: "thumbnail",
      header: "Thumbnail",
      cell: ({ row }) => (
        <img
          src={row.original.thumbnail}
          alt={row.original.title}
          className="w-16 h-9 object-cover rounded"
        />
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "channel",
      header: "Channel",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => moveUp(row.index)}
            disabled={row.index === 0}
          >
            ↑
          </Button>
          <Button
            size="sm"
            onClick={() => moveDown(row.index)}
            disabled={row.index === queue.length - 1}
          >
            ↓
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(row.original.id)}
            disabled={loadingId === row.original.id}
          >
            {loadingId === row.original.id ? "Deleting..." : "Delete"}
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold mb-2">Search</h2>
        <Button asChild variant={"link"}>
          <Link href={`/room/${code}/player`}>
            <ArrowRightToLineIcon />
            Host Player
          </Link>
        </Button>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Search YouTube..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        {results.length > 0 && (
          <Button variant={"outline"} onClick={() => setResults([])}>
            Clear
          </Button>
        )}
        <Button onClick={handleSearch} disabled={loadingSearch}>
          {loadingSearch ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* results */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {results.map((r, index) => (
          <>
            <div
              key={r.videoId}
              className="flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition"
              onClick={() => addVideo(r)}
            >
              {/* Index */}
              <span className="w-6 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                {index + 1}
              </span>

              {/* Thumbnail */}
              <img
                src={r.thumbnail}
                alt={r.title}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {r.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {r.channel}
                </p>
              </div>

              {/* Add button */}
              <button
                className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                onClick={(e) => {
                  e.stopPropagation(); // agar klik tombol tidak trigger parent
                  addVideo(r);
                }}
              >
                Add
              </button>
            </div>
          </>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Queue</h2>
        <DataTable columns={columns} data={queue} />
      </div>
    </div>
  );
}
