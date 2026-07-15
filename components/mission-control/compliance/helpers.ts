import { StaffComplianceRecord } from '@/lib/management/types';

/**
 * Normalize expiry date to end-of-day in local timezone before comparison.
 * Prevents "Friday Night" UTC midnight bugs where a date expires prematurely.
 */
export function normalizeExpiryDate(isoDateString: string | null): Date | null {
  if (!isoDateString) return null;
  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) return null;
  // Set to end of day (23:59:59.999) in local timezone
  date.setHours(23, 59, 59, 999);
  return date;
}

/**
 * Calculate days remaining until expiry, accounting for timezone normalization.
 * Returns negative values for expired dates.
 */
export function daysUntilExpiry(isoDateString: string | null): number {
  const expiryDate = normalizeExpiryDate(isoDateString);
  if (!expiryDate) return 0;
  const now = new Date();
  const millisecondsDiff = expiryDate.getTime() - now.getTime();
  return Math.ceil(millisecondsDiff / 86400000);
}

/**
 * RSA compliance status with NSW 28-day re-enrollment rule.
 * Levels: 0 (not recorded), 1 (30+ days remaining), 2 (7 days), 3 (expired).
 */
export function rsaStatus(record: StaffComplianceRecord | undefined): {
  label: string;
  level: 0 | 1 | 2 | 3;
  nsw28Day?: boolean;
} {
  if (!record?.rsaExpiryDate) return { label: 'Not recorded', level: 0 };

  const days = daysUntilExpiry(record.rsaExpiryDate);

  // NSW 28-day rule: if expired >28 days, must complete full SITHFAB021 course
  if (days < -28 && record.rsaJurisdiction === 'NSW') {
    return { label: 'Full Course Required', level: 3, nsw28Day: true };
  }
  if (days < 0) return { label: 'Expired', level: 3 };
  if (days <= 7) return { label: `${days}d`, level: 2 };
  if (days <= 30) return { label: `${days}d`, level: 1 };
  return { label: `${days}d`, level: 0 };
}

/**
 * FSS compliance status with NSW 30-day grace period.
 * When FSS expires or departs, venue has legal 30-day grace to appoint successor.
 * Levels: 0 (not recorded), 1 (grace period active), 2 (grace expiring in 7 days), 3 (grace expired).
 */
export function fssStatus(record: StaffComplianceRecord | undefined): {
  label: string;
  level: 0 | 1 | 2 | 3;
  gracePeriodDaysRemaining?: number;
} {
  if (!record?.fssExpiryDate) return { label: 'Not recorded', level: 0 };

  const days = daysUntilExpiry(record.fssExpiryDate);

  // Not expired yet
  if (days >= 0) return { label: 'Active', level: 0 };

  // Expired: apply grace period (NSW allows 30 days from expiry to appoint successor)
  const daysSinceExpiry = Math.abs(days);
  const graceDaysRemaining = 30 - daysSinceExpiry;

  if (graceDaysRemaining <= 0) {
    // Grace period fully exhausted
    return { label: 'Grace Expired', level: 3, gracePeriodDaysRemaining: 0 };
  }

  if (graceDaysRemaining <= 7) {
    // Grace period expiring in 7 days or less
    return {
      label: `${graceDaysRemaining}d grace left`,
      level: 2,
      gracePeriodDaysRemaining: graceDaysRemaining,
    };
  }

  // Grace period active (8–30 days remaining)
  return {
    label: `Expired — ${graceDaysRemaining}d grace remaining`,
    level: 1,
    gracePeriodDaysRemaining: graceDaysRemaining,
  };
}

/**
 * Combined compliance status (used for Readiness Pills and Shift Scorecard).
 * RSA takes priority; if expired, staff cannot serve. Training completion is
 * factored in so a staff member with 0% training doesn't read as fully "Ready"
 * just because their RSA happens to be on file — see UX overhaul spec, Bottleneck #1.
 */
export function readinessPill(
  compliance: StaffComplianceRecord | undefined,
  status: 'on-track' | 'attention' | 'inactive',
  trainingProgress: number = 100,
): { label: string; dot: string; bg: string; color: string } {
  const rsa = rsaStatus(compliance);

  // "color" is text-on-tint, so it uses the darkened -text tokens (AAA 7:1
  // against the matching -bg tint) rather than the brand-accurate base hue.
  if (rsa.level === 3) {
    return { label: 'At Risk', dot: '●', bg: 'var(--status-error-bg)', color: 'var(--status-error-text)' };
  }
  if (rsa.level === 2 || status === 'attention' || trainingProgress < 25) {
    return { label: 'Caution', dot: '●', bg: 'var(--status-warn-bg)', color: 'var(--status-warn-text)' };
  }
  return { label: 'Ready', dot: '●', bg: 'var(--status-good-bg)', color: 'var(--status-good-text)' };
}
