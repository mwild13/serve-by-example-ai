// Management role questions for applicant tests (docs/APPLICANT_TESTING.md §3),
// by topic, like the kitchen bank: running a shift, licensee and RSA duties,
// incidents, backing staff, coaching, cost and waste, cash. Same shape as the
// module quiz bank (lib/question-bank.ts). Only reviewed questions are asked.
// Test principles, not one venue's policy. Not drafted yet.
import type { Question } from "@/lib/question-bank";

/** The bank, by topic. Each is a source for the role quiz. */
export const MANAGEMENT_BANK: { source: string; title: string; questions: Question[] }[] = [];
