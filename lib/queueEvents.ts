import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;
const publisher = redisUrl ? new Redis(redisUrl, { lazyConnect: true }) : null;
const subs = new Map<ReadableStreamDefaultController, Redis>();

function channel(room: string) {
  return `room:${room}`;
}

export function subscribe(
  room: string,
  controller: ReadableStreamDefaultController
) {
  if (!redisUrl) return;
  const sub = new Redis(redisUrl, { lazyConnect: true });
  subs.set(controller, sub);
  const chan = channel(room);
  sub.subscribe(chan).catch((err) => console.error("redis subscribe", err));
  sub.on("message", (received, message) => {
    if (received !== chan) return;
    try {
      controller.enqueue(`data: ${message}\n\n`);
    } catch (e) {
      console.warn(`removing controller for room ${room}`);
      unsubscribe(room, controller);
    }
  });
}

export function unsubscribe(
  room: string,
  controller: ReadableStreamDefaultController
) {
  const sub = subs.get(controller);
  if (!sub) return;
  const chan = channel(room);
  sub.unsubscribe(chan).finally(() => {
    sub.disconnect();
  });
  subs.delete(controller);
}

export function broadcast(room: string, data: any) {
  if (!publisher) return;
  const payload = JSON.stringify(data);
  publisher.publish(channel(room), payload);
}
