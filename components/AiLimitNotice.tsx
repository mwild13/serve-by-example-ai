import type { CSSProperties } from "react";
import type { AiDailyLimit } from "@/lib/use-ai-daily-limit";

/**
 * Shown in place of the error line while an account is at its daily AI limit
 * (lib/ai-usage.ts). Says when the limit resets; a free account also gets a
 * link to the plans, which carry a higher limit.
 */
export default function AiLimitNotice({
  limit,
  style,
  linkColor,
}: {
  limit: AiDailyLimit;
  style?: CSSProperties;
  linkColor: string;
}) {
  return (
    <p role="status" style={style}>
      {limit.message}
      {limit.upgrade && (
        <>
          {" "}
          <a href="/membership" style={{ color: linkColor, fontWeight: 600 }}>
            See plans with a higher limit
          </a>
        </>
      )}
    </p>
  );
}
