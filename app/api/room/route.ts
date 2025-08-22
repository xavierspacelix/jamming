import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  const { guestName } = await req.json();
  if (!guestName?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const code = randomBytes(3).toString("hex").toUpperCase();
  const room = await prisma.room.create({
    data: { code, host: guestName.trim() },
  });
  const response = NextResponse.json(room, { status: 201 });
  response.cookies.set("guestName", guestName.trim(), {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.set("hostName", room.host.trim(), {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.set("roomCode", room.code, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}


