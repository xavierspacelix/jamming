import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { broadcast } from "@/lib/queueEvents";

export async function POST(req: Request) {
  const { roomCode, order }: { roomCode: string; order: string[] } =
    await req.json();

  try {
    await prisma.$transaction(
      order.map((id, index) =>
        prisma.request.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    const room = await prisma.room.findUnique({ where: { code: roomCode } });
    if (room) {
      const queue = await prisma.request.findMany({
        where: { roomId: room.id },
        orderBy: { order: "asc" },
      });
      broadcast(roomCode, { queue });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to reorder requests" },
      { status: 500 }
    );
  }
}
