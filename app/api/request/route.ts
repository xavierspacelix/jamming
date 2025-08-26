import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

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
// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { roomCode, video } = body || {};
//     if (!roomCode || !video?.id || !video?.title) {
//       return NextResponse.json({ error: "Invalid body" }, { status: 400 });
//     }

//     const room = await prisma.room.findUnique({ where: { code: roomCode } });
//     if (!room)
//       return NextResponse.json({ error: "Room not found" }, { status: 404 });

//     // compute next order
//     const last = await prisma.request.findFirst({
//       where: { roomId: room.id },
//       orderBy: { order: "desc" },
//       select: { order: true },
//     });
//     const nextOrder = (last?.order ?? 0) + 1;

//     const created = await prisma.request.create({
//       data: {
//         videoId: video.id,
//         title: video.title,
//         channel: video.channel ?? "",
//         thumbnail: video.thumbnail ?? "",
//         order: nextOrder,
//         roomId: room.id,
//         requestedBy: video.requestedBy,
//       },
//     });

//     const queue = await prisma.request.findMany({
//       where: { roomId: room.id },
//       orderBy: { order: "asc" },
//     });
//     pusher.trigger(`room-${roomCode}`, "queue-update", { queue });

//     return NextResponse.json(created);
//   } catch (e) {
//     console.error("POST /api/request error:", e);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { roomCode, video } = body || {};

    if (!roomCode || !video?.id || !video?.title) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    // 1) Cari room
    const room = await prisma.room.findUnique({
      where: { code: roomCode },
      select: { id: true }, // cukup id saja
    });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // 2) Ambil nilai yang dibutuhkan ke variabel lokal (ini kunci untuk hilangkan error)
    const roomId: string = room.id;

    // 3) Baca requester dari cookie di server (lebih andal daripada dari body)
    const requestedBy = req.cookies.get("guest-name")?.value?.trim() || "Guest";

    // 4) Transaksi: hitung order berikut & create
    const created = await prisma.$transaction(async (tx) => {
      const last = await tx.request.findFirst({
        where: { roomId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      const nextOrder = (last?.order ?? 0) + 1;

      return tx.request.create({
        data: {
          videoId: video.id,
          title: video.title,
          channel: video.channel ?? "",
          thumbnail: video.thumbnail ?? "",
          requestedBy,
          order: nextOrder,
          roomId, // pakai scalar FK yang sudah aman
        },
      });
    });

    // 5) Ambil antrian terbaru & siarkan
    const queue = await prisma.request.findMany({
      where: { roomId },
      orderBy: { order: "asc" },
    });
    try {
      await pusher.trigger(`room-${roomCode}`, "queue-update", { queue });
    } catch {}

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("POST /api/request error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}