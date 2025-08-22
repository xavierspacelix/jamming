import { subscribe, unsubscribe } from "@/lib/queueEvents";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get("room");
  if (!room) return new Response("room required", { status: 400 });

  let controller: ReadableStreamDefaultController;
  let ping: ReturnType<typeof setInterval>;
  const stream = new ReadableStream({
    start(c) {
      controller = c;
      subscribe(room, c);
      ping = setInterval(() => {
        try {
          c.enqueue("event: ping\n\n");
        } catch {
          clearInterval(ping);
          unsubscribe(room, c);
        }
      }, 15000);
    },
    cancel() {
      clearInterval(ping);
      unsubscribe(room, controller);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
