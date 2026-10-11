import { redirect } from "next/navigation";

// /auth was a second sign-in and sign-up page. /login is the only one now;
// the query string is carried over so an old link keeps its intent.
// /auth/callback (the OAuth return) is a separate route and is untouched.
export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === "string") params.set(key, value);
  }
  const query = params.toString();
  redirect(query ? `/login?${query}` : "/login");
}
