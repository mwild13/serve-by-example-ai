# Live App Testing

How to look at the signed-in app (the staff mobile app, the staff desktop, the Manager Console) on a local dev server or a preview, with the QA test account. For agents and for the owner.

## 1. Secrets stay in Cloudflare

- **There is no `.env` file in this repo, on purpose.** Every secret (Supabase, Stripe, OpenAI, Brevo, VAPID) lives only in Cloudflare Pages environment variables.
- **Agents never create, read or ask for an `.env` file**, and never ask for a key in chat. A key is typed by the owner into their own terminal, where it lasts until that terminal is closed.
- **Public values are not secrets.** The Supabase project address and the publishable key ship in every page the browser loads, so they are written out below.

## 2. Supabase keys: the legacy ones are off

- **The legacy JWT keys (`anon` and `service_role`, starting `eyJ`) are turned off** in the Supabase project, by the owner's choice. Never use one, suggest one or ask for one.
- **The keys in use are the new kind:** the publishable key (`sb_publishable_...`, public) and the secret key (`sb_secret_...`, secret).
- **The variable names are the old ones,** in the code and in Cloudflare: `NEXT_PUBLIC_SUPABASE_ANON_KEY` holds the publishable key, and `SUPABASE_SERVICE_ROLE_KEY` holds the secret key. The name is history; the value is always the new key.

## 3. The QA account

| | |
|---|---|
| Email | `mitch+qa@servebyexample.co` |
| Shows as | QA Playwright |
| Set up by | `scripts/e2e/provision-qa-account.mjs` (creates it, finishes onboarding, repairs it if it drifts) |
| Signs in by | `tests/e2e/global-setup.ts`: a one-time sign-in token made with the secret key. No password and no email |
| Saved session | `tests/e2e/.auth/state.json` (gitignored, never commit it) |

- **Use the QA account for every screenshot and every e2e run, never a personal one.** One-device enforcement signs the other session out.
- **Signing into the QA account by hand anywhere else ends the saved session.** Run step 5 in section 6 again to get a new one.
- **Its activity counts in platform-wide numbers.** Filter on the display name `QA Playwright` where that matters.

## 4. Public values

```
NEXT_PUBLIC_SUPABASE_URL=https://gpfwjplqpdehtmtliktf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ORmN7wgraOtKV450DgD4TQ_0Zs79Rrf
```

## 5. Before you start: the secret key

1. Open supabase.com and the project **My Project - AI**.
2. Go to **Project Settings**, then **API Keys**.
3. Under **Secret keys**, reveal the key and click **Copy**. It starts with `sb_secret_`.

## 6. Owner: sign the QA account in and start the app

All in one VS Code terminal (**Terminal**, then **New Terminal**). Paste one line at a time and press Enter after each.

1. Go to the project:
   ```
   cd ~/Desktop/serve-by-example-ai-main
   ```
2. Set the public values and the QA email:
   ```
   export NEXT_PUBLIC_SUPABASE_URL=https://gpfwjplqpdehtmtliktf.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ORmN7wgraOtKV450DgD4TQ_0Zs79Rrf E2E_TEST_EMAIL=mitch+qa@servebyexample.co
   ```
3. Set the secret key. Paste this line, press Enter, then paste the key at the prompt and press Enter. The key doesn't show on screen and isn't saved in the terminal's history:
   ```
   read -rs "SUPABASE_SERVICE_ROLE_KEY?Paste the secret key, then press Enter: " && export SUPABASE_SERVICE_ROLE_KEY && echo " Key set"
   ```
4. **Skip this step** unless step 5 says the QA account doesn't exist or hasn't finished onboarding. The account is already set up. Repairing it sets a new password for it, typed the same hidden way as the key, then runs the repair:
   ```
   read -rs "E2E_TEST_PASSWORD?Type a new QA password, then press Enter: " && export E2E_TEST_PASSWORD && echo " Password set"
   ```
   ```
   node scripts/e2e/provision-qa-account.mjs
   ```
5. Sign the QA account in and save the session. About a minute, ending with `1 passed`:
   ```
   npx playwright test tests/e2e/mobile-screens.spec.ts --project=phone-390x844 -g "portrait phones never"
   ```
6. Start the app and leave this terminal open while the agent works:
   ```
   npm run dev
   ```

When the agent is finished, stop the app with `Ctrl + C` and close the terminal. The key goes with it.

## 7. Agent: looking at the signed-in app

- **Wait for the owner** to say the app is running on `http://localhost:3000`. Never start the server yourself for signed-in work: without the owner's keys it can't sign anyone in.
- **Load the saved session** (`tests/e2e/.auth/state.json`) as Playwright's `storageState`. Never print, read out or copy its contents: it is a live sign-in.
- **Check each changed screen** at 390 by 844 (the owner's iPhone 13 Pro) and at 360 and 430 wide. Check light and dark: dark mode is the `sm-dark` class on `<html>`, or the Settings > Appearance switch.
- **Keep screenshots in `.playwright-mcp/`**, which is gitignored.
- **If a page sends you to `/login`** (with "signed in on another device" when another sign-in replaced it), the session has ended. Ask the owner to run step 5 of section 6 again.

## 8. Against a deployed preview

The same steps 1 to 5 of section 6 in the owner's terminal, with the preview's address in front of step 5:

```
PLAYWRIGHT_BASE_URL='<preview url>' npx playwright test
```

That runs the whole mobile suite against the preview. The marketing suite needs no sign-in: `PLAYWRIGHT_BASE_URL='<preview url>' npx playwright test -c playwright.marketing.config.ts`.
