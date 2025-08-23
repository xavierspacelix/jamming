const YT_KEY = process.env.YT_API_KEY!;
export async function ytSearch(q: string, nextPageToken?: string | null) {
  if (!YT_KEY) return [];
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("maxResults", "10");
  url.searchParams.set("type", "video");
  url.searchParams.set("q", q);
  url.searchParams.set("key", YT_KEY);
  if (nextPageToken) url.searchParams.set("pageToken", nextPageToken);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return {
    items: (json.items || []).map((it: any) => ({
      videoId: it.id.videoId,
      title: it.snippet.title,
      channel: it.snippet.channelTitle,
      thumbnail: it.snippet.thumbnails?.medium?.url,
    })),
    nextPageToken: json.nextPageToken,
  };
}
