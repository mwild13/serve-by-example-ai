// Opens the Stripe billing portal from a staff Settings screen, where a
// paying Pro member changes their card, sees invoices or cancels, and from
// the pricing board, where a paying member moves up to a venue plan. The
// Manager Console has its own caller (components/mission-control/SettingsPanel.tsx).

export type BillingPortalReturn = "management" | "dashboard" | "mobile" | "membership";

/**
 * Sends the browser to the portal. Resolves with an error message to show if
 * it could not be opened; on success the page navigates away and this never
 * resolves with a value worth reading.
 *
 * With `upgradeTo` (a plan key the checkout route accepts) the portal opens
 * on Stripe's page confirming the move to that plan.
 */
export async function openBillingPortal(
  token: string | undefined,
  returnTo: BillingPortalReturn,
  upgradeTo?: string,
): Promise<string | null> {
  try {
    const res = await fetch("/api/billing/portal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ returnTo, ...(upgradeTo ? { upgradeTo } : {}) }),
    });
    const data: { url?: string; error?: string } = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      return data.error ?? "Could not open billing. Please try again or contact support.";
    }
    window.location.href = data.url;
    return null;
  } catch {
    return "Could not reach billing. Check your connection and try again.";
  }
}
