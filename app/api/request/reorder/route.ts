import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { roomCode, requests } = body || {}; // requests = [{ id, order }, ...]

    if (!roomCode || !Array.isArray(requests)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({ where: { code: roomCode } });
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    await prisma.$transaction(
      requests.map((r: any) => prisma.request.update({ where: { id: r.id }, data: { order: r.order } }))
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("PUT /api/request/reorder error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
