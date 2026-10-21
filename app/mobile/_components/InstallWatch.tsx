"use client";

import { useEffect } from "react";
import { useGetToken } from "../_lib/use-staff";
import { currentPlatform, isStandalone, recordInstall, watchInstall } from "../_lib/use-install";

// Mounted once in app/mobile/layout.tsx: keeps Android's install prompt for
// later (useInstall) and records the first launch from the Home Screen.
export default function InstallWatch() {
  const getToken = useGetToken();

  useEffect(() => {
    const platform = currentPlatform();
    if (isStandalone()) recordInstall(getToken, platform, "home-screen-launch");
    return watchInstall(() => recordInstall(getToken, platform, "android-prompt"));
  }, [getToken]);

  return null;
}
