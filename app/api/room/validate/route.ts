import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim();
  if (!code || !/^[a-zA-Z0-9_-]{4,64}$/.test(code)) {
    return NextResponse.json({ error: "Invalid room code" }, { status: 400 });
  }
  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  return NextResponse.json({ code, host: room.host }, { status: 200 });
}
