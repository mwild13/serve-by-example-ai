# Agents: Serve By Example

Rules for any AI agent working in this repository (Claude Code, Codex, Cursor and the rest). `CLAUDE.md` has the security, stack and design rules and still applies; this file adds the writing rules that agents keep breaking.

## 1. No em dashes or en dashes. Ever.

Do not write `—` (em dash) or `–` (en dash) anywhere a person will read it:

- screen text, buttons, labels, `aria-label`s and error messages
- teaching content: questions, explanations, Learn cards, the Knowledge Base, cocktails, module descriptions, Live Guest briefs, Saturday Rush moments
- emails, notifications and AI prompts (AI output goes through `AU_WRITING_RULES` and `plainDashes()` in `lib/ai-guard.ts`)
- database content and migrations
- docs, handoffs, commit messages, PR text and code comments you add

**What to write instead**, depending on what the dash was doing:

| The dash was | Write | Example |
|---|---|---|
| Adding an explanation | A colon | `Clean glass is critical: residue kills head retention.` |
| Joining two sentences | A full stop | `Partial clearing is not safe. The entire well must be burned.` |
| An aside in the middle | Commas or brackets | `Serve in proper glassware, never a water glass, to lift the drink.` |
| A range | "to" | `24 to 48 hours`, `1 to 1.5 cm` |
| A label and its value | A colon | `Margarita: coupe` |
| An empty table cell | Words | `Not set`, `None` |

Hyphens in words (`pre-shift`, `bar-back`, `30-day`) are fine.

**The check:** `lib/no-dashes.test.ts` fails `npm test` (and CI) if a dash appears outside a comment in staff-facing code and content. If it fails, rewrite the sentence; do not add the file to an ignore list.

## 2. The rest of the house style

- **Australian English:** colour, organise, licence (noun), practise (verb), favourite, metre.
- **Plain words:** say what happens ("Start the drill"), not what it is ("Get started on your learning journey"). No "seamless", "powerful", "unlock", "elevate", "journey" or "everything you need".
- **Buttons** say what happens next. One primary button per screen.
- **No emojis** and no unicode symbols as icons (`✓`, `★`, `→` in text used as an icon). Use `lucide-react`.
- **No invented numbers.** Every figure on a screen comes from data, or it isn't shown.
- **Before you finish:** search what you changed for `—` and `–`.

## 3. Where the design rules live

- Staff desktop (`/dashboard`): `docs/STAFF_APP.md` section 8.
- Staff mobile app (`/mobile`): `docs/MOBILE_BUILD.md`.
- Manager Console: `docs/MANAGER_CONSOLE.md` section 6.
- Marketing site: `docs/Pages-Redesign.md`.

## 4. Before you hand work back

- Run what CI runs: `npm run lint`, `npm run lint:css`, `npm run typecheck`, `npm test` and `npm run knip`.
- If you changed how a screen or feature works, update its doc in the same commit. A doc that describes the old screen is worse than none.
- Delete a throwaway test page or script before committing; never leave one in `app/`.
