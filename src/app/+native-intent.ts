// Runs before Expo Router resolves an incoming system URL. When another app
// shares a file/text to LinksChat, expo-sharing opens `linkschat://expo-sharing`
// — which matches no route, hence "Unmatched Route". Send those to the
// share-target screen instead.
export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}) {
  try {
    if (new URL(path).hostname === "expo-sharing") {
      return "/share-target";
    }
    return path;
  } catch {
    // Not an absolute URL (e.g. "/chat/123") — let the router handle it as-is.
    return path;
  }
}
