import { NextResponse } from "next/server";
import { ytSearch } from "@/lib/youtube";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  console.log("searchParams : ", searchParams);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json([]);
  const nextPageToken = searchParams.get("nextPageToken") || null;
  const data = await ytSearch(q, nextPageToken);
  return NextResponse.json(data);
}
