import { defineConfig, globalIgnores } from "eslint/config";
import nextConfig from "eslint-config-next/core-web-vitals";
import tsPlugin from "@typescript-eslint/eslint-plugin";

// ---------------------------------------------------------------------------
// Local design-system plugin — zero added dependencies.
//
// Rule: no-hardcoded-hex
//   Flags raw hex colour literals (#rrggbb / #rgb) in TSX/TS files.
//   CSS variables from app/globals.css should be used instead.
//   With option { colorFunctions: true } it also flags rgb()/rgba()/hsl()/hsla()
//   literals. Enabled for the public marketing surface only (see the second
//   config block below); dashboard / Mission Control are not covered yet.
//   A var(--token, rgba(...)) fallback is stripped before matching, so it is allowed.
//
// Exclusions (see config block below):
//   app/api/**             — email HTML templates; CSS vars are invalid in email clients
//   lib/email-template.ts  — same rationale; the one shared branded-email template, used by app/api routes
//   lib/cocktails.ts       — colour describes drink appearance (content data, not UI)
//   lib/knowledge-base.ts  — same rationale
//
// Severity: "error" — all TSX/TS files are clean. Any new hardcoded hex will fail CI.
// ---------------------------------------------------------------------------
const sbeDesign = {
  rules: {
    "no-hardcoded-hex": {
      meta: {
        type: "suggestion",
        docs: {
          description:
            "Disallow raw hex colour literals in TSX/TS files; use CSS variables from app/globals.css.",
        },
        messages: {
          foundHex:
            'Hardcoded colour "{{ hex }}" detected. Replace with a CSS variable from app/globals.css.',
        },
        schema: [
          {
            type: "object",
            properties: { colorFunctions: { type: "boolean" } },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        const colorFunctions = Boolean(context.options[0]?.colorFunctions);
        const HEX_RE = colorFunctions
          ? /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b|\b(?:rgba?|hsla?)\(/
          : /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/;

        // Strip var() calls so fallback values — e.g. var(--token, #fallback) — are not flagged.
        function extractHex(str) {
          const stripped = str.replace(/var\([^)]+\)/g, "");
          const m = stripped.match(HEX_RE);
          return m ? m[0] : null;
        }

        return {
          Literal(node) {
            if (typeof node.value !== "string") return;
            const hex = extractHex(node.value);
            if (hex) context.report({ node, messageId: "foundHex", data: { hex } });
          },
          TemplateElement(node) {
            // node.value.cooked is null for invalid escape sequences; fall back to raw
            const raw = node.value.cooked ?? node.value.raw;
            const hex = extractHex(raw);
            if (hex) context.report({ node, messageId: "foundHex", data: { hex } });
          },
        };
      },
    },
  },
};

export default defineConfig([
  // Next.js + TypeScript rules via native flat config (no FlatCompat)
  ...nextConfig,

  globalIgnores([".next/**", ".open-next/**", "out/**", "build/**", "next-env.d.ts", ".claude/**"]),

  {
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      "@next/next/no-page-custom-font": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      // react-hooks v5 rules (new in eslint-config-next v16) — downgraded to warn while
      // the codebase is audited. These patterns are used intentionally throughout the app.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      // Natural-language copy in JSX legitimately contains apostrophes and quotes.
      // Downgraded to warn — the codebase is not using raw entities for security reasons.
      "react/no-unescaped-entities": "warn",
    },
  },

  // Hardcoded-hex guard — applied to all TSX/TS except declared exclusions
  {
    files: ["**/*.tsx", "**/*.ts"],
    ignores: [
      "app/api/**",              // Email HTML templates — CSS vars invalid in email clients
      "lib/email-template.ts",   // Shared branded email template — same rationale
      "lib/cocktails.ts",        // Content data — colours describe drink appearance
      "lib/knowledge-base.ts",   // Content data — same rationale
    ],
    plugins: { "sbe-design": sbeDesign },
    rules: {
      "sbe-design/no-hardcoded-hex": "error",
    },
  },

  // Public marketing surface: also forbid rgb()/rgba()/hsl()/hsla() literals.
  // Use the alpha tokens in app/globals.css (--text-light-*-on-dark, --border-light-*-on-dark,
  // --surface-tint-on-dark, --gold-*-on-dark, --shadow-shot) instead.
  {
    files: [
      "app/page.tsx",
      "app/{about,contact,cookies,demo,for-venues,how-it-works,membership,platform,pricing,privacy,resources,roadmap,roi,security,solutions,terms,toolkit,vs-generic-lms}/**/*.tsx",
      "components/marketing/**/*.tsx",
      "components/ui/**/*.tsx",
      "components/{Navbar,Footer,HeroSection,HeroStickyBar,LogoMarquee,FloatingBookCallButton,BookCallModal}.tsx",
    ],
    plugins: { "sbe-design": sbeDesign },
    rules: {
      "sbe-design/no-hardcoded-hex": ["error", { colorFunctions: true }],
    },
  },
]);
