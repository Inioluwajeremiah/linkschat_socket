// export const formatDistanceToNow = (date: Date): string => {
//   const now = new Date();
//   const diff = now.getTime() - date.getTime();
//   const secs = Math.floor(diff / 1000);
//   const mins = Math.floor(secs / 60);
//   const hours = Math.floor(mins / 60);
//   const days = Math.floor(hours / 24);

//   if (secs < 60) return "just now";
//   if (mins < 60) return `${mins}m`;
//   if (hours < 24) return `${hours}h`;
//   if (days === 1) return "Yesterday";
//   if (days < 7) return date.toLocaleDateString("en", { weekday: "short" });
//   return date.toLocaleDateString("en", { month: "short", day: "numeric" });
// };

export const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);

  // Just now — under 60 seconds
  if (diffSecs < 60) return "just now";

  // Same calendar day — show actual time (WhatsApp shows time, not "Xh ago")
  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return date.toLocaleTimeString("en", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return "Yesterday";

  // Within the last 7 days — show weekday name
  const diffDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24)
  );

  if (diffDays < 7) {
    return date.toLocaleDateString("en", { weekday: "long" });
  }

  // Older — full date
  return date.toLocaleDateString("en", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return date.toLocaleDateString("en", { weekday: "long" });
  return date.toLocaleDateString("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const isToday = (date: Date): boolean => {
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

export function formatDateSeparator(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
