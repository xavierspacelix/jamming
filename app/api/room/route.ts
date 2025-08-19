import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
export async function POST() {
  const code = randomBytes(3).toString("hex").toUpperCase(); // 6 hex chars
  const room = await prisma.room.create({ data: { code } });
  return NextResponse.json(room);
}
