import { describe, expect, it } from "vitest";
import { detectInstallPlatform, installBannerDue, isInstallPlatform, parseBannerState } from "./install-platform";

const UA = {
  safari26: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1",
  safari18: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  chromeIos: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/138.0.7204.156 Mobile/15E148 Safari/604.1",
  edgeIos: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 EdgiOS/138.3351.83 Mobile/15E148 Safari/605.1.15",
  instagramIos: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 390.0.0.28.85 (iPhone14,2; iOS 18_6; en_AU; en-AU; scale=3.00; 1170x2532; 739431234)",
  facebookIos: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/520.0.0.38.101;FBBV/750000000;FBDV/iPhone14,2;FBMD/iPhone;FBSN/iOS;FBSV/18.6;FBSS/3;FBID/phone;FBLC/en_GB;FBOP/5]",
  webViewIos: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  ipad: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15",
  chromeAndroid: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36",
  samsung: "Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36",
  webViewAndroid: "Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.0.0 Mobile Safari/537.36",
  instagramAndroid: "Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.0.0 Mobile Safari/537.36 Instagram 390.0.0.43.81 Android",
  macChrome: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
};

describe("detectInstallPlatform", () => {
  it("tells iOS 26 Safari from earlier Safari by its version", () => {
    expect(detectInstallPlatform(UA.safari26)).toBe("ios-safari");
    expect(detectInstallPlatform(UA.safari18)).toBe("ios-safari-legacy");
  });

  it("groups the other iPhone browsers", () => {
    expect(detectInstallPlatform(UA.chromeIos)).toBe("ios-chrome");
    expect(detectInstallPlatform(UA.edgeIos)).toBe("ios-chrome");
  });

  it("spots apps that open links in their own browser", () => {
    expect(detectInstallPlatform(UA.instagramIos)).toBe("in-app-ios");
    expect(detectInstallPlatform(UA.facebookIos)).toBe("in-app-ios");
    expect(detectInstallPlatform(UA.webViewIos)).toBe("in-app-ios");
    expect(detectInstallPlatform(UA.instagramAndroid)).toBe("in-app-android");
    expect(detectInstallPlatform(UA.webViewAndroid)).toBe("in-app-android");
  });

  it("reads an iPad as iOS only when it has touch", () => {
    expect(detectInstallPlatform(UA.ipad, 5)).toBe("ios-safari");
    expect(detectInstallPlatform(UA.ipad, 0)).toBe("desktop");
  });

  it("reads Android browsers", () => {
    expect(detectInstallPlatform(UA.chromeAndroid)).toBe("android-chrome");
    expect(detectInstallPlatform(UA.samsung)).toBe("android-samsung");
  });

  it("calls everything else a computer", () => {
    expect(detectInstallPlatform(UA.macChrome)).toBe("desktop");
  });
});

describe("isInstallPlatform", () => {
  it("accepts only known platforms", () => {
    expect(isInstallPlatform("android-samsung")).toBe(true);
    expect(isInstallPlatform("windows-phone")).toBe(false);
    expect(isInstallPlatform(3)).toBe(false);
  });
});

describe("installBannerDue", () => {
  const day = 86_400_000;
  it("waits for the second visit", () => {
    expect(installBannerDue({ visits: 1, dismissals: 0, dismissedAt: null }, 0)).toBe(false);
    expect(installBannerDue({ visits: 2, dismissals: 0, dismissedAt: null }, 0)).toBe(true);
  });

  it("comes back once, 14 days after the first dismissal", () => {
    expect(installBannerDue({ visits: 5, dismissals: 1, dismissedAt: 0 }, 13 * day)).toBe(false);
    expect(installBannerDue({ visits: 5, dismissals: 1, dismissedAt: 0 }, 14 * day)).toBe(true);
  });

  it("never comes back after a second dismissal", () => {
    expect(installBannerDue({ visits: 9, dismissals: 2, dismissedAt: 0 }, 100 * day)).toBe(false);
  });
});

describe("parseBannerState", () => {
  it("starts over from anything unexpected", () => {
    expect(parseBannerState(null)).toEqual({ visits: 0, dismissals: 0, dismissedAt: null });
    expect(parseBannerState("not json")).toEqual({ visits: 0, dismissals: 0, dismissedAt: null });
    expect(parseBannerState('{"visits":3,"dismissals":1,"dismissedAt":42}')).toEqual({ visits: 3, dismissals: 1, dismissedAt: 42 });
  });
});
