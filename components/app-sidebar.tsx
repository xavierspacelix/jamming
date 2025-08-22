"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarOptInForm } from "./sidebar-opt-in-form";
import { Label } from "@radix-ui/react-label";
import { Search } from "lucide-react";
import { getCookie } from "@/lib/utils";
import { useParams } from "next/navigation";

type Video = {
  videoId: string;
  title: string;
  channel?: string;
  thumbnail?: string;
};

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const params = useParams();
  const code = params?.code as string;
  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<Video[]>([]);
  const [nextPageToken, setNextPageToken] = React.useState<string | null>(null);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [loadingSearch, setLoadingSearch] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  function applySearchResponse(data: { items: any[]; nextPageToken?: string }) {
    setResults(data.items ?? []);
    setNextPageToken(data.nextPageToken ?? null);
  }
  const handleSearch = async () => {
    if (!q.trim()) return;
    setLoadingSearch(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, {
        cache: "no-store",
      });
      const json = await res.json();
      applySearchResponse(json);
    } catch (e) {
      console.error(e);
      setResults([]);
      setNextPageToken(null);
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
            requestedBy: getCookie("guestName"),
          },
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      // await loadQueue();
    } catch (e) {
      console.error("Add video error:", e);
    } finally {
      setProcessing(false);
    }
  };
  const handleLoadSearch = async () => {
    if (!q.trim() || !nextPageToken) return;
    setLoadingMore(true);
    try {
      const url = new URL("/api/search", window.location.origin);
      url.searchParams.set("q", q.trim());
      url.searchParams.set("nextPageToken", nextPageToken);
      const res = await fetch(url.toString(), { cache: "no-store" });
      console.log(res);

      const json = await res.json();
      setResults((prev) => {
        const merged = [...prev, ...(json.items ?? [])];
        const seen = new Set<string>();
        return merged.filter((it) =>
          seen.has(it.videoId) ? false : (seen.add(it.videoId), true)
        );
      });
      setNextPageToken(json.nextPageToken ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                {/* <IconInnerShadowTop className="!size-5" /> */}
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarGroup className="py-0">
          <SidebarGroupContent className="relative">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <SidebarInput
              id="search"
              placeholder="Search songs, artists..."
              className="pl-8"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2">
          {results.map((r, index) => (
            <SidebarMenuItem key={r.videoId + index}>
              <SidebarMenuButton
                asChild
                onClick={() => addVideo(r)}
                className="p-2 h-auto  transition-colors"
              >
                <div className="flex items-start gap-3 w-full">
                  {r.thumbnail && (
                    <div className="flex-shrink-0">
                      <img
                        src={r.thumbnail}
                        alt={r.title}
                        className="w-16 h-12 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-tight">
                      {r.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {r.channel}
                    </p>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-1">
          <SidebarOptInForm
            nextPageToken={nextPageToken}
            loadMore={handleLoadSearch}
            loading={loadingMore}
            setResult={setResults}
            setNextPageToken={setNextPageToken}
          />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
