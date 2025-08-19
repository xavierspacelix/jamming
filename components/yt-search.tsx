"use client";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function YtSearch({
  roomCode,
  onPick,
}: {
  roomCode: string;
  onPick: (v: any) => void;
}) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQ = useMemo(() => q, [q]);

  const doSearch = async () => {
    if (!debouncedQ) return setItems([]);
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQ)}`);
    setItems(await res.json());
    setLoading(false);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Cari YouTube..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
          />
          <Button onClick={doSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
        <div className="grid gap-2">
          {items.map((it) => (
            <div
              key={it.videoId}
              className="flex items-center justify-between border rounded-xl p-2"
            >
              <div className="flex items-center gap-3">
                <img
                  src={it.thumbnail}
                  className="w-16 h-10 rounded"
                  alt="thumb"
                />
                <div>
                  <div className="font-medium line-clamp-1">{it.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {it.channel}
                  </div>
                </div>
              </div>
              <Button onClick={() => onPick(it)}>Request</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
