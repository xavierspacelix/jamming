import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
const VoteSchema = z.object({
  requestId: z.string().min(10),
  delta: z.number().int().min(-1).max(1),
});
export async function POST(req: Request) {
  const json = await req.json();
  const parsed = VoteSchema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  const { requestId, delta } = parsed.data;
  const updated = await prisma.request.update({
    where: { id: requestId },
    data: { votes: { increment: delta } },
  });
  return NextResponse.json(updated);
}
