import { NextResponse } from "next/server";
import { ytSearch } from "@/lib/youtube";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json([]);
  const items = await ytSearch(q);
  return NextResponse.json(items);
}
