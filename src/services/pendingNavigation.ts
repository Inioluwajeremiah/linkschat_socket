// Navigation requested before the signed-in app is on screen — e.g. tapping
// a notification launches the app, but session restore and the index
// screen's redirect to the tabs haven't happened yet. Navigating that early
// gets lost or replaced by the redirect, so it's held here and run once the
// tabs layout mounts (so Back from the opened screen lands on the tabs).
let ready = false;
let pending: (() => void) | null = null;

export function runWhenAppReady(navigate: () => void) {
  if (ready) navigate();
  else pending = navigate; // only the latest request matters
}

// Called by the tabs layout on mount / unmount.
export function setAppReady(isReady: boolean) {
  ready = isReady;
  if (!isReady) return;
  const navigate = pending;
  pending = null;
  // Let the tabs finish their first render before pushing on top.
  if (navigate) setTimeout(navigate, 0);
}
