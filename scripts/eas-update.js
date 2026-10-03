#!/usr/bin/env node
// Publishes an EAS Update to one channel for Android and iOS only.
//
// `eas update --platform all` also exports web, which fails because the
// Stream WebRTC SDK can't load there. Limiting `platforms` in app.json
// would fix that but changes the fingerprint runtimeVersion, cutting
// existing builds off from updates — so publish each native platform here.
//
// Usage: node scripts/eas-update.js <channel> [extra eas update args]
//   npm run updatePreview -- --message "Fix forwarding"
const { spawnSync } = require("child_process");

const [channel, ...extra] = process.argv.slice(2);
if (!channel) {
  console.error("Usage: node scripts/eas-update.js <channel> [eas args]");
  process.exit(1);
}

for (const platform of ["android", "ios"]) {
  console.log(`\n▶ Publishing ${platform} update to "${channel}"…\n`);
  const { status } = spawnSync(
    "eas",
    [
      "update",
      "--channel",
      channel,
      "--environment",
      channel,
      "--platform",
      platform,
      ...extra,
    ],
    { stdio: "inherit" }
  );
  if (status !== 0) process.exit(status ?? 1);
}
