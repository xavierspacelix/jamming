const rooms = new Map<string, Set<ReadableStreamDefaultController>>();

export function subscribe(room: string, controller: ReadableStreamDefaultController) {
  let set = rooms.get(room);
  if (!set) {
    set = new Set();
    rooms.set(room, set);
  }
  set.add(controller);
}

export function unsubscribe(room: string, controller: ReadableStreamDefaultController) {
  const set = rooms.get(room);
  if (!set) return;
  set.delete(controller);
  if (set.size === 0) {
    rooms.delete(room);
  }
}

export function broadcast(room: string, data: any) {
  const set = rooms.get(room);
  if (!set) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const controller of set) {
    try {
      controller.enqueue(payload);
    } catch (e) {
      // ignore failed controllers
    }
  }
}
