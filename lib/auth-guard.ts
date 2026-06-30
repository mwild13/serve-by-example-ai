// Auth state recovery utility — detects and recovers from cookie/localStorage desync
export function checkLocalStorageAuthKeys(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const keys = Object.keys(localStorage);
    return keys.some(k => k.startsWith("sb-"));
  } catch {
    return false;
  }
}

export function clearAllAuthCookies() {
  if (typeof document === "undefined") return;
  try {
    const allCookies = document.cookie.split(";");
    allCookies.forEach(cookie => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.servebyexample.co;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  } catch {}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function forceAuthRecovery(supabase: any) {
  try {
    clearAllAuthCookies();
    await supabase.auth.signOut();
  } catch {}
  // Hard redirect to login
  window.location.href = "/login?error=session_sync_failed";
}