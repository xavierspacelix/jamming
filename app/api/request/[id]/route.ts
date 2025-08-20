import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { broadcast } from "@/lib/queueEvents";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const deleted = await prisma.request.delete({
      where: { id },
      include: { room: true },
    });

    const queue = await prisma.request.findMany({
      where: { roomId: deleted.roomId },
      orderBy: { order: "asc" },
    });
    broadcast(deleted.room.code, { queue });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}