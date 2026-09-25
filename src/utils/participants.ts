// A participant whose account was deleted comes back from the server as
// `{ user: null, ... }` (the populate finds nothing). Everything in the app
// assumes `participant.user` is set, so drop those entries wherever chat
// data comes in — every `participants` array, at any depth.
export function dropDeletedParticipants<T>(value: T): T {
  if (Array.isArray(value)) {
    value.forEach(dropDeletedParticipants);
  } else if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      const child = obj[key];
      if (key === "participants" && Array.isArray(child)) {
        obj[key] = child.filter(
          (p) => !(p && typeof p === "object" && "user" in p && p.user == null)
        );
      }
      dropDeletedParticipants(obj[key]);
    }
  }
  return value;
}

// Non-mutating version for a single chat, safe on frozen (Redux) objects.
export function withLiveParticipants<C extends { participants?: any[] }>(
  chat: C
): C {
  if (!chat?.participants?.some((p) => p?.user == null)) return chat;
  return {
    ...chat,
    participants: chat.participants.filter((p) => p?.user != null),
  };
}
