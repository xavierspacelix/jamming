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
  }, [loadQueue]);

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
      await loadQueue();
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
      await loadQueue();
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
        <Button asChild variant={'link'}>
          <Link href={`/room/${code}/player`}>Host Player</Link>
        </Button>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Search YouTube..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loadingSearch}>
          {loadingSearch ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {results.map((r) => (
          <Card
            key={r.videoId}
            className="cursor-pointer"
            onClick={() => addVideo(r)}
          >
            <CardContent className="flex gap-3 items-center">
              <img
                src={r.thumbnail}
                alt={r.title}
                className="w-28 h-16 rounded object-cover"
              />
              <div className="flex-1">
                <div className="font-medium line-clamp-2">{r.title}</div>
                <div className="text-sm text-muted-foreground">{r.channel}</div>
              </div>
              <div className="text-sm text-muted-foreground">Add</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Queue</h2>
        <DataTable columns={columns} data={queue} />
      </div>
    </div>
  );
}
