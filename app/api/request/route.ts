import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/request?room=CODE
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomCode = searchParams.get("room");
    if (!roomCode) return NextResponse.json([], { status: 200 });

    const room = await prisma.room.findUnique({ where: { code: roomCode } });
    if (!room) return NextResponse.json([], { status: 200 });

    const queue = await prisma.request.findMany({
      where: { roomId: room.id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(queue);
  } catch (e) {
    console.error("GET /api/request error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/request
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomCode, video } = body || {};
    if (!roomCode || !video?.id || !video?.title) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({ where: { code: roomCode } });
    if (!room)
      return NextResponse.json({ error: "Room not found" }, { status: 404 });

    // compute next order
    const last = await prisma.request.findFirst({
      where: { roomId: room.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (last?.order ?? 0) + 1;

    const created = await prisma.request.create({
      data: {
        videoId: video.id,
        title: video.title,
        channel: video.channel ?? "",
        thumbnail: video.thumbnail ?? "",
        order: nextOrder,
        roomId: room.id,
      },
    });

    return NextResponse.json(created);
  } catch (e) {
    console.error("POST /api/request error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
